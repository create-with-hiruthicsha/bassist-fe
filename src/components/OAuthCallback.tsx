import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { integrationService } from '../lib';
import { logger } from '../lib/utils/logger';

interface OAuthCallbackProps {
  onComplete: () => void;
}

export default function OAuthCallback({ onComplete }: OAuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const provider = window.location.pathname.split('/').pop(); // Get provider from URL

        if (!code || !state || !provider) {
          throw new Error('Missing OAuth parameters');
        }

        // Handle the OAuth callback
        await integrationService.handleOAuthCallback(provider, code, state);
        
        setStatus('success');
        setMessage('Integration connected successfully!');
        
        // Redirect back to integrations page after a delay
        setTimeout(() => {
          onComplete();
        }, 2000);
      } catch (error) {
        logger.error('OAuth callback failed');
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'OAuth callback failed');
      }
    };

    handleCallback();
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
          )}
          {status === 'error' && (
            <XCircle className="w-16 h-16 text-red-600 mx-auto" />
          )}
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          {status === 'loading' && 'Connecting...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Error'}
        </h1>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        {status === 'error' && (
          <button
            onClick={onComplete}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}
