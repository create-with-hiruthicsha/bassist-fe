import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAssignedIssues, useFixBug } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { integrationService } from '../../lib';
import GitHubRepositorySelector from '../../components/GitHubRepositorySelector';
import { useRepository } from '../../context/RepositoryContext';
import { logger } from '../../lib/utils/logger';
import { styles } from './styles';

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
  const { repositoryOwner, setRepositoryOwner, repositoryName, setRepositoryName } = useRepository();
  const [platform, setPlatform] = useState<'github' | 'gitlab'>('github');
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button
            onClick={() => navigate('/')}
            className={styles.backButton}
          >
            <ArrowLeft className={styles.backIcon} />
            <span className={styles.backText}>Back</span>
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            Bug Fixing AI
          </h1>
          <p className={styles.subtitle}>
            View and fix issues assigned to you using AI
          </p>
        </div>

        <div className={styles.contentSpace}>
          {/* Platform Selection */}
          <div className={styles.card}>
            <label className={styles.section.label}>
              Select Platform
            </label>
            <div className={styles.platform.grid}>
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
                    className={
                      platform === p
                        ? styles.platform.button.active
                        : isConnected
                          ? styles.platform.button.connected
                          : styles.platform.button.disabled
                    }
                  >
                    {p === 'github' ? 'GitHub' : 'GitLab'}
                    {!isConnected && (
                      <span className={styles.platform.subText}>Not Connected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repository Configuration */}
          {platform === 'github' && (
            <div className={styles.card}>
              <h3 className={styles.section.title}>
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
                <div className={styles.section.grid}>
                  <div>
                    <label className={styles.section.label}>
                      Repository Owner
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="username or organization"
                      value={repositoryOwner}
                      onChange={(e) => setRepositoryOwner(e.target.value)}
                      disabled={loadingIssues}
                    />
                  </div>
                  <div>
                    <label className={styles.section.label}>
                      Repository Name
                    </label>
                    <input
                      type="text"
                      className={styles.input}
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
            <div className={styles.card}>
              <h3 className={styles.section.title}>
                Project Configuration
              </h3>
              <div>
                <label className={styles.section.label}>
                  Project ID
                </label>
                <input
                  type="text"
                  className={styles.input}
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
            <div className={styles.error.container}>
              <AlertCircle className={styles.error.icon} />
              <span className={styles.error.text}>{issuesError}</span>
            </div>
          )}

          {fixError && (
            <div className={styles.error.container}>
              <AlertCircle className={styles.error.icon} />
              <span className={styles.error.text}>{fixError}</span>
            </div>
          )}

          {/* Success Display */}
          {fixResult && (
            <div className={styles.success.container}>
              <CheckCircle2 className={styles.success.icon} />
              <div className={styles.success.content}>
                <p className={styles.success.title}>{fixResult.message}</p>
                {fixResult.prUrl && (
                  <a
                    href={fixResult.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.success.link}
                  >
                    View PR <ExternalLink className={styles.success.linkIcon} />
                  </a>
                )}
                <p className={styles.success.meta}>
                  {fixResult.filesCreated} file(s) created, {fixResult.tokensUsed} tokens used
                </p>
              </div>
            </div>
          )}

          {/* Issues List */}
          <div className={styles.card}>
            <div className={styles.issueList.header}>
              <h3 className={styles.issueList.title}>
                Assigned Issues
              </h3>
              {loadingIssues && (
                <Loader2 className={styles.issueList.spinner} />
              )}
            </div>

            {issues.length === 0 && !loadingIssues && (
              <p className={styles.issueList.empty}>
                No issues assigned to you found. Make sure you've selected the correct repository/project.
              </p>
            )}

            <div className={styles.issueList.container}>
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={styles.issue.container}
                >
                  <div className={styles.issue.layout}>
                    <div className={styles.issue.content}>
                      <div className={styles.issue.header}>
                        <h4 className={styles.issue.title}>
                          #{issue.number || issue.iid} {issue.title}
                        </h4>
                        <span className={
                          issue.state === 'open' || issue.state === 'opened'
                            ? styles.issue.badge.open
                            : styles.issue.badge.other
                        }>
                          {issue.state}
                        </span>
                      </div>
                      <p className={styles.issue.description}>
                        {issue.body || issue.description || 'No description'}
                      </p>
                      <p className={styles.issue.meta}>
                        Updated {formatDate(issue.updated_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFixBug(issue)}
                      disabled={fixingBug || fixingIssueId === issue.id}
                      className={styles.issue.button}
                    >
                      {fixingBug && fixingIssueId === issue.id ? (
                        <>
                          <Loader2 className={styles.issue.spinner} />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className={styles.issue.buttonIcon} />
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
