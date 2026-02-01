import { useState, useEffect, useCallback } from 'react';
import SuccessScreen from '../create-tasks/components/SuccessScreen';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateTasksWithProgress } from '../../hooks/useApi';
import { PlanningPlatform, PLATFORM_CONFIGS, PLATFORM_WITH_CODE_REPOSITORY, integrationService } from '../../lib';
import GitHubRepositorySelector from '../../components/GitHubRepositorySelector';
import JiraProjectSelector from '../../components/JiraProjectSelector';
import FileUpload from '../../components/FileUpload';
import { logger } from '../../lib/utils/logger';
import IntegrationsModal from '../../components/IntegrationsModal';
import { useRepository } from '../../context/RepositoryContext';
import { styles } from './styles';

export default function DirectCreateTasks() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<PlanningPlatform>('jira');
  const [textInput, setTextInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { repositoryOwner, setRepositoryOwner, repositoryName, setRepositoryName } = useRepository();
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [autoAssignResources, setAutoAssignResources] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const { 
    createTasksWithProgress, 
    loading: isCreating, 
    error, 
    progress, 
    taskProgress, 
    completed 
  } = useCreateTasksWithProgress();

  const needsRepo = PLATFORM_WITH_CODE_REPOSITORY.includes(selectedPlatform);

  const checkConnections = useCallback(() => {
    const connected = integrationService.getProviders()
      .filter(p => p.connected)
      .map(p => p.id);
    
    setConnectedPlatforms(connected);
  }, []);

  useEffect(() => {
    checkConnections();
    // Also refresh from server
    integrationService.fetchUserIntegrations().then(checkConnections);
  }, [checkConnections]);

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
    // Clear text input when file is uploaded
    if (files.length > 0) {
      setTextInput('');
    }
  };

  const handleSubmit = async () => {
    if (!textInput.trim() && uploadedFiles.length === 0) {
      return;
    }

    const requestData = {
      planningPlatform: selectedPlatform,
      textInput: textInput.trim() || undefined,
      tasks: uploadedFiles[0] || undefined,
      autoAssignResources,
      repositoryName: needsRepo ? repositoryName : undefined,
      repositoryOwner: needsRepo ? repositoryOwner : undefined,
      jiraProjectKey: selectedPlatform === 'jira' ? jiraProjectKey : undefined,
    };

    try {
      await createTasksWithProgress(requestData);
    } catch {
      logger.error('Error creating tasks');
    }
  };

  const handleSuccess = () => {
    navigate('/');
  };

  // Show success state
  if (completed) {
    return (
      <SuccessScreen
        platform={selectedPlatform}
        tasks={[]}
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        jiraProjectKey={jiraProjectKey}
        onContinue={handleSuccess}
      />
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={styles.backButton}
            >
              <ArrowLeft className={styles.backIcon} />
              <span className={styles.backText}>Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            Create Tasks
          </h1>
          <p className={styles.subtitle}>
            Select a platform and create actionable tasks
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.section.marginBottom}>
            <h2 className={styles.section.title}>
              Choose Your Platform
            </h2>
            <p className={styles.section.subTitle}>
              Select where you want to create your tasks
            </p>
            <div className={styles.platformGrid}>
              {PLATFORM_CONFIGS.map((p) => {
                const isConnected = connectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (isConnected) {
                        setSelectedPlatform(p.id);
                      } else {
                        setIsIntegrationsModalOpen(true);
                      }
                    }}
                    className={`
                      ${styles.platformButton.base}
                      ${selectedPlatform === p.id
                        ? styles.platformButton.active
                        : isConnected
                          ? styles.platformButton.connected
                          : styles.platformButton.disabled
                      }
                    `}
                  >
                    <div className={styles.platformButton.content}>
                      <span>{p.name}</span>
                      {!isConnected && <span className={styles.platformButton.needsSetup}>Needs Setup</span>}
                    </div>
                    {p.description && (
                      <div className={styles.platformButton.description}>
                        {p.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {needsRepo && (
            <div className={styles.section.marginBottom}>
              <h3 className={styles.section.h3}>
                Repository Information
              </h3>
              {connectedPlatforms.includes('github') ? (
                <GitHubRepositorySelector
                  repositoryOwner={repositoryOwner}
                  repositoryName={repositoryName}
                  onRepositoryOwnerChange={setRepositoryOwner}
                  onRepositoryNameChange={setRepositoryName}
                  disabled={isCreating}
                  onIntegrationRequired={() => navigate('/integrations')}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={styles.section.labelDark}>
                      Repository Owner
                    </label>
                    <input
                      type="text"
                      value={repositoryOwner}
                      onChange={(e) => setRepositoryOwner(e.target.value)}
                      className={styles.input.text}
                      placeholder="username or organization"
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.section.label}>
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={repositoryName}
                      onChange={(e) => setRepositoryName(e.target.value)}
                      className={styles.input.text}
                      placeholder="repository-name"
                      required
                    />
                  </div>
                </div>
              )}
              {!connectedPlatforms.includes('github') && !connectedPlatforms.includes('gitlab') && (
                <div className={styles.tip.container}>
                  <p className={styles.tip.text}>
                    💡 <strong>Tip:</strong> Connect your GitHub or GitLab account to easily select repositories from a dropdown instead of typing manually.
                  </p>
                  <button
                    onClick={() => setIsIntegrationsModalOpen(true)}
                    className={styles.tip.button}
                  >
                    Connect GitHub or GitLab →
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedPlatform === 'jira' && (
            <div className={styles.section.marginBottom}>
              <h3 className={styles.section.h3}>
                Jira Project Information
              </h3>
              {connectedPlatforms.includes('jira') ? (
                <JiraProjectSelector
                  projectKey={jiraProjectKey}
                  onProjectKeyChange={setJiraProjectKey}
                  disabled={isCreating}
                  onIntegrationRequired={() => navigate('/integrations')}
                />
              ) : (
                <div>
                  <label className={styles.section.label}>
                    Jira Project Key
                  </label>
                  <input
                    type="text"
                    value={jiraProjectKey}
                    onChange={(e) => setJiraProjectKey(e.target.value)}
                    className={styles.input.text}
                    placeholder="Enter project key (e.g., PROJ)"
                    required
                  />
                  <div className={styles.tip.container}>
                    <p className={styles.tip.text}>
                      💡 <strong>Tip:</strong> Connect your Jira account to easily select projects from a dropdown instead of typing manually.
                    </p>
                    <button
                        onClick={() => setIsIntegrationsModalOpen(true)}
                      className={styles.tip.button}
                    >
                      Connect Jira →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.section.marginBottom}>
            <h3 className={styles.section.h3}>
              Task Input
            </h3>
            
            {/* File Upload Section */}
            <div className={styles.section.fileUploadContainer}>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={handleFilesChange}
                accept=".docx"
                multiple={false}
                maxFiles={1}
                placeholder="Drop DOCX file here or click to browse"
                description="Upload a document with your tasks"
                allowedTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                allowedExtensions={['.docx']}
              />
            </div>

            <div className={styles.divider.container}>
              <div className={styles.divider.line}></div>
              <span className={styles.divider.text}>OR</span>
              <div className={styles.divider.line}></div>
            </div>

            {/* Text Input Section */}
            <div>
              <label className={styles.section.label}>
                Describe your tasks
              </label>
              <textarea
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  // Clear file when text is entered
                  if (e.target.value.trim() && uploadedFiles.length > 0) {
                    setUploadedFiles([]);
                  }
                }}
                className={styles.input.textarea}
                placeholder="Describe your tasks, requirements, or paste task descriptions..."
                disabled={uploadedFiles.length > 0}
              />
            </div>
          </div>

          <div className={styles.section.marginBottom}>
            <label className={styles.checkbox.container}>
              <input
                type="checkbox"
                checked={autoAssignResources}
                onChange={(e) => setAutoAssignResources(e.target.checked)}
                className={styles.checkbox.input}
              />
              <span className={styles.checkbox.label}>
                Auto-assign resources
              </span>
            </label>
          </div>

          {error && (
            <div className={styles.status.error}>
              <div className={styles.status.errorHeader}>
                <AlertCircle className={styles.status.errorIcon} />
                <span className={styles.status.errorTitle}>Error</span>
              </div>
              <p className={styles.status.errorMessage}>{error}</p>
            </div>
          )}

          {isCreating && (
            <div className={styles.status.progress}>
              <div className={styles.status.progressHeader}>
                <Loader2 className={styles.status.progressIcon} />
                <span className={styles.status.progressTitle}>Creating Tasks...</span>
              </div>
              {progress && (
                <div className={styles.status.progressMessage}>
                  {progress}
                </div>
              )}
              {taskProgress && taskProgress.length > 0 && (
                <div className={styles.status.progressMessage}>
                  Task {taskProgress.length} of {taskProgress[0]?.totalTasks || 'unknown'}: {taskProgress[0]?.taskName || 'Processing...'}
                </div>
              )}
            </div>
          )}

          <div className={styles.actions.container}>
            <button
              onClick={() => navigate('/')}
              className={styles.actions.cancel}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating || (!textInput.trim() && uploadedFiles.length === 0) || (needsRepo && (!repositoryName || !repositoryOwner)) || (selectedPlatform === 'jira' && !jiraProjectKey)}
              className={styles.actions.submit}
            >
              {isCreating && <Loader2 className={styles.actions.spinner} />}
              Create Tasks
            </button>
          </div>
        </div>
      </main>

      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        onStatusChange={checkConnections}
      />
    </div>
  );
}
