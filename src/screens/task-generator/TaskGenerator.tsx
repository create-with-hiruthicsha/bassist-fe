import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, FolderGit2, CheckCircle2, AlertCircle, Edit3, Save, X, Loader2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskGenerationWithProgress, useTaskBreakdownParser } from '../../hooks/useApi';
import { TaskBreakdown, PlanningPlatform } from '../../lib';
import CelebrationModal from '../../components/CelebrationModal';
import FileUpload from '../../components/FileUpload';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import { logger } from '../../lib/utils/logger';
import IntegrationsModal from '../../components/IntegrationsModal';

export default function TaskGenerator() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<PlanningPlatform | ''>('github');
  const [textInput, setTextInput] = useState('TODO app in react with rich text support, auth and integrations with GitHub, GitLab and Notion under 2 epics and 5 tasks');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [taskBreakdown, setTaskBreakdown] = useState<TaskBreakdown | null>(null);
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [editingTask, setEditingTask] = useState<{ epicIndex: number; taskIndex: number } | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; estimate: string }>({
    title: '',
    description: '',
    estimate: ''
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [platformRefreshKey, setPlatformRefreshKey] = useState(0);

  const {
    generateTasksWithProgress,
    loading: isGenerating,
    error,
    epicIndex,
    progress,
    epicProgress,
    completed,
    result
  } = useTaskGenerationWithProgress();
  const { parseTaskBreakdown } = useTaskBreakdownParser();

  const handleIntegrationsStatusChange = useCallback(() => {
    setPlatformRefreshKey((prev) => prev + 1);
  }, []);

  const handleGenerate = async () => {
    if (!platform || (!textInput && uploadedFiles.length === 0)) {
      return;
    }

    setTaskBreakdown(null);

    try {
      const request = {
        planningPlatform: platform as PlanningPlatform,
        textInput: textInput || undefined,
        idea: uploadedFiles[0] || undefined,
        repositoryOwner: repositoryOwner || undefined,
        repositoryName: repositoryName || undefined,
      };

      await generateTasksWithProgress(request);
    } catch {
      logger.error('Failed to generate tasks');
    }
  };


  // Handle completion and parse result
  useEffect(() => {
    if (completed && result) {
      // Handle both 'output' and 'response' fields for backward compatibility
      const responseData = result.output || result.response;
      if (responseData) {
        const parsed = parseTaskBreakdown(responseData);
        setTaskBreakdown(parsed);
      }
    }
  }, [completed, result, parseTaskBreakdown]);


  const totalHours = taskBreakdown?.summary.total_estimated_hours || 0;
  const totalTasks = taskBreakdown?.summary.number_of_tasks || 0;

  // Task editing functions
  const startEditing = (epicIndex: number, taskIndex: number) => {
    if (!taskBreakdown) return;

    const task = taskBreakdown.epics[epicIndex].tasks[taskIndex];
    setEditingTask({ epicIndex, taskIndex });
    setEditForm({
      title: task.title,
      description: task.description || '',
      estimate: task.estimate
    });
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditForm({ title: '', description: '', estimate: '' });
  };

  const saveTask = () => {
    if (!taskBreakdown || !editingTask) return;

    const updatedBreakdown = { ...taskBreakdown };
    const task = updatedBreakdown.epics[editingTask.epicIndex].tasks[editingTask.taskIndex];

    // Update task
    task.title = editForm.title;
    task.description = editForm.description || undefined;
    task.estimate = editForm.estimate;

    // Recalculate summary
    const totalHours = updatedBreakdown.epics.reduce((epicSum, epic) => {
      return epicSum + epic.tasks.reduce((taskSum, task) => {
        const hours = parseEstimateToHours(task.estimate);
        return taskSum + hours;
      }, 0);
    }, 0);

    updatedBreakdown.summary.total_estimated_hours = totalHours;
    updatedBreakdown.summary.number_of_tasks = updatedBreakdown.epics.reduce(
      (sum, epic) => sum + epic.tasks.length, 0
    );

    setTaskBreakdown(updatedBreakdown);
    setEditingTask(null);
    setEditForm({ title: '', description: '', estimate: '' });
  };

  const parseEstimateToHours = (estimate: string): number => {
    const match = estimate.match(/^(\d+)([hdw])$/i);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'h': return value;
      case 'd': return value * 8; // 1 day = 8 hours
      case 'w': return value * 40; // 1 week = 40 hours
      default: return 0;
    }
  };

  const EpicListItemIcon = (isInProgress: boolean) => {
    return isInProgress ? <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Task Generator
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Select a platform and generate actionable tasks
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform + repository selection */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Select Platform
              </span>
              <button
                onClick={() => setIsIntegrationsModalOpen(true)}
                className="text-xs text-blue-700 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                Manage Connections
              </button>
            </div>
            <PlatformSelectorWithResources
              selectedPlatform={platform}
              onSelectedPlatformChange={setPlatform}
              repositoryOwner={repositoryOwner}
              repositoryName={repositoryName}
              onRepositoryOwnerChange={setRepositoryOwner}
              onRepositoryNameChange={setRepositoryName}
              gitlabProjectId={''}
              onGitlabProjectIdChange={() => { /* gitlab not wired for TaskGenerator yet */ }}
              jiraProjectKey={''}
              onJiraProjectKeyChange={() => { /* jira not wired for TaskGenerator yet */ }}
              disabled={isGenerating}
              refreshKey={platformRefreshKey}
              onRequireIntegrations={() => setIsIntegrationsModalOpen(true)}
            />
          </div>

          {/* File Upload */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Upload DOCX File (Optional)
            </label>
            <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              accept=".docx"
              multiple={false}
              maxFiles={1}
              placeholder="Click to upload or drag and drop"
              description="DOCX files only, max 10MB"
              allowedTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
              allowedExtensions={['.docx']}
            />
          </div>

          {/* Text Input */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Or describe your project idea
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe your project, features, requirements, or paste your project specification..."
              className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
            />
          </div>

          {/* Progress Display */}
          {isGenerating && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">Generating Tasks</h3>
              </div>

              {/* Progress Message */}
              {progress && (
                <div className="mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">{progress}</p>
                </div>
              )}

              {/* Progress Bar */}
              {epicProgress.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mb-2">
                    <span>Progress</span>
                    <span>{epicIndex} of {epicProgress[0]?.totalEpics || 0} epics</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${epicProgress.length > 0 ? (epicIndex / (epicProgress[0]?.totalEpics || 1)) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Epic List */}
              {epicProgress.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-2">Generated Epics:</h4>
                  <div className="max-h-32 overflow-y-scroll space-y-1">
                    {epicProgress.map((epic, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {EpicListItemIcon(epic.status !== 'completed')}
                        <span className="text-blue-800 dark:text-blue-200 truncate">{epic.epicName}</span>
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

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!platform || (!textInput && uploadedFiles.length === 0) || isGenerating}
            className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isGenerating ? 'Generating...' : 'Generate Tasks'}
          </button>
        </div>

        {taskBreakdown && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Generated Tasks
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {totalHours}h • {totalTasks} tasks
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Project Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">{taskBreakdown.summary.number_of_epics}</span>
                  <span className="text-blue-600 dark:text-blue-400 ml-1">epics</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">{taskBreakdown.summary.number_of_tasks}</span>
                  <span className="text-blue-600 dark:text-blue-400 ml-1">tasks</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">{taskBreakdown.summary.total_estimated_hours}</span>
                  <span className="text-blue-600 dark:text-blue-400 ml-1">hours</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">{Math.ceil(taskBreakdown.summary.total_estimated_hours / 8)}</span>
                  <span className="text-blue-600 dark:text-blue-400 ml-1">days</span>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            {taskBreakdown.summary.assumptions.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">Assumptions</h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  {taskBreakdown.summary.assumptions.map((assumption, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400 mt-1">•</span>
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tasks by Epic */}
            <div className="space-y-6 mb-8 min-w-0">
              {taskBreakdown.epics.map((epic, epicIdx) => (
                <div key={epicIdx} className="min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <FolderGit2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 break-words">
                      {epic.name}
                    </h3>
                  </div>
                  <div className="space-y-2 ml-7 min-w-0">
                    {epic.tasks.map((task, taskIdx) => {
                      const isEditing = editingTask?.epicIndex === epicIdx && editingTask?.taskIndex === taskIdx;

                      return (
                        <div
                          key={taskIdx}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-0"
                        >
                          {isEditing ? (
                            // Edit Mode
                            <div className="space-y-3 min-w-0">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Task Title
                                </label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                                  placeholder="Enter task title"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Description (Optional)
                                </label>
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                                  rows={2}
                                  placeholder="Enter task description"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Estimate
                                </label>
                                <div className="flex gap-2 min-w-0">
                                  <input
                                    type="text"
                                    value={editForm.estimate}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, estimate: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                                    placeholder="e.g., 2h, 1d"
                                  />
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setEditForm(prev => ({ ...prev, estimate: e.target.value }));
                                      }
                                    }}
                                    className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                  >
                                    <option value="">Quick select</option>
                                    <option value="1h">1h</option>
                                    <option value="2h">2h</option>
                                    <option value="4h">4h</option>
                                    <option value="8h">8h</option>
                                    <option value="1d">1d</option>
                                    <option value="2d">2d</option>
                                    <option value="3d">3d</option>
                                    <option value="1w">1w</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <button
                                  onClick={saveTask}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                                >
                                  <Save className="w-3 h-3" />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-start justify-between gap-4 min-w-0">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1 break-words">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded">
                                  <Clock className="w-3 h-3" />
                                  {task.estimate}
                                </div>
                                <button
                                  onClick={() => startEditing(epicIdx, taskIdx)}
                                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                  title="Edit task"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (taskBreakdown && platform) {
                  // Store the task breakdown and platform in session storage for the next page
                  sessionStorage.setItem('generatedTasks', JSON.stringify(taskBreakdown));
                  sessionStorage.setItem('selectedPlatform', platform);
                  navigate('/create-tasks');
                }
              }}
              disabled={!taskBreakdown || !platform}
              className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-5 h-5" />
              Create Tasks
            </button>
          </div>
        )}

      </main>

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        message="Hoorayyyyy, all tasks are created!"
      />

      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
        onStatusChange={handleIntegrationsStatusChange}
      />
    </div>
  );
}
