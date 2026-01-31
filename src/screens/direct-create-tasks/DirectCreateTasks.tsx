import { useState, useEffect } from 'react';
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
import { useCallback } from 'react';

export default function DirectCreateTasks() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<PlanningPlatform>('jira');
  const [textInput, setTextInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [repositoryName, setRepositoryName] = useState('');
  const [repositoryOwner, setRepositoryOwner] = useState('');
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create Tasks</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Choose Your Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Select where you want to create your tasks
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col items-start gap-1 ${selectedPlatform === p.id
                      ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                      : isConnected
                        ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed grayscale'
                      }`}
                  >
                    <div className="font-medium flex items-center justify-between w-full">
                      <span>{p.name}</span>
                      {!isConnected && <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">Needs Setup</span>}
                    </div>
                    {p.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {p.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {needsRepo && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
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
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Repository Owner
                    </label>
                    <input
                      type="text"
                      value={repositoryOwner}
                      onChange={(e) => setRepositoryOwner(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      placeholder="username or organization"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={repositoryName}
                      onChange={(e) => setRepositoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      placeholder="repository-name"
                      required
                    />
                  </div>
                </div>
              )}
              {!connectedPlatforms.includes('github') && !connectedPlatforms.includes('gitlab') && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> Connect your GitHub or GitLab account to easily select repositories from a dropdown instead of typing manually.
                  </p>
                  <button
                    onClick={() => setIsIntegrationsModalOpen(true)}
                    className="mt-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Connect GitHub or GitLab →
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedPlatform === 'jira' && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jira Project Key
                  </label>
                  <input
                    type="text"
                    value={jiraProjectKey}
                    onChange={(e) => setJiraProjectKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                    placeholder="Enter project key (e.g., PROJ)"
                    required
                  />
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> Connect your Jira account to easily select projects from a dropdown instead of typing manually.
                    </p>
                    <button
                        onClick={() => setIsIntegrationsModalOpen(true)}
                      className="mt-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                    >
                      Connect Jira →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Task Input
            </h3>
            
            {/* File Upload Section */}
            <div className="mb-6">
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

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Text Input Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                placeholder="Describe your tasks, requirements, or paste task descriptions..."
                disabled={uploadedFiles.length > 0}
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={autoAssignResources}
                onChange={(e) => setAutoAssignResources(e.target.checked)}
                className="w-4 h-4 text-blue-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-700 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-assign resources
              </span>
            </label>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300 font-medium">Error</span>
              </div>
              <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          )}

          {isCreating && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />
                <span className="text-blue-700 dark:text-blue-300 font-medium">Creating Tasks...</span>
              </div>
              {progress && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {progress}
                </div>
              )}
              {taskProgress && taskProgress.length > 0 && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Task {taskProgress.length} of {taskProgress[0]?.totalTasks || 'unknown'}: {taskProgress[0]?.taskName || 'Processing...'}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating || (!textInput.trim() && uploadedFiles.length === 0) || (needsRepo && (!repositoryName || !repositoryOwner)) || (selectedPlatform === 'jira' && !jiraProjectKey)}
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
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
