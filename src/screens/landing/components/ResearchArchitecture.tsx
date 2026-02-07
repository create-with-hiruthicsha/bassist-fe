import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { apiClient, integrationService, githubApi } from '../../../lib';

type ProjectOption = { type: 'github' | 'jira'; id: string; label: string };

// Paths in SVG viewBox 0 0 100 100: Bassist (20,50) -> AI Agent (50,50) -> Gmail (80,50)
const PATH_BASSIST_TO_AGENT = 'M 20 50 L 50 50';
const PATH_AGENT_TO_GMAIL = 'M 50 50 L 80 50';

/** Single bit (0 or 1) flowing along an SVG path via animateMotion (same idea as old ArchitectureDemo Bit) */
function BitOnPath({
  value,
  path,
  color,
  duration,
  delay,
  repeat,
}: {
  value: string;
  path: string;
  color: string;
  duration: number;
  delay: number;
  repeat: boolean;
}) {
  return (
    <g>
      <animateMotion
        dur={`${duration}s`}
        repeatCount={repeat ? 'indefinite' : '1'}
        path={path}
        begin={`${delay}s`}
        fill="freeze"
      />
      <text
        fill={color}
        fontSize="5"
        fontFamily="ui-monospace, monospace"
        fontWeight="bold"
        style={{ textShadow: `0 0 2px ${color}` }}
      >
        {value}
      </text>
    </g>
  );
}

/** Bit stream: multiple 0/1 flowing along a path (like old ArchitectureDemo BitStream) */
function BitStreamOnPath({
  path,
  color = '#2dd4bf',
  count = 8,
  duration = 2,
  repeat = true,
}: {
  path: string;
  color?: string;
  count?: number;
  duration?: number;
  repeat?: boolean;
}) {
  const bits = useMemo(
    () => Array.from({ length: count }, () => (Math.random() > 0.5 ? '1' : '0')),
    [count]
  );
  return (
    <g>
      {bits.map((bit, i) => (
        <BitOnPath
          key={i}
          value={bit}
          path={path}
          color={color}
          duration={duration}
          delay={i * 0.2}
          repeat={repeat}
        />
      ))}
    </g>
  );
}

/**
 * Architecture section for Product Research on the landing page.
 * - Flow diagram with bits streaming along lines: Bassist -> AI Agent -> Gmail
 * - Click icon: trigger research for first connected project
 */
export default function ResearchArchitecture() {
  const navigate = useNavigate();
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);

  const loadOptions = useCallback(async () => {
    const hasGithub = integrationService.isConnected('github');
    const hasJira = integrationService.isConnected('jira');
    const options: ProjectOption[] = [];
    if (hasGithub) {
      try {
        const token = integrationService.getAccessToken('github');
        if (token) {
          githubApi.setAccessToken(token);
          const repos = await githubApi.getUserRepositories();
          repos.forEach((r: { full_name?: string; name?: string; owner?: { login?: string } }) => {
            const id = r.full_name || `${r.owner?.login || ''}/${r.name || ''}`.replace(/^\/+/, '');
            if (id) options.push({ type: 'github', id, label: id });
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
              label: `${p.key}${p.name ? ` — ${p.name}` : ''}`,
            });
          }
        });
      } catch {
        // ignore
      }
    }
    setProjectOptions(options);
  }, []);

  useEffect(() => {
    integrationService.fetchUserIntegrations().then(loadOptions);
  }, [loadOptions]);

  const handleClick = () => {
    navigate('/research');
  };

  return (
    <div className="relative rounded-xl border border-teal-200 dark:border-teal-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden mt-4">
      {/* Flow diagram: lines with bit stream along Bassist -> AI Agent -> Gmail */}
      <div className="w-full h-[100px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <svg
          className="w-full h-full block"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="arch-line-gradient" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0d9488" stopOpacity="0.4" />
              <stop offset="1" stopColor="#2dd4bf" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Connection lines */}
          <path d={PATH_BASSIST_TO_AGENT} stroke="url(#arch-line-gradient)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d={PATH_AGENT_TO_GMAIL} stroke="url(#arch-line-gradient)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* Bits flowing along the lines (like old ArchitectureDemo BitStream) */}
          <BitStreamOnPath path={PATH_BASSIST_TO_AGENT} color="#2dd4bf" count={6} duration={2.2} repeat />
          <BitStreamOnPath path={PATH_AGENT_TO_GMAIL} color="#2dd4bf" count={6} duration={2.2} repeat />
          {/* Node labels (positioned in viewBox coords) */}
          <text x="20" y="45" textAnchor="middle" className="fill-teal-400" fontSize="6" fontFamily="system-ui, sans-serif">Bassist</text>
          <text x="50" y="45" textAnchor="middle" className="fill-teal-400" fontSize="6" fontFamily="system-ui, sans-serif">AI Agent</text>
          <text x="80" y="45" textAnchor="middle" className="fill-teal-400" fontSize="6" fontFamily="system-ui, sans-serif">Gmail</text>
        </svg>
      </div>
      <div className="relative z-10 p-6">
        <h4 className="text-sm font-semibold text-teal-800 dark:text-teal-200 mb-2">
          How it works
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Research sends multiple requests to your connected integrations (GitHub, Jira). Bassist flows to the AI agent for analysis, then the report is sent to Gmail.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-teal-700 dark:text-teal-300 mb-4">
          <span>Bassist</span>
          <span aria-hidden>→</span>
          <span>AI Agent</span>
          <span aria-hidden>→</span>
          <span>Gmail</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleClick}
            disabled={false}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:pointer-events-none text-white font-medium px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            title="Run research and get report by email"
          >
              <>
              <Play className="w-4 h-4" />
              Run research & email report
            </>
          </button>
          {projectOptions.length === 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Connect GitHub or Jira to run from here
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
