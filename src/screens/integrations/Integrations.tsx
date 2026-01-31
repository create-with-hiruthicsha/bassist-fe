import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import IntegrationManager from '../../components/IntegrationManager';

export default function Integrations() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  Integrations
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Connect external services to enhance your workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <IntegrationManager />

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            How Integrations Work
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
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
