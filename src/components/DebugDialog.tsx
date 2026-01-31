import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface DebugDialogProps {
  isOpen: boolean;
  onClose: () => void;
}


const DebugDialog: React.FC<DebugDialogProps> = ({ isOpen, onClose }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get frontend build mode
  const frontendMode = import.meta.env.MODE;

  // Get frontend environment variables
  const frontendEnv = {
    mode: frontendMode,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  };

  // Determine backend environment based on API URL
  const getBackendEnvironment = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiUrl?.includes('localhost') || apiUrl?.includes('127.0.0.1')) {
      return 'development';
    } else if (apiUrl?.includes('hiruthicsha.com')) {
      return 'production';
    }
    return 'unknown';
  };

  const backendEnvironment = getBackendEnvironment();


  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatValue = (value: string | undefined) => {
    if (!value) return 'Not set';
    if (value.length > 50) {
      return `${value.substring(0, 47)}...`;
    }
    return value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Debug Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Frontend Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Frontend</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-700">Build Mode:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    frontendMode === 'development' 
                      ? 'bg-green-100 text-green-800' 
                      : frontendMode === 'production'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {frontendMode}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(frontendMode, 'frontend-mode')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedField === 'frontend-mode' ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              {Object.entries(frontendEnv).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-700">{key}:</span>
                    <span className="ml-2 text-gray-600 font-mono text-sm">
                      {formatValue(value)}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(value || '', key)}
                    className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
                  >
                    {copiedField === key ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

           {/* Backend Information */}
           <div>
             <h3 className="text-lg font-medium text-gray-900 mb-3">Backend</h3>
             <div className="space-y-2">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Environment:</span>
                   <span className={`ml-2 px-2 py-1 rounded text-sm ${
                     backendEnvironment === 'production' 
                       ? 'bg-red-100 text-red-800' 
                       : backendEnvironment === 'development'
                       ? 'bg-green-100 text-green-800'
                       : 'bg-yellow-100 text-yellow-800'
                   }`}>
                     {backendEnvironment}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(backendEnvironment, 'backend-env')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'backend-env' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">API URL:</span>
                   <span className="ml-2 text-gray-600 font-mono text-sm">
                     {formatValue(import.meta.env.VITE_API_BASE_URL)}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(import.meta.env.VITE_API_BASE_URL || '', 'api-url')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'api-url' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>
             </div>
           </div>

           {/* Additional Info */}
           <div>
             <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Info</h3>
             <div className="space-y-2">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Screen Resolution:</span>
                   <span className="ml-2 text-gray-600 text-sm">
                     {window.screen.width}x{window.screen.height}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(`${window.screen.width}x${window.screen.height}`, 'screen-resolution')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'screen-resolution' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Viewport Size:</span>
                   <span className="ml-2 text-gray-600 text-sm">
                     {window.innerWidth}x{window.innerHeight}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(`${window.innerWidth}x${window.innerHeight}`, 'viewport-size')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'viewport-size' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Browser:</span>
                   <span className="ml-2 text-gray-600 text-sm">
                     {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                      navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                      navigator.userAgent.includes('Safari') ? 'Safari' : 
                      navigator.userAgent.includes('Edge') ? 'Edge' : 'Unknown'}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(navigator.userAgent, 'user-agent')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'user-agent' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Current URL:</span>
                   <span className="ml-2 text-gray-600 text-sm">
                     {window.location.href}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(window.location.href, 'current-url')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'current-url' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div className="flex-1 min-w-0">
                   <span className="font-medium text-gray-700">Local Storage:</span>
                   <div className="ml-2 text-gray-600 text-sm">
                     {localStorage.length > 0 ? (
                       <div className="mt-1">
                         <div className="text-xs text-gray-500 mb-1">{localStorage.length} items:</div>
                         {Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).map((key, index) => (
                           <div key={index} className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded mb-1">
                             {key}
                           </div>
                         ))}
                       </div>
                     ) : (
                       <span className="text-gray-500">Empty</span>
                     )}
                   </div>
                 </div>
                 <button
                   onClick={() => {
                     const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
                     copyToClipboard(`Local Storage (${localStorage.length} items): ${keys.join(', ')}`, 'local-storage');
                   }}
                   className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
                 >
                   {copiedField === 'local-storage' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div className="flex-1 min-w-0">
                   <span className="font-medium text-gray-700">Session Storage:</span>
                   <div className="ml-2 text-gray-600 text-sm">
                     {sessionStorage.length > 0 ? (
                       <div className="mt-1">
                         <div className="text-xs text-gray-500 mb-1">{sessionStorage.length} items:</div>
                         {Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i)).map((key, index) => (
                           <div key={index} className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded mb-1">
                             {key}
                           </div>
                         ))}
                       </div>
                     ) : (
                       <span className="text-gray-500">Empty</span>
                     )}
                   </div>
                 </div>
                 <button
                   onClick={() => {
                     const keys = Array.from({ length: sessionStorage.length }, (_, i) => sessionStorage.key(i));
                     copyToClipboard(`Session Storage (${sessionStorage.length} items): ${keys.join(', ')}`, 'session-storage');
                   }}
                   className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
                 >
                   {copiedField === 'session-storage' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Online Status:</span>
                   <span className={`ml-2 px-2 py-1 rounded text-sm ${
                     navigator.onLine ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                   }`}>
                     {navigator.onLine ? 'Online' : 'Offline'}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(navigator.onLine ? 'Online' : 'Offline', 'online-status')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'online-status' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Language:</span>
                   <span className="ml-2 text-gray-600 text-sm">
                     {navigator.language}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(navigator.language, 'language')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'language' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                 <div>
                   <span className="font-medium text-gray-700">Timezone:</span>
                   <span className="ml-2 text-gray-600 text-sm">
                     {Intl.DateTimeFormat().resolvedOptions().timeZone}
                   </span>
                 </div>
                 <button
                   onClick={() => copyToClipboard(Intl.DateTimeFormat().resolvedOptions().timeZone, 'timezone')}
                   className="text-gray-400 hover:text-gray-600 transition-colors"
                 >
                   {copiedField === 'timezone' ? <Check size={16} /> : <Copy size={16} />}
                 </button>
               </div>
             </div>
           </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugDialog;
