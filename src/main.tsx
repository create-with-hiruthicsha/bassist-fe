import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { PostHogProvider } from 'posthog-js/react';

import App from './App.tsx';

// Only enable PostHog in production and staging environments
const isPostHogEnabled = import.meta.env.MODE === 'production' || import.meta.env.MODE === 'staging';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPostHogEnabled ? (
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
        options={{
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          defaults: '2025-05-24',
          capture_exceptions: true, // This enables capturing exceptions using Error Tracking
          debug: import.meta.env.MODE === 'development',
        }}
      >
        <App />
      </PostHogProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);