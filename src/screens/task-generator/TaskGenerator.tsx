import { useState, useEffect, useCallback } from 'react';
import { Clock, FolderGit2, CheckCircle2, AlertCircle, Edit3, Save, X, Loader2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTaskGenerationWithProgress, useTaskBreakdownParser } from '../../hooks/useApi';
import { TaskBreakdown, PlanningPlatform } from '../../lib';
import CelebrationModal from '../../components/CelebrationModal';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import FileUpload from '../../components/FileUpload';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import { logger } from '../../lib/utils/logger';
import IntegrationsModal from '../../components/IntegrationsModal';

import { useRepository } from '../../context/RepositoryContext';

import { styles } from './styles';

export default function TaskGenerator() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<PlanningPlatform | ''>('github');
  const [textInput, setTextInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [taskBreakdown, setTaskBreakdown] = useState<TaskBreakdown | null>(null);
  const { repositoryOwner, setRepositoryOwner, repositoryName, setRepositoryName } = useRepository();
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
      const responseData =
        typeof result === 'object' && result !== null
          ? (result as { output?: string; response?: string }).output ||
            (result as { output?: string; response?: string }).response
          : undefined;
      if (responseData && typeof responseData === 'string') {
        try {
          const parsed = parseTaskBreakdown(responseData);
          setTaskBreakdown(parsed);
        } catch (e) {
          logger.error('Failed to parse generated tasks', e);
        }
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
    <div className={styles.container}>
      <PageHeader backTo="/" />

      <main className={pageMainClasses}>
        <PageTitle
          title="Task Generator"
          subtitle="Select a platform and generate actionable tasks"
        />
        <div className="space-y-6">
          {/* Platform + repository selection */}
          <div className={styles.section.container}>
            <div className={styles.section.platformHeader}>
              <span className={styles.section.title}>
                Select Platform
              </span>
              <button
                onClick={() => setIsIntegrationsModalOpen(true)}
                className={styles.section.manageButton}
              >
                <Settings className={styles.section.manageIcon} />
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
          <div className={styles.section.container}>
            <label className={styles.section.title}>
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
          <div className={styles.section.container}>
            <label className={styles.section.title}>
              Or describe your project idea
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Describe your project, features, requirements, or paste your project specification..."
              className={styles.input.textarea}
            />
          </div>

          {/* Progress Display */}
          {isGenerating && (
            <div className={styles.progress.container}>
              <div className={styles.progress.header}>
                <Loader2 className={styles.progress.spinner} />
                <h3 className={styles.progress.title}>Generating Tasks</h3>
              </div>

              {/* Progress Message */}
              {progress && (
                <div className="mb-4">
                  <p className={styles.progress.message}>{progress}</p>
                </div>
              )}

              {/* Progress Bar */}
              {epicProgress.length > 0 && (
                <div className={styles.progress.barContainer}>
                  <div className={styles.progress.barHeader}>
                    <span>Progress</span>
                    <span>{epicIndex} of {epicProgress[0]?.totalEpics || 0} epics</span>
                  </div>
                  <div className={styles.progress.barBg}>
                    <div
                      className={styles.progress.barFill}
                      style={{
                        width: `${epicProgress.length > 0 ? (epicIndex / (epicProgress[0]?.totalEpics || 1)) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Epic List */}
              {epicProgress.length > 0 && (
                <div className={styles.progress.listContainer}>
                  <h4 className={styles.progress.listTitle}>Generated Epics:</h4>
                  <div className={styles.progress.list}>
                    {epicProgress.map((epic, index) => (
                      <div key={index} className={styles.progress.listItem}>
                        {EpicListItemIcon(epic.status !== 'completed')}
                        <span className={styles.progress.listItemText}>{epic.epicName}</span>
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

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!platform || (!textInput && uploadedFiles.length === 0) || isGenerating}
            className={styles.button.primary}
          >
            {isGenerating ? 'Generating...' : 'Generate Tasks'}
          </button>
        </div>

        {taskBreakdown && (
          <div className={styles.results.container}>
            <div className={styles.results.header}>
              <h2 className={styles.results.title}>
                Generated Tasks
              </h2>
              <div className={styles.results.meta}>
                <Clock className="w-4 h-4" />
                <span>
                  {totalHours}h • {totalTasks} tasks
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className={styles.results.summaryCard}>
              <h3 className={styles.results.summaryTitle}>Project Summary</h3>
              <div className={styles.results.summaryGrid}>
                <div>
                  <span className={styles.results.summaryValue}>{taskBreakdown.summary.number_of_epics}</span>
                  <span className={styles.results.summaryLabel}>epics</span>
                </div>
                <div>
                  <span className={styles.results.summaryValue}>{taskBreakdown.summary.number_of_tasks}</span>
                  <span className={styles.results.summaryLabel}>tasks</span>
                </div>
                <div>
                  <span className={styles.results.summaryValue}>{taskBreakdown.summary.total_estimated_hours}</span>
                  <span className={styles.results.summaryLabel}>hours</span>
                </div>
                <div>
                  <span className={styles.results.summaryValue}>{Math.ceil(taskBreakdown.summary.total_estimated_hours / 8)}</span>
                  <span className={styles.results.summaryLabel}>days</span>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            {taskBreakdown.summary.assumptions.length > 0 && (
              <div className={styles.results.assumptionsCard}>
                <h3 className={styles.results.assumptionsTitle}>Assumptions</h3>
                <ul className={styles.results.assumptionsList}>
                  {taskBreakdown.summary.assumptions.map((assumption, idx) => (
                    <li key={idx} className={styles.results.assumptionsItem}>
                      <span className={styles.results.assumptionsBullet}>•</span>
                      <span>{assumption}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tasks by Epic */}
            <div className={styles.taskList.container}>
              {taskBreakdown.epics.map((epic, epicIdx) => (
                <div key={epicIdx} className={styles.taskList.epicContainer}>
                  <div className={styles.taskList.epicHeader}>
                    <FolderGit2 className={styles.taskList.epicIcon} />
                    <h3 className={styles.taskList.epicTitle}>
                      {epic.name}
                    </h3>
                  </div>
                  <div className={styles.taskList.tasksContainer}>
                    {epic.tasks.map((task, taskIdx) => {
                      const isEditing = editingTask?.epicIndex === epicIdx && editingTask?.taskIndex === taskIdx;

                      return (
                        <div
                          key={taskIdx}
                          className={styles.taskList.taskCard}
                        >
                          {isEditing ? (
                            // Edit Mode
                            <div className={styles.editForm.container}>
                              <div>
                                <label className={styles.editForm.label}>
                                  Task Title
                                </label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                  className={styles.editForm.input}
                                  placeholder="Enter task title"
                                />
                              </div>

                              <div>
                                <label className={styles.editForm.label}>
                                  Description (Optional)
                                </label>
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                  className={styles.editForm.textarea}
                                  rows={2}
                                  placeholder="Enter task description"
                                />
                              </div>

                              <div>
                                <label className={styles.editForm.label}>
                                  Estimate
                                </label>
                                <div className={styles.editForm.row}>
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
                                    className={styles.editForm.select}
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

                              <div className={styles.editForm.actions}>
                                <button
                                  onClick={saveTask}
                                  className={styles.editForm.saveButton}
                                >
                                  <Save className={styles.editForm.icon} />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className={styles.editForm.cancelButton}
                                >
                                  <X className={styles.editForm.icon} />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className={styles.viewMode.container}>
                              <div className={styles.viewMode.content}>
                                <h4 className={styles.viewMode.title}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className={styles.viewMode.description}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                              <div className={styles.viewMode.metaContainer}>
                                <div className={styles.viewMode.estimateBadge}>
                                  <Clock className={styles.viewMode.clockIcon} />
                                  {task.estimate}
                                </div>
                                <button
                                  onClick={() => startEditing(epicIdx, taskIdx)}
                                  className={styles.viewMode.editButton}
                                  title="Edit task"
                                >
                                  <Edit3 className={styles.viewMode.editIcon} />
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
              className={styles.button.create}
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
