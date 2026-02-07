import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExecuteMCPQuery, useGetBranches } from '../../hooks/useApi';
import { logger } from '../../lib/utils/logger';
import { type PlanningPlatform } from '../../lib';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import ReactMarkdown from 'react-markdown';
import MermaidDiagram from '../../components/MermaidDiagram';
import { useRepository } from '../../context/RepositoryContext';
import { styles } from './styles';

export default function AIActions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
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
    orchestrationLogs,
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

  // Custom renderer for code blocks to handle Mermaid diagrams
  const CodeBlock = ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (!inline && language === 'mermaid') {
      return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  const handleExecute = async () => {
    if (!query.trim()) {
      return;
    }

    try {
      setResult(null);
      setSummary(null);
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
      setSummary(response.summary || null);
    } catch {
      logger.error('Error executing MCP query');
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader backTo="/" />

      <main className={pageMainClasses}>
        <PageTitle
          title="AI Actions"
          subtitle="Describe what you want to accomplish in natural language. AI will use available integrations to get it done."
        />
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
              {orchestrationLogs.length > 0 && (
                <div className="mt-4 p-3 bg-blue-900/10 dark:bg-blue-900/40 rounded border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 mb-2">Live Orchestration Logs</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {orchestrationLogs.slice(-3).map((log, i) => (
                      <p key={i} className="text-xs text-blue-800 dark:text-blue-200 animate-pulse">
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result && !loading && (
            <div className={styles.result.container}>
              <div className={styles.result.header}>
                <CheckCircle2 className={styles.result.icon} />
                <span className={styles.result.title}>Execution Result</span>
              </div>
              <div className="px-1">
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-4">
                  {summary || (result.length > 200 ? result.substring(0, 197) + "..." : result)}
                </p>

                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Full AI Output</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-900 overflow-y-auto max-h-[500px]">
                      <div className="markdown-content">
                        <ReactMarkdown components={{ code: CodeBlock }}>{result}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {orchestrationLogs.length > 0 && (
                    <details className="group border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 open:shadow-md">
                      <summary className="list-none flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Orchestration Logs ({orchestrationLogs.length} steps)</span>
                        <svg className="w-5 h-5 text-gray-500 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <div className="p-4 bg-gray-900 text-gray-300 text-[10px] font-mono border-t border-gray-700 rounded-b-lg max-h-60 overflow-y-auto">
                        {orchestrationLogs.map((log, i) => (
                          <div key={i} className="mb-1 py-1 border-b border-gray-800 last:border-0">
                            <span className="text-blue-500 font-bold mr-2">Step {i + 1}:</span>
                            {log}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
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
