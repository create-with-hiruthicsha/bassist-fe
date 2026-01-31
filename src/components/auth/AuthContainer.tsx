import GoogleLogin from './GoogleLogin';
import HackathonDemoLogin from './HackathonDemoLogin';

export default function AuthContainer() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">Sign In</h2>
        <GoogleLogin />
        <HackathonDemoLogin />
      </div>
    </div>
  );
}