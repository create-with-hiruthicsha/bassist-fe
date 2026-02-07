import { Sun, Moon, Monitor, Palette, Settings, Copy, RefreshCw, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { organizationService } from '../../lib/services/organization-service';
import IntegrationsModal from '../../components/IntegrationsModal';
import ManageIntegrationsButton from '../../components/Integrations';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import { styles } from './styles';

export default function Preferences() {
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
    <div className={styles.container}>
      <PageHeader backTo={-1} />

      <main className={pageMainClasses}>
        <PageTitle
          title={
            <span className="flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Preferences
            </span>
          }
        />
        <div className={styles.contentSpace}>
          {/* Theme Selection */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Appearance
              </h2>
              <p className={styles.sectionDescription}>
                Choose how Bassist looks to you. You can always change this later.
              </p>
            </div>

            <div className={styles.themeList}>
              {themes.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`
                    ${styles.themeButton.base}
                    ${theme === value
                      ? styles.themeButton.active
                      : styles.themeButton.inactive
                    }
                  `}
                >
                  <div className={`
                    ${styles.themeButton.iconContainer}
                    ${theme === value
                      ? styles.themeButton.iconContainerActive
                      : styles.themeButton.iconContainerInactive
                    }
                  `}>
                    <Icon className={`
                      ${styles.themeButton.icon}
                      ${theme === value
                        ? styles.themeButton.iconActive
                        : styles.themeButton.iconInactive
                      }
                    `} />
                  </div>
                  <div className={styles.themeButton.textContainer}>
                    <div className={styles.themeButton.labelRow}>
                      <h3 className={`
                        ${styles.themeButton.label}
                        ${theme === value
                          ? styles.themeButton.labelActive
                          : styles.themeButton.labelInactive
                        }
                      `}>
                        {label}
                      </h3>
                      {theme === value && (
                        <div className={styles.themeButton.dot}></div>
                      )}
                    </div>
                    <p className={`
                      ${styles.themeButton.desc}
                      ${theme === value
                        ? styles.themeButton.descActive
                        : styles.themeButton.descInactive
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
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                General
              </h2>
              <p className={styles.sectionDescription}>
                Other application preferences and settings.
              </p>
            </div>
          </div>

          {/* Organization Settings */}
          {currentOrganization && (
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  Organization Settings
                </h2>
                <p className={styles.sectionDescription}>
                  Manage your organization's access and invite new members.
                </p>
              </div>

              <div className={styles.org.container}>
                <div className={styles.org.inner}>
                  <div className={styles.org.header}>
                    <div>
                      <h3 className={styles.org.title}>
                        {currentOrganization.name} Join Code
                      </h3>
                      <p className={styles.org.subtitle}>
                        Anyone with this code can join your organization. Code changes automatically after someone joins.
                      </p>
                    </div>
                    <button
                      onClick={handleRotateCode}
                      disabled={isRotating || isLoadingCode}
                      className={styles.org.refreshButton}
                      title="Generate new code"
                    >
                      <RefreshCw className={`${styles.org.icon} ${isRotating ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <div className={styles.org.codeRow}>
                    <div className={styles.org.codeDisplay}>
                      {isLoadingCode ? (
                        <div className={styles.org.loadingSkeleton}></div>
                      ) : (
                        joinCode || 'No active code'
                      )}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      disabled={!joinCode || isLoadingCode}
                      className={`
                        ${styles.org.copyButton.base}
                        ${copied
                          ? styles.org.copyButton.active
                          : styles.org.copyButton.inactive
                        }
                      `}
                    >
                      {copied ? <Check className={styles.org.copyButton.icon} /> : <Copy className={styles.org.copyButton.icon} />}
                      <span className={styles.org.copyButton.text}>
                        {copied ? 'Copied!' : 'Copy'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Section */}
          <div className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Integrations
              </h2>
              <p className={styles.sectionDescription}>
                Connect external services to enhance your workflow
              </p>
            </div>

            <div className={styles.integration.container}>
              <div className={styles.integration.layout}>
                <div className={styles.integration.info}>
                  <div className={styles.integration.iconBox}>
                    <Settings className={styles.integration.icon} />
                  </div>
                  <div>
                    <h3 className={styles.integration.title}>
                      External Services
                    </h3>
                    <p className={styles.integration.desc}>
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
