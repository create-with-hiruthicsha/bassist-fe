import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import IntegrationManager from '../../components/IntegrationManager';
import APIKeyManager from '../../components/APIKeyManager';
import { styles } from './styles';

export default function Integrations() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <button
                onClick={() => navigate('/')}
                className={styles.backButton}
              >
                <ArrowLeft className={styles.backIcon} />
                <span className={styles.backText}>Back</span>
              </button>
              <div>
                <h1 className={styles.title}>
                  Integrations
                </h1>
                <p className={styles.subtitle}>
                  Connect external services to enhance your workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <IntegrationManager />

        <div className="mt-12">
          <APIKeyManager />
        </div>

        {/* Help Section */}
        <div className={styles.help.container}>
          <h3 className={styles.help.title}>
            How Integrations Work
          </h3>
          <div className={styles.help.list}>
            <p>
              • <strong>Connect once:</strong> Authorize access to your external services
            </p>
            <p>
              • <strong>Use anywhere:</strong> Access your repositories and create tasks seamlessly
            </p>
            <p>
              • <strong>Secure storage:</strong> Your tokens are stored safely on the platform
            </p>
            <p>
              • <strong>Easy management:</strong> Connect, test, and disconnect as needed
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
