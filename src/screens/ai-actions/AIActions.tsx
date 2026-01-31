import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useExecuteMCPQuery, useGetBranches } from '../../hooks/useApi';
import { logger } from '../../lib/utils/logger';
import { type PlanningPlatform } from '../../lib';
import PlatformSelectorWithResources from '../../components/PlatformSelectorWithResources';
import ReactMarkdown from 'react-markdown';

export default function AIActions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlanningPlatform | ''>('');
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
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
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">AI Actions</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Execute AI Command
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Describe what you want to accomplish in natural language. AI will use available integrations to get it done.
            </p>
          </div>

          {/* Platform & resource selection */}
          <div className="mb-6">
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              What would you like to do?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700"
              placeholder="e.g., Create a new issue in my GitHub repo, List all open Jira tickets, Update the status of issue #123..."
              disabled={loading}
            />
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

          {loading && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin" />
                <div className="flex-1">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">Executing...</span>
                  {progressMessage && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{progressMessage}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300 font-medium">Result</span>
              </div>
              <div className="w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 p-4 markdown-content">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Execute
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
