import { ProviderId } from './integration-providers';

export interface OAuthUrlBuilder {
  (clientId: string, scopes: string[], state: string, redirectUri: string): string;
}

export const OAUTH_URL_BUILDERS: Record<ProviderId, OAuthUrlBuilder> = {
  github: (clientId, scopes, state, redirectUri) => 
    `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scopes.join(',')}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`,
  
  gitlab: (clientId, scopes, state, redirectUri) => 
    `https://gitlab.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes.join('+')}&state=${state}`,
  
  bitbucket: (clientId, _scopes, state) => 
    `https://bitbucket.org/site/oauth2/authorize?client_id=${clientId}&response_type=code&state=${state}`,
  
  azure: (clientId, scopes, state, redirectUri) => 
    `https://app.vssps.visualstudio.com/oauth2/authorize?client_id=${clientId}&response_type=Assertion&scope=${scopes.join(' ')}&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`,
  
  jira: (clientId, scopes, state, redirectUri) => 
    `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${scopes.join(' ')}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code&prompt=consent`
};

export const API_TEST_ENDPOINTS: Record<ProviderId, string> = {
  github: 'https://api.github.com/user',
  gitlab: 'https://gitlab.com/api/v4/user',
  bitbucket: 'https://api.bitbucket.org/2.0/user',
  azure: '', // Azure DevOps test would require specific API endpoint
  jira: 'https://api.atlassian.com/me'
};

export const AUTH_HEADER_BUILDERS: Record<ProviderId, (token: string) => HeadersInit> = {
  github: (token) => ({ 'Authorization': `token ${token}` }),
  gitlab: (token) => ({ 'Authorization': `Bearer ${token}` }),
  bitbucket: (token) => ({ 'Authorization': `Bearer ${token}` }),
  azure: (token) => ({ 'Authorization': `Bearer ${token}` }),
  jira: (token) => ({ 'Authorization': `Bearer ${token}` })
};

export const CLIENT_ID_ENV_VARS: Record<ProviderId, string> = {
  github: 'VITE_GITHUB_OAUTH_CLIENT_ID',
  gitlab: 'VITE_GITLAB_CLIENT_ID',
  bitbucket: 'VITE_BITBUCKET_CLIENT_ID',
  azure: 'VITE_AZURE_CLIENT_ID',
  jira: 'VITE_JIRA_OAUTH_CLIENT_ID'
};
