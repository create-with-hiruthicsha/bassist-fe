/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GITHUB_OAUTH_CLIENT_ID: string;
  readonly VITE_JIRA_OAUTH_CLIENT_ID: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_BASE_URL_VERSION: string;
  readonly VITE_PUBLIC_POSTHOG_KEY: string;
  readonly VITE_PUBLIC_POSTHOG_HOST: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}