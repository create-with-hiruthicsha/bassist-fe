// API Interfaces - Extracted from lib files for better organization

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    type: 'User' | 'Organization';
  };
  private: boolean;
  description?: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  description?: string;
  type: 'Organization';
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  type: 'User';
}

export interface GitHubSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface IntegrationProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  connected: boolean;
  scopes: string[];
  authUrl?: string;
  implementationStatus?: string;
}

export interface IntegrationConnection {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scopes: string[];
  connectedAt: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string;
  epic: string;
  time_estimate: string;
  platform: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  title: string;
  content: string;
  format: string;
  created_at: string;
  updated_at: string;
}
