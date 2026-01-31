import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Github, 
  Gitlab, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Lock,
  XCircle
} from 'lucide-react';

const OAuthResult: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  
  // Get parameters from URL
  const status = (searchParams.get('oauth') as 'success' | 'error' | 'expired' | 'invalid') || 'error';
  const provider = searchParams.get('provider') || 'integration';
  const message = searchParams.get('message') || undefined;

  const handleGoToIntegrations = useCallback(() => {
    navigate('/integrations');
  }, [navigate]);

  const getProviderIcon = (providerName: string) => {
    const iconProps = { className: "w-8 h-8" };
    
    switch (providerName.toLowerCase()) {
      case 'github':
        return <Github {...iconProps} />;
      case 'gitlab':
        return <Gitlab {...iconProps} />;
      case 'bitbucket':
        return <Settings {...iconProps} />;
      case 'azure':
        return <Settings {...iconProps} />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Connected!`,
          statusText: 'Integration successful',
          message: message || `Your ${provider} account has been successfully connected. You can now use ${provider} features in Bassist.`,
          icon: getProviderIcon(provider),
          iconBg: provider === 'github' ? 'bg-gray-800' : 
                  provider === 'gitlab' ? 'bg-orange-500' :
                  provider === 'bitbucket' ? 'bg-blue-600' : 'bg-blue-500',
          gradient: 'from-blue-500 to-purple-600',
          buttonText: 'Go to Integrations',
          statusIcon: <CheckCircle className="w-5 h-5 text-green-600" />
        };
      case 'expired':
        return {
          title: 'Session Expired',
          statusText: 'OAuth session has expired',
          message: message || 'The OAuth session has expired or is invalid. Please try connecting your account again.',
          icon: <AlertTriangle className="w-8 h-8" />,
          iconBg: 'bg-orange-500',
          gradient: 'from-orange-400 to-red-500',
          buttonText: 'Try Again',
          statusIcon: <AlertTriangle className="w-5 h-5 text-orange-600" />
        };
      case 'invalid':
        return {
          title: 'Invalid Request',
          statusText: 'Missing security parameter',
          message: message || 'The OAuth request is missing required security parameters. Please try connecting your account again from the integrations page.',
          icon: <Lock className="w-8 h-8" />,
          iconBg: 'bg-purple-600',
          gradient: 'from-purple-500 to-indigo-600',
          buttonText: 'Go to Integrations',
          statusIcon: <Lock className="w-5 h-5 text-purple-600" />
        };
      case 'error':
      default:
        return {
          title: 'Integration Failed',
          statusText: 'Connection unsuccessful',
          message: message || 'There was an error connecting your account. Please try again or contact support if the problem persists.',
          icon: <XCircle className="w-8 h-8" />,
          iconBg: 'bg-red-500',
          gradient: 'from-red-400 to-pink-500',
          buttonText: 'Go to Integrations',
          statusIcon: <XCircle className="w-5 h-5 text-red-600" />
        };
    }
  };

  const config = getStatusConfig();
  const isInPopup = !!window.opener;
  const isCompletedOrFailed = status === 'success' || status === 'error';

  const handleClosePopup = useCallback(() => {
    // If success, notify the opener before closing
    if (status === 'success' && window.opener) {
      try {
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', provider }, window.location.origin);
      } catch (e) {
        console.error('Failed to notify opener:', e);
      }
    }
    window.close();
  }, [status, provider]);

  // Auto-redirect only if NOT in popup
  React.useEffect(() => {
    // Don't auto-close or auto-redirect if we're in a popup
    if (isInPopup) {
      return;
    }

    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGoToIntegrations();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, handleGoToIntegrations, isInPopup]);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center p-5`}>
      <div className="bg-white rounded-2xl p-10 shadow-2xl text-center max-w-md w-full">
        {/* Icon */}
        <div className={`w-16 h-16 mx-auto mb-6 rounded-xl ${config.iconBg} flex items-center justify-center text-white`}>
          {config.icon}
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          {config.title}
        </h1>
        
        {/* Status */}
        <div className={`text-lg font-medium mb-6 flex items-center justify-center gap-2 ${
          status === 'success' ? 'text-green-600' : 
          status === 'expired' ? 'text-orange-600' :
          status === 'invalid' ? 'text-purple-600' : 'text-red-600'
        }`}>
          {config.statusIcon}
          {config.statusText}
        </div>
        
        {/* Message */}
        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {config.message}
        </p>
        
        {/* Button */}
        {isInPopup && isCompletedOrFailed ? (
          // Show close button when in popup and completed/failed
          <button
            onClick={handleClosePopup}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <XCircle className="w-4 h-4" />
            Close
          </button>
        ) : (
          // Show normal button when not in popup
          <>
            <button
              onClick={handleGoToIntegrations}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {config.buttonText}
            </button>
            
            {/* Auto-redirect indicator for success (only when not in popup) */}
            {status === 'success' && !isInPopup && (
              <p className="text-gray-500 text-xs mt-4">
                Redirecting automatically in {countdown} seconds...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthResult;
