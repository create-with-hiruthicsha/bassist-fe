import { useState, useEffect, useCallback } from 'react';
import { Github, Gitlab, Bug } from 'lucide-react';
import {
  PLATFORM_CONFIGS,
  PLATFORM_WITH_CODE_REPOSITORY,
  type PlanningPlatform,
  integrationService,
} from '../lib';
import GitHubRepositorySelector from './GitHubRepositorySelector';
import JiraProjectSelector from './JiraProjectSelector';

interface PlatformSelectorWithResourcesProps {
  selectedPlatform: PlanningPlatform | '';
  onSelectedPlatformChange: (platform: PlanningPlatform | '') => void;

  repositoryOwner: string;
  repositoryName: string;
  onRepositoryOwnerChange: (value: string) => void;
  onRepositoryNameChange: (value: string) => void;

  gitlabProjectId: string;
  onGitlabProjectIdChange: (value: string) => void;

  jiraProjectKey: string;
  onJiraProjectKeyChange: (value: string) => void;

  /** Disable inputs/buttons when parent is busy */
  disabled?: boolean;

  /** Bump this to force re-check of integrations (e.g. after closing integrations modal) */
  refreshKey?: number;

  /** Called when user clicks a platform that isn't connected */
  onRequireIntegrations?: () => void;

  /** Optional label override for the platform selector */
  label?: string;
}

export default function PlatformSelectorWithResources({
  selectedPlatform,
  onSelectedPlatformChange,
  repositoryOwner,
  repositoryName,
  onRepositoryOwnerChange,
  onRepositoryNameChange,
  gitlabProjectId,
  onGitlabProjectIdChange,
  jiraProjectKey,
  onJiraProjectKeyChange,
  disabled = false,
  refreshKey,
  onRequireIntegrations,
  label = 'Select Platform',
}: PlatformSelectorWithResourcesProps) {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  const checkConnections = useCallback(() => {
    const connected = integrationService
      .getProviders()
      .filter((p) => p.connected)
      .map((p) => p.id);

    setConnectedPlatforms(connected);

    // Auto-select first connected platform if none is selected yet
    if (!selectedPlatform && connected.length > 0) {
      onSelectedPlatformChange(connected[0] as PlanningPlatform);
    }
  }, [onSelectedPlatformChange, selectedPlatform]);

  useEffect(() => {
    checkConnections();
    // Also refresh from server
    integrationService.fetchUserIntegrations().then(checkConnections);
  }, [checkConnections, refreshKey]);

  const needsRepo =
    !!selectedPlatform &&
    PLATFORM_WITH_CODE_REPOSITORY.includes(selectedPlatform as PlanningPlatform);

  const handlePlatformClick = (platformId: PlanningPlatform) => {
    const isConnected = connectedPlatforms.includes(platformId);

    if (!isConnected) {
      onRequireIntegrations?.();
      return;
    }

    onSelectedPlatformChange(platformId);

    // Clear unrelated fields when switching
    if (platformId !== 'github') {
      onRepositoryOwnerChange('');
      onRepositoryNameChange('');
    }
    if (platformId !== 'gitlab') {
      onGitlabProjectIdChange('');
    }
    if (platformId !== 'jira') {
      onJiraProjectKeyChange('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
          {label}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PLATFORM_CONFIGS.map((p) => {
            const isConnected = connectedPlatforms.includes(p.id);
            const isSelected = selectedPlatform === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePlatformClick(p.id)}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col items-start gap-1 ${
                  isSelected
                    ? 'border-blue-700 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                    : isConnected
                    ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    : 'border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-not-allowed grayscale'
                }`}
                disabled={disabled}
              >
                <div className="font-medium flex items-center justify-between w-full">
                  <span>{p.name}</span>
                  {!isConnected && (
                    <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">
                      Needs Setup
                    </span>
                  )}
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

      {/* Repository Configuration */}
      {needsRepo && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Repository Configuration
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Configure the repository where tasks will be created for{' '}
            {selectedPlatform}
          </p>

          {connectedPlatforms.includes('github') ? (
            <GitHubRepositorySelector
              repositoryOwner={repositoryOwner}
              repositoryName={repositoryName}
              onRepositoryOwnerChange={onRepositoryOwnerChange}
              onRepositoryNameChange={onRepositoryNameChange}
              disabled={disabled}
              onIntegrationRequired={onRequireIntegrations}
              horizontal={false}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="repo-owner"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                >
                  Repository Owner
                </label>
                <input
                  type="text"
                  id="repo-owner"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  placeholder="username or organization"
                  value={repositoryOwner}
                  onChange={(e) => onRepositoryOwnerChange(e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div>
                <label
                  htmlFor="repo-name"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                >
                  Repository Name
                </label>
                <input
                  type="text"
                  id="repo-name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  placeholder="repository-name"
                  value={repositoryName}
                  onChange={(e) => onRepositoryNameChange(e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          )}

          {!connectedPlatforms.includes('github') &&
            !connectedPlatforms.includes('gitlab') && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 <strong>Tip:</strong> Connect your GitHub or GitLab account to
                  easily select repositories from a dropdown instead of typing
                  manually.
                </p>
                {onRequireIntegrations && (
                  <button
                    onClick={onRequireIntegrations}
                    className="mt-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Connect GitHub or GitLab →
                  </button>
                )}
              </div>
            )}
        </div>
      )}

      {/* Jira Project Selection */}
      {selectedPlatform === 'jira' && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            Jira Project Configuration
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Configure the Jira project where tasks will be created
          </p>

          {connectedPlatforms.includes('jira') ? (
            <JiraProjectSelector
              projectKey={jiraProjectKey}
              onProjectKeyChange={onJiraProjectKeyChange}
              disabled={disabled}
              onIntegrationRequired={onRequireIntegrations}
            />
          ) : (
            <div>
              <label
                htmlFor="jira-project"
                className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
              >
                Jira Project Key
              </label>
              <input
                type="text"
                id="jira-project"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                placeholder="Enter project key (e.g., PROJ)"
                value={jiraProjectKey}
                onChange={(e) => onJiraProjectKeyChange(e.target.value)}
                disabled={disabled}
              />
              {onRequireIntegrations && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> Connect your Jira account to easily
                    select projects from a dropdown instead of typing manually.
                  </p>
                  <button
                    onClick={onRequireIntegrations}
                    className="mt-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Connect Jira →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

