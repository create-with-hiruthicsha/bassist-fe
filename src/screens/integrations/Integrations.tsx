import IntegrationManager from '../../components/IntegrationManager';
import APIKeyManager from '../../components/APIKeyManager';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import { styles } from './styles';

export default function Integrations() {
  return (
    <div className={styles.container}>
      <PageHeader backTo="/" />

      <main className={pageMainClasses}>
        <PageTitle
          title="Integrations"
          subtitle="Connect external services to enhance your workflow"
        />
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
