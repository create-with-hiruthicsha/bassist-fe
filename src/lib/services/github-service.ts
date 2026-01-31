// GitHub API service without logging

import {
  GitHubRepository,
  GitHubOrganization,
  GitHubUser,
  GitHubSearchResult,
} from '../interfaces';
import { ErrorHandler } from '../utils/error-handler';

class GitHubApiService {
  private baseUrl = 'https://api.github.com';
  private accessToken: string | null = null;

  constructor() {
    // Service initialized
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `token ${this.accessToken}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw ErrorHandler.handleFetchError(response);
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw ErrorHandler.handleParseError(error as Error, 'Failed to parse GitHub API response');
    }
  }

  // Get user repositories
  async getUserRepositories(): Promise<GitHubRepository[]> {
    try {
      const repos = await this.makeRequest<GitHubRepository[]>('/user/repos?sort=updated&per_page=100');
      return repos;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Get repositories for a specific user
  async getUserRepositoriesByUsername(username: string): Promise<GitHubRepository[]> {
    try {
      const repos = await this.makeRequest<GitHubRepository[]>(`/users/${username}/repos?sort=updated&per_page=100`);
      return repos;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Get user organizations
  async getUserOrganizations(): Promise<GitHubOrganization[]> {
    try {
      const orgs = await this.makeRequest<GitHubOrganization[]>('/user/orgs');
      return orgs;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<GitHubUser> {
    try {
      const user = await this.makeRequest<GitHubUser>('/user');
      return user;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Search repositories
  async searchRepositories(query: string, owner?: string): Promise<GitHubSearchResult> {
    try {
      let searchQuery = query;
      if (owner) {
        searchQuery = `${query} user:${owner}`;
      }

      const response = await this.makeRequest<GitHubSearchResult>(`/search/repositories?q=${encodeURIComponent(searchQuery)}&sort=updated&per_page=30`);
      return response;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Search users and organizations
  async searchUsers(query: string): Promise<{ users: GitHubUser[]; organizations: GitHubOrganization[] }> {
    try {
      const [usersResponse, orgsResponse] = await Promise.all([
        this.makeRequest<{ items: GitHubUser[] }>(`/search/users?q=${encodeURIComponent(query)}&per_page=10`),
        this.makeRequest<{ items: GitHubOrganization[] }>(`/search/users?q=${encodeURIComponent(query)}&type=org&per_page=10`)
      ]);

      return {
        users: usersResponse.items,
        organizations: orgsResponse.items
      };
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Get organization repositories
  async getOrganizationRepositories(org: string): Promise<GitHubRepository[]> {
    try {
      const repos = await this.makeRequest<GitHubRepository[]>(`/orgs/${org}/repos?sort=updated&per_page=100`);
      return repos;
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Get all user repositories (including from organizations)
  async getAllUserRepositories(): Promise<GitHubRepository[]> {
    try {
      const [userRepos, userOrgs] = await Promise.all([
        this.getUserRepositories(),
        this.getUserOrganizations()
      ]);

      const orgRepos = await Promise.all(
        userOrgs.map(org => this.getOrganizationRepositories(org.login))
      );

      const allRepos = [
        ...userRepos,
        ...orgRepos.flat()
      ];

      // Remove duplicates based on id
      const uniqueRepos = allRepos.filter((repo, index, self) => 
        index === self.findIndex(r => r.id === repo.id)
      );

      return uniqueRepos;
    } catch {
      // Fall back to user repositories only
      return this.getUserRepositories();
    }
  }

  // Search repositories with autocomplete
  async searchRepositoriesAutocomplete(query: string): Promise<GitHubRepository[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await this.searchRepositories(query);
      
      return response.items.slice(0, 10);
    } catch (error) {
      throw ErrorHandler.handleApiError(error as Error);
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

// Create and export singleton instance
export const githubApi = new GitHubApiService();