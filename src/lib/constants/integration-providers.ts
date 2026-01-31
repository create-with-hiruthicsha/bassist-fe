import { IntegrationProvider } from '../interfaces';

export const INTEGRATION_PROVIDERS: Omit<IntegrationProvider, 'connected'>[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect to GitHub to access repositories and create issues',
    icon: 'github',
    color: '#24292e',
    scopes: ['repo', 'user:email', 'read:org'],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Connect to GitLab to access projects and create issues',
    icon: 'gitlab',
    color: '#fc6d26',
    scopes: ['read_api', 'read_user', 'read_repository'],
    implementationStatus: 'Coming soon...'
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Connect to Bitbucket to access repositories and create issues',
    icon: 'bitbucket',
    color: '#0052cc',
    scopes: ['repositories:read', 'repositories:write', 'issues:write'],
    implementationStatus: 'Coming soon...'
  },
  {
    id: 'azure',
    name: 'Azure DevOps',
    description: 'Connect to Azure DevOps to access projects and create work items',
    icon: 'azure',
    color: '#0078d4',
    scopes: ['vso.work', 'vso.code', 'vso.project'],
    implementationStatus: 'Coming soon...'
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Connect to Jira to access projects and create issues',
    icon: 'jira',
    color: '#0052cc',
    scopes: ['read:jira-work', 'write:jira-work', 'manage:jira-project', 'offline-access']
  }
];

export const PROVIDER_IDS = {
  GITHUB: 'github',
  GITLAB: 'gitlab',
  BITBUCKET: 'bitbucket',
  AZURE: 'azure',
  JIRA: 'jira'
} as const;

export type ProviderId = typeof PROVIDER_IDS[keyof typeof PROVIDER_IDS];
