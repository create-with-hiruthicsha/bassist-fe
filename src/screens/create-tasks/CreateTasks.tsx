import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCreateTasksWithProgress } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { TaskBreakdown, PlanningPlatform, PLATFORM_WITH_CODE_REPOSITORY, integrationService } from '../../lib';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import FileUpload from '../../components/FileUpload';
import { logger } from '../../lib/utils/logger';
import SuccessScreen from './components/SuccessScreen';
import IntegrationsModal from '../../components/IntegrationsModal';
import { useCallback } from 'react';

export default function CreateTasks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskBreakdown | undefined>(undefined);
  const [platform, setPlatform] = useState<PlanningPlatform>('' as PlanningPlatform);
  const [selectedPlatform, setSelectedPlatform] = useState<PlanningPlatform>(platform);
  const [textInput, setTextInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [repositoryName, setRepositoryName] = useState('');
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [autoAssignResources, setAutoAssignResources] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
      setPlatform(storedPlatform as PlanningPlatform);
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Create Tasks
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Configure platform and create your tasks</p>
        </div>

        <div className="space-y-6">
          {/* Platform + Resource Selection */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
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
            />
          </div>

          {/* Task Input Options */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Task Input (Auto-populated with generated tasks)
            </h3>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
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
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
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
                className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Options */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssignResources}
                onChange={(e) => setAutoAssignResources(e.target.checked)}
                className="w-5 h-5 text-blue-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-700 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                Auto-assign resources
              </span>
            </label>
          </div>

          {/* Task Summary */}
          {tasks && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Generated Task Summary</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{tasks.summary.number_of_tasks} tasks</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{tasks.summary.number_of_epics}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">epics</span>
                </div>
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{tasks.summary.number_of_tasks}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">tasks</span>
                </div>
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{tasks.summary.total_estimated_hours}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">hours</span>
                </div>
                <div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{Math.ceil(tasks.summary.total_estimated_hours / 8)}</span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">days</span>
                </div>
              </div>
              <div className="space-y-2">
                {tasks.epics.slice(0, 2).map((epic, epicIdx) => (
                  <div key={epicIdx} className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 px-3 py-2 rounded">
                    <div className="font-medium">{epic.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{epic.tasks.length} tasks</div>
                  </div>
                ))}
                {tasks.epics.length > 2 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2">
                    +{tasks.epics.length - 2} more epics
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Display */}
          {isCreating && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Creating Tasks</h3>
              </div>
              
              {/* Progress Message */}
              {progress && (
                <div className="mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">{progress}</p>
                </div>
              )}

              {/* Progress Bar */}
              {taskProgress.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mb-2">
                    <span>Progress</span>
                    <span>{taskProgress.length} of {taskProgress[0]?.totalTasks || 0} tasks</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${taskProgress.length > 0 ? (taskProgress.length / (taskProgress[0]?.totalTasks || 1)) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Task List */}
              {taskProgress.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">Completed Tasks:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {taskProgress.map((task, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-blue-800 dark:text-blue-200 truncate">{task.taskName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={isCreating || (needsRepo && (!repositoryName || !repositoryOwner)) || (selectedPlatform === 'jira' && !jiraProjectKey)}
            className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
        onStatusChange={checkConnections}
      />
    </div>
  );
}
