import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExecuteMCPQuery, useGetBranches } from '../../hooks/useApi';
import { logger } from '../../lib/utils/logger';
import { type PlanningPlatform } from '../../lib';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import ReactMarkdown from 'react-markdown';
import { useRepository } from '../../context/RepositoryContext';
import { styles } from './styles';

export default function AIActions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlanningPlatform | ''>('');
  const { repositoryOwner, setRepositoryOwner, repositoryName, setRepositoryName } = useRepository();
  const [gitlabProjectId, setGitlabProjectId] = useState('');
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [branch, setBranch] = useState('main');
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const { getBranches } = useGetBranches();

  const {
    executeMCPQueryStream,
    loading,
    error,
    progressMessage,
  } = useExecuteMCPQuery();

  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  // Fetch branches when repository changes
  useEffect(() => {
    async function fetchBranches() {
      if (selectedPlatform === 'github' && repositoryOwner && repositoryName) {
        setIsLoadingBranches(true);
        try {
          const response = await getBranches({
            platform: 'github',
            repositoryOwner,
            repositoryName
          });
          if (response?.branches) {
            setAvailableBranches(response.branches);
            // If current branch is not in list (and list not empty), default to first or keep main if valid
            if (response.branches.length > 0 && !response.branches.includes(branch) && branch !== 'main') {
              // optionally reset, but keeping 'main' is usually safe or let user decide
            }
          }
        } catch (error) {
          logger.error('Failed to fetch branches', { error });
        } finally {
          setIsLoadingBranches(false);
        }
      } else {
        setAvailableBranches([]);
      }
    }

    const timer = setTimeout(() => {
      fetchBranches();
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [selectedPlatform, repositoryOwner, repositoryName, getBranches]);

  const handleExecute = async () => {
    if (!query.trim()) {
      return;
    }

    try {
      setResult(null);
      const response = await executeMCPQueryStream({
        query: query.trim(),
        platform: selectedPlatform || undefined,
        repositoryOwner: repositoryOwner || undefined,
        repositoryName: repositoryName || undefined,
        gitlabProjectId: gitlabProjectId || undefined,
        jiraProjectKey: jiraProjectKey || undefined,
        branch: branch || undefined,
      });
      setResult(response.result || 'Query executed successfully');
    } catch {
      logger.error('Error executing MCP query');
    }
  };

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
            AI Actions
          </h1>
          <p className={styles.subtitle}>
            Describe what you want to accomplish in natural language. AI will use available integrations to get it done.
          </p>
        </div>

        <div className={styles.card}>
          {/* Platform & resource selection */}
          <div className={styles.platformSection}>
            <PlatformSelectorWithResources
              selectedPlatform={selectedPlatform}
              onSelectedPlatformChange={setSelectedPlatform}
              repositoryOwner={repositoryOwner}
              repositoryName={repositoryName}
              onRepositoryOwnerChange={setRepositoryOwner}
              onRepositoryNameChange={setRepositoryName}
              gitlabProjectId={gitlabProjectId}
              onGitlabProjectIdChange={setGitlabProjectId}
              jiraProjectKey={jiraProjectKey}
              onJiraProjectKeyChange={setJiraProjectKey}
              disabled={loading}
              onRequireIntegrations={() => navigate('/integrations')}
              label="Select Platform (Optional)"
            />
          </div>

          {selectedPlatform === 'github' && repositoryOwner && repositoryName && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Branch
              </label>
              <div className="relative">
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  disabled={loading || isLoadingBranches}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 disabled:opacity-50"
                >
                  <option value="main">main</option>
                  <option value="master">master</option>
                  {availableBranches.filter(b => b !== 'main' && b !== 'master').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {isLoadingBranches && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={styles.inputSection}>
            <label className={styles.label}>
              What would you like to do?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.textarea}
              placeholder="e.g., Create a new issue in my GitHub repo, List all open Jira tickets, Update the status of issue #123..."
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.error.container}>
              <div className={styles.error.content}>
                <AlertCircle className={styles.error.icon} />
                <span className={styles.error.text}>Error</span>
              </div>
              <p className={styles.error.message}>{error}</p>
            </div>
          )}

          {loading && (
            <div className={styles.loading.container}>
              <div className={styles.loading.header}>
                <Loader2 className={styles.loading.icon} />
                <div className={styles.loading.textWrapper}>
                  <span className={styles.loading.title}>Executing...</span>
                  {progressMessage && (
                    <p className={styles.loading.message}>{progressMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className={styles.result.container}>
              <div className={styles.result.header}>
                <CheckCircle2 className={styles.result.icon} />
                <span className={styles.result.title}>Result</span>
              </div>
              <div className={styles.result.content}>
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className={styles.actions.container}>
            <button
              onClick={() => navigate('/')}
              className={styles.actions.cancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={loading || !query.trim()}
              className={styles.actions.submit}
            >
              {loading && <Loader2 className={styles.actions.spinner} />}
              Execute
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
