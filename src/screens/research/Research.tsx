import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, AlertCircle, Github, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiClient, integrationService, githubApi } from '../../lib';
import BaseDropdown from '../../components/BaseDropdown';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import ResearchInProgressView from './ResearchInProgressView';

type ProjectOption = { type: 'github' | 'jira'; id: string; label: string };

export default function Research() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [understanding, setUnderstanding] = useState<{
    valueProposition?: string;
    differentiators?: string[];
    gapsAndLimitations?: string[];
    periodEnd?: string;
    generatedAt?: string;
  } | null>(null);
  const [running, setRunning] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingUnderstanding, setLoadingUnderstanding] = useState(true);
  const [runError, setRunError] = useState<string | null>(null);
  const [startClicked, setStartClicked] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasGithub = integrationService.isConnected('github');
  const hasJira = integrationService.isConnected('jira');

  const loadOptions = useCallback(async () => {
    const options: ProjectOption[] = [];
    if (hasGithub) {
      try {
        const token = integrationService.getAccessToken('github');
        if (token) {
          githubApi.setAccessToken(token);
          const repos = await githubApi.getUserRepositories();
          repos.forEach((r: { full_name?: string; name?: string; owner?: { login?: string } }) => {
            const id = r.full_name || `${r.owner?.login || ''}/${r.name || ''}`.replace(/^\/+/, '');
            if (id) options.push({ type: 'github', id, label: `Repository: ${id}` });
          });
        }
      } catch {
        // ignore
      }
    }
    if (hasJira) {
      try {
        const projects = await apiClient.getJiraProjects();
        (projects || []).forEach((p: { key?: string; name?: string }) => {
          if (p.key) {
            options.push({
              type: 'jira',
              id: p.key,
              label: `Project: ${p.key}${p.name ? ` — ${p.name}` : ''}`,
            });
          }
        });
      } catch {
        // ignore
      }
    }
    setProjectOptions(options);
    setSelectedProject((prev) => (prev && options.some((o) => o.id === prev)) ? prev : (options[0]?.id ?? ''));
  }, [hasGithub, hasJira]);

  useEffect(() => {
    integrationService.fetchUserIntegrations().then(() => {
      loadOptions();
    });
  }, [loadOptions]);

  const fetchStatus = useCallback(async () => {
    try {
      const { running: r } = await apiClient.getProductIntelligenceStatus();
      setRunning(r);
      if (!r) setStartClicked(false);
      return r;
    } catch {
      setRunning(false);
      setStartClicked(false);
      return false;
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchUnderstanding = useCallback(async () => {
    if (running) return;
    setLoadingUnderstanding(true);
    try {
      const data = await apiClient.getProductIntelligenceUnderstanding(selectedProject || undefined);
      setUnderstanding(data);
    } catch {
      setUnderstanding(null);
    } finally {
      setLoadingUnderstanding(false);
    }
  }, [running, selectedProject]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!running) {
      fetchUnderstanding();
    }
  }, [running, fetchUnderstanding]);

  useEffect(() => {
    if (!running) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(fetchStatus, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [running, fetchStatus]);

  const handleStart = async () => {
    setRunError(null);
    setStartClicked(true);
    try {
      const payload = selectedProject
        ? {
            projectId: selectedProject,
            ...(user?.email && {
              email: {
                enabled: true,
                provider: 'gmail' as const,
                to: [user.email],
              },
            }),
          }
        : undefined;
      await apiClient.runProductIntelligence(payload);
      setRunning(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to start research';
      setRunError(msg);
      setStartClicked(false);
    }
  };

  const showInProgress = running || startClicked;

  if (showInProgress) {
    return (
      <ResearchInProgressView
        onBack={() => {
          setStartClicked(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader backTo="/" />

      <main className={pageMainClasses}>
        <PageTitle
          title={
            <span className="flex items-center gap-2">
              <Search className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Product Research
            </span>
          }
          subtitle="Run competitive and product research, then receive the report by email."
        />
        {!hasGithub && !hasJira ? (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-200 font-medium">Connect an integration</p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                Connect GitHub or Jira (or both) to select a project or repository for research.
              </p>
              <button
                type="button"
                onClick={() => navigate('/integrations')}
                className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-200 hover:underline"
              >
                Go to Integrations →
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 max-w-md">
              <BaseDropdown
                label="Project"
                value={selectedProject}
                options={projectOptions.map((opt) => ({
                  value: opt.id,
                  label: opt.label,
                  icon: opt.type === 'github' ? <Github className="w-4 h-4 text-gray-500" /> : <Building2 className="w-4 h-4 text-gray-500" />,
                }))}
                onSelect={setSelectedProject}
                placeholder={projectOptions.length === 0 ? 'Loading…' : 'Select project'}
                disabled={projectOptions.length === 0}
              />
            </div>

            <div className="mb-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Current understanding
              </h2>
              {loadingUnderstanding ? (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading…
                </div>
              ) : understanding?.valueProposition || (understanding?.differentiators && understanding.differentiators.length > 0) ? (
                <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                  {understanding.valueProposition && (
                    <p>{understanding.valueProposition}</p>
                  )}
                  {understanding.differentiators && understanding.differentiators.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Where we're ahead: </span>
                      <ul className="list-disc pl-5 mt-1">
                        {understanding.differentiators.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {understanding.gapsAndLimitations && understanding.gapsAndLimitations.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Gaps / limitations: </span>
                      <ul className="list-disc pl-5 mt-1">
                        {understanding.gapsAndLimitations.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(understanding.periodEnd || understanding.generatedAt) && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Last run: {understanding.periodEnd || understanding.generatedAt || '—'}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No prior understanding yet. Run research once to generate a report and update this.
                </p>
              )}
            </div>

            {runError && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                {runError}
              </div>
            )}

            <button
              type="button"
              disabled={loadingStatus || running}
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none text-white font-medium px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
              {loadingStatus ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking status…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Start Research
                </>
              )}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
