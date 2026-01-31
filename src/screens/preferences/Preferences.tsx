import { ArrowLeft, Sun, Moon, Monitor, Palette, Settings, ExternalLink, Copy, RefreshCw, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../../lib/services/organization-service';
import IntegrationsModal from '../../components/IntegrationsModal';
import ManageIntegrationsButton from '../../components/Integrations';

export default function Preferences() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { currentOrganization } = useAuth();

  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);

  const fetchJoinCode = useCallback(async () => {
    if (!currentOrganization?.id) return;
    setIsLoadingCode(true);
    try {
      const code = await organizationService.getJoinCode(currentOrganization.id);
      setJoinCode(code);
    } catch (error) {
      console.error('Failed to fetch join code:', error);
    } finally {
      setIsLoadingCode(false);
    }
  }, [currentOrganization?.id]);

  useEffect(() => {
    fetchJoinCode();
  }, [fetchJoinCode]);

  const handleRotateCode = async () => {
    if (!currentOrganization?.id || isRotating) return;
    setIsRotating(true);
    try {
      const newCode = await organizationService.rotateJoinCode(currentOrganization.id);
      setJoinCode(newCode);
    } catch (error) {
      console.error('Failed to rotate code:', error);
    } finally {
      setIsRotating(true); // Small delay for effect
      setTimeout(() => setIsRotating(false), 500);
    }
  };

  const handleCopyCode = () => {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes = [
    { value: 'light', label: 'Light', icon: Sun, description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Always use dark theme' },
    { value: 'system', label: 'System', icon: Monitor, description: 'Follow system preference' },
  ] as const;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-blue-700 dark:text-blue-400" />
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Preferences</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-8">
          {/* Theme Selection */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Appearance
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Choose how Bassist looks to you. You can always change this later.
              </p>
            </div>

            <div className="space-y-3">
              {themes.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200
                    ${theme === value
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-lg
                    ${theme === value
                      ? 'bg-blue-100 dark:bg-blue-800'
                      : 'bg-gray-100 dark:bg-gray-700'
                    }
                  `}>
                    <Icon className={`
                      w-5 h-5
                      ${theme === value
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                      }
                    `} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className={`
                        font-medium
                        ${theme === value
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                        }
                      `}>
                        {label}
                      </h3>
                      {theme === value && (
                        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                    <p className={`
                      text-sm mt-1
                      ${theme === value
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400'
                      }
                    `}>
                      {description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Preferences Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                General
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Other application preferences and settings.
              </p>
            </div>
          </div>

          {/* Organization Settings */}
          {currentOrganization && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Organization Settings
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your organization's access and invite new members.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 italic">
                        {currentOrganization.name} Join Code
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Anyone with this code can join your organization. Code changes automatically after someone joins.
                      </p>
                    </div>
                    <button
                      onClick={handleRotateCode}
                      disabled={isRotating || isLoadingCode}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                      title="Generate new code"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                      {isLoadingCode ? (
                        <div className="h-5 w-32 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
                      ) : (
                        joinCode || 'No active code'
                      )}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      disabled={!joinCode || isLoadingCode}
                      className={`
                        p-3 rounded-xl border transition-all flex items-center gap-2
                        ${copied
                          ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400'
                        }
                      `}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      <span className="text-sm font-medium hidden sm:inline">
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Integrations
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Connect external services to enhance your workflow
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-600 rounded-full">
                    <Settings className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      External Services
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Connect to GitHub, GitLab, Bitbucket, and Azure DevOps
                    </p>
                  </div>
                </div>
                <ManageIntegrationsButton onIntegrationsModalOpen={setIsIntegrationsModalOpen} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <IntegrationsModal
        isOpen={isIntegrationsModalOpen}
        onClose={() => setIsIntegrationsModalOpen(false)}
      />
    </div>
  );
}
