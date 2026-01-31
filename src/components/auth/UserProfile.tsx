import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../lib/utils/logger';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } catch {
      logger.error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center space-x-4">
        {user?.user_metadata?.avatar_url && (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Profile" 
            className="h-10 w-10 rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {user?.user_metadata?.full_name || user?.email}
          </p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSignOut}
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}