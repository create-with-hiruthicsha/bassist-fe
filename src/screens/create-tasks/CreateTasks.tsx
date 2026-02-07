import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateTasksWithProgress } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { TaskBreakdown, PlanningPlatform, PLATFORM_WITH_CODE_REPOSITORY } from '../../lib';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import FileUpload from '../../components/FileUpload';
import { logger } from '../../lib/utils/logger';
import SuccessScreen from './components/SuccessScreen';
import IntegrationsModal from '../../components/IntegrationsModal';
import { useRepository } from '../../context/RepositoryContext';
import { styles } from './styles';

export default function CreateTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<PlanningPlatform | ''>('');
  const [textInput, setTextInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [tasks, setTasks] = useState<TaskBreakdown | undefined>(undefined);
  const { repositoryOwner, setRepositoryOwner, repositoryName, setRepositoryName } = useRepository();
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [autoAssignResources, setAutoAssignResources] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [platformRefreshKey, setPlatformRefreshKey] = useState(0);

  const { 
    createTasksWithProgress, 
    loading: isCreating, 
    error, 
    progress, 
    taskProgress, 
    completed 
  } = useCreateTasksWithProgress();

  const needsRepo = selectedPlatform ? PLATFORM_WITH_CODE_REPOSITORY.includes(selectedPlatform as PlanningPlatform) : false;

  const handleIntegrationsStatusChange = useCallback(() => {
    setPlatformRefreshKey((prev) => prev + 1);
  }, []);

  // Load tasks and platform from session storage
  useEffect(() => {
    const storedTasks = sessionStorage.getItem('generatedTasks');
    const storedPlatform = sessionStorage.getItem('selectedPlatform');
    
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch {
        logger.error('Failed to parse stored tasks');
      }
    }
    
    if (storedPlatform) {
      setSelectedPlatform(storedPlatform as PlanningPlatform);
    }
  }, []);

  // Auto-populate text input with task breakdown JSON
  useEffect(() => {
    if (tasks && !textInput) {
      const taskJson = JSON.stringify(tasks, null, 2);
      setTextInput(taskJson);
    }
  }, [tasks, textInput]);

  const handleCreate = async () => {
    if (!selectedPlatform) {
      return;
    }

    try {
      const request = {
        planningPlatform: selectedPlatform,
        textInput: textInput || undefined,
        tasks: uploadedFiles[0] || undefined,
        autoAssignResources,
        repositoryName: needsRepo ? repositoryName : undefined,
        repositoryOwner: needsRepo ? repositoryOwner : undefined,
        jiraProjectKey: selectedPlatform === 'jira' ? jiraProjectKey : undefined,
        defaultAssignee: (!autoAssignResources && user) ? { id: user.id, name: user.user_metadata?.full_name || user.email } : undefined,
      };

      await createTasksWithProgress(request);
    } catch {
      logger.error('Failed to create tasks');
    }
  };

  // Handle completion
  useEffect(() => {
    if (completed) {
      // Clear session storage
      sessionStorage.removeItem('generatedTasks');
      sessionStorage.removeItem('selectedPlatform');
      setShowSuccess(true);
    }
  }, [completed]);

  const handleContinue = () => {
    navigate('/');
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        platform={selectedPlatform}
        tasks={taskProgress}
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        jiraProjectKey={jiraProjectKey}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader backTo="/tasks" />

      <main className={pageMainClasses}>
        <PageTitle
          title="Create Tasks"
          subtitle="Select a platform and create actionable tasks"
        />
        <div className={styles.contentSpace}>
          {/* Platform + Resource Selection */}
          <div className={styles.section.container}>
            <PlatformSelectorWithResources
              selectedPlatform={selectedPlatform}
              onSelectedPlatformChange={setSelectedPlatform}
              repositoryOwner={repositoryOwner}
              repositoryName={repositoryName}
              onRepositoryOwnerChange={setRepositoryOwner}
              onRepositoryNameChange={setRepositoryName}
              gitlabProjectId={''}
              onGitlabProjectIdChange={() => { /* gitlab not yet wired for CreateTasks */ }}
              jiraProjectKey={jiraProjectKey}
              onJiraProjectKeyChange={setJiraProjectKey}
              disabled={isCreating}
              onRequireIntegrations={() => setIsIntegrationsModalOpen(true)}
              refreshKey={platformRefreshKey}
            />
          </div>

          {/* Task Input Options */}
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>
              Task Input (Auto-populated with generated tasks)
            </h3>
            
            {/* File Upload */}
            <div className={styles.section.marginBottom}>
              <label className={styles.section.label}>
                Upload DOCX File
              </label>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                accept=".docx"
                multiple={false}
                maxFiles={1}
                placeholder="Click to upload tasks file"
                description="DOCX files only, max 10MB"
                allowedTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                allowedExtensions={['.docx']}
              />
            </div>

            {/* Text Input */}
            <div>
              <label className={styles.section.label}>
                Task Details (JSON format)
              </label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                This field is automatically populated with your generated tasks (including any edits you made). 
                You can modify the JSON directly if needed.
              </p>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Task breakdown in JSON format (auto-populated from generated tasks)..."
                className={styles.input.textarea}
              />
            </div>
          </div>

          {/* Options */}
          <div className={styles.section.container}>
            <h3 className={styles.section.title}>Options</h3>
            {/* <label className={styles.options.container}>
              <input
                type="checkbox"
                checked={autoAssignResources}
                onChange={(e) => setAutoAssignResources(e.target.checked)}
                className={styles.options.checkbox}
              />
              {/* <span className={styles.options.label}>
                Auto-assign resources
              </span> */}
            {/* </label> */}
          </div>

          {/* Task Summary */}
          {tasks && (
            <div className={styles.summary.container}>
              <div className={styles.summary.header}>
                <h3 className={styles.summary.title}>Generated Task Summary</h3>
                <span className={styles.summary.count}>{tasks.summary.number_of_tasks} tasks</span>
              </div>
              <div className={styles.summary.grid}>
                <div>
                  <span className={styles.summary.value}>{tasks.summary.number_of_epics}</span>
                  <span className={styles.summary.label}>epics</span>
                </div>
                <div>
                  <span className={styles.summary.value}>{tasks.summary.number_of_tasks}</span>
                  <span className={styles.summary.label}>tasks</span>
                </div>
                <div>
                  <span className={styles.summary.value}>{tasks.summary.total_estimated_hours}</span>
                  <span className={styles.summary.label}>hours</span>
                </div>
                <div>
                  <span className={styles.summary.value}>{Math.ceil(tasks.summary.total_estimated_hours / 8)}</span>
                  <span className={styles.summary.label}>days</span>
                </div>
              </div>
              <div className={styles.summary.listContainer}>
                {tasks.epics.slice(0, 2).map((epic, epicIdx) => (
                  <div key={epicIdx} className={styles.summary.epicCard}>
                    <div className={styles.summary.epicName}>{epic.name}</div>
                    <div className={styles.summary.epicCount}>{epic.tasks.length} tasks</div>
                  </div>
                ))}
                {tasks.epics.length > 2 && (
                  <div className={styles.summary.moreEpics}>
                    +{tasks.epics.length - 2} more epics
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Display */}
          {isCreating && (
            <div className={styles.progress.container}>
              <div className={styles.progress.header}>
                <Loader2 className={styles.progress.spinner} />
                <h3 className={styles.progress.title}>Creating Tasks</h3>
              </div>
              
              {/* Progress Message */}
              {progress && (
                <div className="mb-4">
                  <p className={styles.progress.message}>{progress}</p>
                </div>
              )}

              {/* Progress Bar */}
              {taskProgress.length > 0 && (
                <div className={styles.progress.barContainer}>
                  <div className={styles.progress.barHeader}>
                    <span>Progress</span>
                    <span>{taskProgress.length} of {taskProgress[0]?.totalTasks || 0} tasks</span>
                  </div>
                  <div className={styles.progress.barBg}>
                    <div 
                      className={styles.progress.barFill}
                      style={{ 
                        width: `${taskProgress.length > 0 ? (taskProgress.length / (taskProgress[0]?.totalTasks || 1)) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Task List */}
              {taskProgress.length > 0 && (
                <div className={styles.progress.listContainer}>
                  <h4 className={styles.progress.listTitle}>Completed Tasks:</h4>
                  <div className={styles.progress.list}>
                    {taskProgress.map((task, index) => (
                      <div key={index} className={styles.progress.listItem}>
                        <CheckCircle2 className={styles.progress.listItemIconDone} />
                        <span className={styles.progress.listItemText}>{task.taskName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className={styles.error.container}>
              <AlertCircle className={styles.error.icon} />
              <span className={styles.error.text}>{error}</span>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || (needsRepo && (!repositoryName || !repositoryOwner)) || (selectedPlatform === 'jira' && !jiraProjectKey)}
            className={styles.button.create}
          >
            {isCreating ? (
              <>Creating Tasks...</>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Create Tasks
              </>
            )}
          </button>
        </div>
      </main>

      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        onStatusChange={handleIntegrationsStatusChange}
      />
    </div>
  );
}
