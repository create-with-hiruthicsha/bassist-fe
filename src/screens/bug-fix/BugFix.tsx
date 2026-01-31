import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssignedIssues, useFixBug } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { integrationService } from '../../lib';
import GitHubRepositorySelector from '../../components/GitHubRepositorySelector';
import { logger } from '../../lib/utils/logger';

interface Issue {
  id: number;
  number?: number;
  iid?: number;
  title: string;
  body?: string;
  description?: string;
  state: string;
  created_at: string;
  updated_at: string;
}

export default function BugFix() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [platform, setPlatform] = useState<'github' | 'gitlab'>('github');
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [fixingIssueId, setFixingIssueId] = useState<number | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

  // Debounce repository values to prevent excessive API calls
  const debouncedRepositoryOwner = useDebounce(repositoryOwner, 500);
  const debouncedRepositoryName = useDebounce(repositoryName, 500);
  const debouncedProjectId = useDebounce(projectId, 500);

  const {
    getAssignedIssues,
    loading: loadingIssues,
    error: issuesError,
  } = useAssignedIssues();

  const {
    fixBug,
    loading: fixingBug,
    error: fixError,
    result: fixResult,
  } = useFixBug();

  // Use refs to track the latest values and prevent duplicate calls
  const getAssignedIssuesRef = useRef(getAssignedIssues);
  const loadingRef = useRef(false);
  const lastParamsRef = useRef<string>('');

  // Keep refs up to date
  useEffect(() => {
    getAssignedIssuesRef.current = getAssignedIssues;
  }, [getAssignedIssues]);

  const checkConnections = useCallback(() => {
    const connected = integrationService.getProviders()
      .filter(p => p.connected)
      .map(p => p.id);
    
    setConnectedPlatforms(connected);
  }, []);

  useEffect(() => {
    checkConnections();
    integrationService.fetchUserIntegrations().then(checkConnections);
  }, [checkConnections]);

  useEffect(() => {
    if (!platform) return;

    if (platform === 'github' && (!debouncedRepositoryOwner || !debouncedRepositoryName)) {
      return;
    }

    if (platform === 'gitlab' && !debouncedProjectId) {
      return;
    }

    // Create a unique key for these parameters to prevent duplicate calls
    const paramsKey = `${platform}-${debouncedRepositoryOwner}-${debouncedRepositoryName}-${debouncedProjectId}`;
    
    // Skip if we just called with the same parameters
    if (lastParamsRef.current === paramsKey) {
      return;
    }

    // Skip if already loading (prevent concurrent calls)
    if (loadingRef.current) {
      return;
    }

    lastParamsRef.current = paramsKey;
    loadingRef.current = true;

    const loadIssues = async () => {
      try {
        const result = await getAssignedIssuesRef.current({
          platform,
          owner: debouncedRepositoryOwner || undefined,
          repo: debouncedRepositoryName || undefined,
          projectId: debouncedProjectId || undefined,
        });

        if (result?.issues) {
          setIssues(result.issues);
        }
      } catch (error) {
        logger.error('Failed to load issues', error);
        // Reset lastParamsRef on error so we can retry
        lastParamsRef.current = '';
      } finally {
        loadingRef.current = false;
      }
    };

    loadIssues();
  }, [platform, debouncedRepositoryOwner, debouncedRepositoryName, debouncedProjectId]);

  const handleFixBug = async (issue: Issue) => {
    if (!platform) return;

    setFixingIssueId(issue.id);

    try {
      await fixBug({
        platform,
        owner: repositoryOwner || undefined,
        repo: repositoryName || undefined,
        projectId: projectId || undefined,
        issueNumber: issue.number,
        issueIid: issue.iid,
      });
    } catch (error) {
      logger.error('Failed to fix bug', error);
    } finally {
      setFixingIssueId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bug Fixing AI
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            View and fix issues assigned to you using AI
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
              Select Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['github', 'gitlab'] as const).map((p) => {
                const isConnected = connectedPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => {
                      if (isConnected) {
                        setPlatform(p);
                      }
                    }}
                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                      platform === p
                        ? 'bg-blue-700 text-white shadow-lg'
                        : isConnected
                          ? 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                          : 'bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed grayscale'
                    }`}
                  >
                    {p === 'github' ? 'GitHub' : 'GitLab'}
                    {!isConnected && (
                      <span className="block text-xs mt-1 opacity-70">Not Connected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repository Configuration */}
          {platform === 'github' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                Repository Configuration
              </h3>
              {connectedPlatforms.includes('github') ? (
                <GitHubRepositorySelector
                  repositoryOwner={repositoryOwner}
                  repositoryName={repositoryName}
                  onRepositoryOwnerChange={setRepositoryOwner}
                  onRepositoryNameChange={setRepositoryName}
                  disabled={loadingIssues}
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      placeholder="username or organization"
                      value={repositoryOwner}
                      onChange={(e) => setRepositoryOwner(e.target.value)}
                      disabled={loadingIssues}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                      placeholder="repository-name"
                      value={repositoryName}
                      onChange={(e) => setRepositoryName(e.target.value)}
                      disabled={loadingIssues}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {platform === 'gitlab' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                Project Configuration
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Project ID
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
                  placeholder="Enter project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={loadingIssues}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {issuesError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{issuesError}</span>
            </div>
          )}

          {fixError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{fixError}</span>
            </div>
          )}

          {/* Success Display */}
          {fixResult && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{fixResult.message}</p>
                {fixResult.prUrl && (
                  <a
                    href={fixResult.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-1"
                  >
                    View PR <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {fixResult.filesCreated} file(s) created, {fixResult.tokensUsed} tokens used
                </p>
              </div>
            </div>
          )}

          {/* Issues List */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Assigned Issues
              </h3>
              {loadingIssues && (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>

            {issues.length === 0 && !loadingIssues && (
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-8">
                No issues assigned to you found. Make sure you've selected the correct repository/project.
              </p>
            )}

            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          #{issue.number || issue.iid} {issue.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          issue.state === 'open' || issue.state === 'opened'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                          {issue.state}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {issue.body || issue.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Updated {formatDate(issue.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFixBug(issue)}
                      disabled={fixingBug || fixingIssueId === issue.id}
                      className="flex-shrink-0 px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {fixingBug && fixingIssueId === issue.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Handoff to AI
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
