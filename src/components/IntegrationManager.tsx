import { useState, useEffect, useCallback } from 'react';
import {
  Github,
  Gitlab,
  Check,
  X,
  ExternalLink,
  Loader2,
  Settings,
  RefreshCcw,
  Bug
} from 'lucide-react';
import { integrationService, IntegrationProvider } from '../lib';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import RunningModeBadge from './RunningModeBadge';

interface IntegrationManagerProps {
  onStatusChange?: () => void;
  compact?: boolean;
}

export default function IntegrationManager({ onStatusChange, compact = false }: IntegrationManagerProps) {
  const [providers, setProviders] = useState<IntegrationProvider[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const { currentOrganization } = useAuth();

  const loadProviders = useCallback(() => {
    const providerList = integrationService.getProviders();
    setProviders(providerList);
  }, []);

  const refreshIntegrations = useCallback(async () => {
    if (!currentOrganization) return;
    setStatusLoading(true);
    setError(null);

    try {
      await integrationService.fetchUserIntegrations();
      const providerList = integrationService.getProviders();
      setProviders(providerList);
      if (onStatusChange) onStatusChange();
    } catch (err) {
      setError(`Failed to refresh integrations: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setStatusLoading(false);
    }
  }, [currentOrganization, onStatusChange]);

  useEffect(() => {
    if (currentOrganization) {
      loadProviders();
      refreshIntegrations();
    }
  }, [currentOrganization, loadProviders, refreshIntegrations]);

  // Handle message from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        const providerName = event.data.provider;
        toast.success(`${providerName.charAt(0).toUpperCase() + providerName.slice(1)} connected successfully!`);
        refreshIntegrations();

        // Reset loading state for all providers
        setLoading({});
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshIntegrations]);

  const handleConnect = async (provider: IntegrationProvider) => {
    if (!currentOrganization) {
      setError("No organization selected.");
      return;
    }
    setLoading(prev => ({ ...prev, [provider.id]: true }));
    setError(null);

    try {
      await integrationService.startOAuthFlow(provider.id, currentOrganization.id, true);
      // We don't set loading to false here because the popup will handle it
      // via message listener or if it fails to open we might need a timeout
      // but usually the user will close the popup or it will redirect
    } catch (err) {
      setError(`Failed to start ${provider.name} connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    if (!currentOrganization) return;
    setLoading(prev => ({ ...prev, [provider.id]: true }));
    setError(null);

    try {
      await integrationService.removeConnection(provider.id);
      loadProviders();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      setError(`Failed to disconnect ${provider.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const handleTestConnection = async (provider: IntegrationProvider) => {
    setLoading(prev => ({ ...prev, [provider.id]: true }));
    setError(null);

    try {
      const isConnected = await integrationService.testConnection(provider.id);
      if (!isConnected) {
        setError(`${provider.name} connection test failed. Please reconnect.`);
        await integrationService.removeConnection(provider.id);
        loadProviders();
        if (onStatusChange) onStatusChange();
      }
    } catch (err) {
      setError(`Failed to test ${provider.name} connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  const getProviderIcon = (provider: IntegrationProvider) => {
    const iconProps = { className: compact ? "w-5 h-5" : "w-6 h-6" };

    switch (provider.id) {
      case 'github':
        return <Github {...iconProps} />;
      case 'gitlab':
        return <Gitlab {...iconProps} />;
      case 'jira':
        return <Bug {...iconProps} />;
      case 'bitbucket':
        return <Settings {...iconProps} />;
      case 'azure':
        return <Settings {...iconProps} />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg">
          <X className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
          Connected Services
        </h3>
        <button
          onClick={refreshIntegrations}
          disabled={statusLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {statusLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl ${compact ? 'p-3' : 'p-4'} hover:shadow-sm transition-shadow`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`${compact ? 'p-2' : 'p-2.5'} rounded-lg`}
                  style={{ backgroundColor: provider.color + '15' }}
                >
                  <div style={{ color: provider.color }}>
                    {getProviderIcon(provider)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-gray-100`}>
                      {provider.name}
                    </h4>
                    {provider.implementationStatus && (
                      <RunningModeBadge mode={provider.implementationStatus} />
                    )}
                  </div>
                  {!compact && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {provider.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    {provider.connected ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Check className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                        <X className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Not connected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {provider.connected ? (
                  <>
                    <button
                      onClick={() => handleTestConnection(provider)}
                      disabled={loading[provider.id]}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading[provider.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Test'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(provider)}
                      disabled={loading[provider.id]}
                      className="px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading[provider.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(provider)}
                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                    style={{ backgroundColor: provider.color }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
