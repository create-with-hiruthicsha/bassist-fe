import { useState } from 'react';
import { supabase } from '../../lib/services/supabase-service';
import { logger } from '../../lib/utils/logger';

const demoLoginEnabled =
  import.meta.env.VITE_HACKATHON_DEMO_LOGIN_ENABLED === 'true';

const demoEmail = import.meta.env.VITE_HACKATHON_DEMO_USER_EMAIL;
const demoPassword = import.meta.env.VITE_HACKATHON_DEMO_USER_PASSWORD;

export default function HackathonDemoLogin() {
  const [loading, setLoading] = useState(false);

  if (!demoLoginEnabled || !demoEmail || !demoPassword) {
    return null;
  }

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        logger.error(`Error signing in demo user: ${error.message}`);
      }
    } catch (err) {
      logger.error(
        `Unexpected error signing in demo user: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDemoLogin}
      disabled={loading}
      className="w-full mt-2 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      {loading ? 'Signing in demo user...' : 'Log in as Hackathon Demo User'}
    </button>
  );
}

