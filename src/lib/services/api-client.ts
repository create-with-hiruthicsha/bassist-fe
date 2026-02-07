// API Client without logging

import {
  TaskGenerationRequest,
  TaskGenerationResponse,
  CreateTasksRequest,
  CreateTasksResponse,
  DocumentGenerationRequest,
  DocumentGenerationResponse,
  ProgressEvent,
  ExecuteMCPQueryResponse
} from '../interfaces';
import { ErrorHandler } from '../utils/error-handler';
import { ValidationUtils } from '../utils/validation';
import { getSessionIdWithFallback } from '../utils/posthog-session';
import { supabase } from './supabase-service';

// API base URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL_VERSION = import.meta.env.VITE_API_BASE_URL_VERSION;

class ApiClient {
  private baseUrl: string;
  private baseUrlWithoutVersion: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}${API_BASE_URL_VERSION}`;
    this.baseUrlWithoutVersion = `${API_BASE_URL}`;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw ErrorHandler.createApiError('User not authenticated', 401, 'AUTH_ERROR');
    }

    const sessionId = getSessionIdWithFallback();

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'X-Session-ID': sessionId,
      'X-Organization-ID': session.user.user_metadata?.organizationId || '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      await ErrorHandler.handleFetchError(response);
    }

    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw ErrorHandler.handleParseError(error as Error, 'Response parsing failed');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createFormData(data: any): FormData {
    const formData = new FormData();
    
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;
      
      if (value instanceof File) {
        const validation = ValidationUtils.validateFile(value);
        if (!validation.valid) {
          continue;
        }
        formData.append(key, value);
      } else if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
        value.forEach((file) => {
          const validation = ValidationUtils.validateFile(file);
          if (validation.valid) {
            formData.append(key, file);
          }
        });
      } else if (typeof value === 'boolean') {
        // Always include boolean values, even if false
        formData.append(key, String(value));
      } else if (typeof value === 'string' || typeof value === 'number') {
        formData.append(key, String(value));
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      }
    }
    
    return formData;
  }

  // Task Generation
  async generateTasks(request: TaskGenerationRequest): Promise<TaskGenerationResponse> {
    const headers = await this.getAuthHeaders();
    const formData = this.createFormData(request);
    
    const response = await fetch(`${this.baseUrl}/tasks/generate-tasks`, {
      method: 'POST',
      headers,
      body: formData
    });

    return this.handleResponse<TaskGenerationResponse>(response);
  }

  async generateTasksStream(
    request: TaskGenerationRequest,
    onProgress: (event: ProgressEvent) => void
  ): Promise<TaskGenerationResponse> {
    const headers = await this.getAuthHeaders();
    const formData = this.createFormData(request);
    
    const response = await fetch(`${this.baseUrl}/tasks/generate-tasks-stream`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    if (!response.body) {
      throw ErrorHandler.createApiError('No response body', 500, 'STREAM_ERROR');
    }

    return this.handleStreamResponse(response, onProgress);
  }

  async generateTasksWithProgress(
    request: TaskGenerationRequest,
    onProgress: (event: ProgressEvent) => void,
    onError: (error: Error) => void,
    onComplete: (result: TaskGenerationResponse) => void
  ): Promise<void> {
    try {
      const result = await this.generateTasksStream(request, onProgress);
      onComplete(result);
    } catch (error) {
      onError(error as Error);
    }
  }

  // Task Creation
  async createTasks(request: CreateTasksRequest): Promise<CreateTasksResponse> {
    const headers = await this.getAuthHeaders();
    const formData = this.createFormData(request);
    
    const response = await fetch(`${this.baseUrl}/tasks/create-tasks`, {
      method: 'POST',
      headers,
      body: formData
    });

    return this.handleResponse<CreateTasksResponse>(response);
  }

  async createTasksStream(
    request: CreateTasksRequest,
    onProgress: (event: ProgressEvent) => void
  ): Promise<CreateTasksResponse> {
    const headers = await this.getAuthHeaders();
    const formData = this.createFormData(request);
    
    const response = await fetch(`${this.baseUrl}/tasks/create-tasks-stream`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    if (!response.body) {
      throw ErrorHandler.createApiError('No response body', 500, 'STREAM_ERROR');
    }

    return this.handleStreamResponse(response, onProgress);
  }

  async createTasksWithProgress(
    request: CreateTasksRequest,
    onProgress: (event: ProgressEvent) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      await this.createTasksStream(request, onProgress);
      onComplete();
    } catch (error) {
      onError(error as Error);
    }
  }

  // Document Generation
  async generateDocument(request: DocumentGenerationRequest): Promise<DocumentGenerationResponse> {
    const headers = await this.getAuthHeaders();
    const formData = this.createFormData(request);
    
    const response = await fetch(`${this.baseUrl}/document/generate-doc`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      await ErrorHandler.handleFetchError(response);
    }

    // For DOCX format, handle binary response
    if (request.format === 'docx') {
      const buffer = await response.arrayBuffer();
      return {
        status: 'success',
        output: buffer
      };
    }

    // For other formats, handle as JSON
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw ErrorHandler.handleParseError(error as Error, 'Response parsing failed');
    }
  }

  async generateDocumentStream(
    request: DocumentGenerationRequest,
    onProgress: (event: ProgressEvent) => void
  ): Promise<DocumentGenerationResponse> {
    const headers = await this.getAuthHeaders();
    const formData = this.createFormData(request);
    
    const response = await fetch(`${this.baseUrl}/document/generate-doc-stream`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    if (!response.body) {
      throw ErrorHandler.createApiError('No response body', 500, 'STREAM_ERROR');
    }

    return this.handleStreamResponse(response, onProgress);
  }

  async generateDocumentWithProgress(
    request: DocumentGenerationRequest,
    onProgress: (event: ProgressEvent) => void,
    onError: (error: Error) => void,
    onComplete: (result: DocumentGenerationResponse) => void
  ): Promise<void> {
    try {
      // For DOCX format, use non-streaming endpoint to get the complete response
      // and then create a document file
      if (request.format === 'docx') {
        const result = await this.generateDocument(request);
        onComplete(result);
      } else {
        // For other formats (markdown), use streaming
        const result = await this.generateDocumentStream(request, onProgress);
        onComplete(result);
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  // Stream Response Handler
  private async handleStreamResponse<T>(
    response: Response,
    onProgress: (event: ProgressEvent) => void
  ): Promise<T> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let result: T | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;

          try {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                break;
              }

              const event: ProgressEvent = JSON.parse(data);
              onProgress(event);

              if (event.type === 'complete') {
                // Backend sends a single complete event with JSON payload only.
                try {
                  const parsedResult = JSON.parse(event.message);
                  if (typeof parsedResult === 'object' && parsedResult !== null) {
                    result = parsedResult as T;
                  }
                } catch {
                  // Ignore non-JSON complete messages
                }
              }
            }
          } catch {
            // Skip malformed events
            continue;
          }
        }
      }

      if (!result) {
        throw ErrorHandler.createApiError('No result received from stream', 500, 'STREAM_ERROR');
      }

      return result;
    } catch (error) {
      throw ErrorHandler.handleParseError(error as Error, 'Stream processing failed');
    } finally {
      reader.releaseLock();
    }
  }

  // Task Breakdown Parser
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parseTaskBreakdown(response: string): any {
    try {
      // Try to parse as JSON first
      if (response.trim().startsWith('{') || response.trim().startsWith('[')) {
        return JSON.parse(response);
      }

      // Try to extract JSON from markdown
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to find JSON object in the text
      const jsonObjectMatch = response.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        return JSON.parse(jsonObjectMatch[0]);
      }

      throw new Error('No valid JSON found in response');
    } catch (error) {
      throw ErrorHandler.handleParseError(error as Error, 'Failed to parse task breakdown response');
    }
  }

  // File Validation
  async validateFile(file: File): Promise<{ valid: boolean; error?: string }> {
    const result = ValidationUtils.validateFile(file);
    
    if (!result.valid) {
      return { valid: false, error: result.error };
    }

    return { valid: true };
  }

  // Integration OAuth Methods
  async startOAuthForUser(provider: string, organizationId?: string): Promise<{ state: string }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrlWithoutVersion}integrations/oauth/start`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, organizationId })
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    return this.handleResponse<{ state: string }>(response);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getUserIntegrations(): Promise<{ integrations: any[] }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrlWithoutVersion}integrations/connected`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.handleResponse<{ integrations: any[] }>(response);
  }

  async disconnectIntegration(provider: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrlWithoutVersion}integrations/${provider}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }
  }

  // API Key Management
  async listApiKeys(): Promise<{ providers: string[] }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrlWithoutVersion}integrations/api-keys`, {
      method: 'GET',
      headers
    });
    return this.handleResponse<{ providers: string[] }>(response);
  }

  async upsertApiKey(provider: string, apiKey: string): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrlWithoutVersion}integrations/api-keys`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider, apiKey })
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async deleteApiKey(provider: string): Promise<{ success: boolean; message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrlWithoutVersion}integrations/api-keys/${provider}`, {
      method: 'DELETE',
      headers
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }

  async getJiraProjects(): Promise<any[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrlWithoutVersion}jira/projects`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    return this.handleResponse<any[]>(response);
  }

  // Product Intelligence (Research UI)
  async getProductIntelligenceStatus(): Promise<{ running: boolean }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/product-intelligence/app/status`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) throw await ErrorHandler.handleFetchError(response);
    return this.handleResponse<{ running: boolean }>(response);
  }

  async runProductIntelligence(_payload?: { projectId?: string }): Promise<{ message?: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/product-intelligence/app/run`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(_payload ?? {}),
    });
    if (response.status === 409) {
      const data = await response.json().catch(() => ({}));
      throw ErrorHandler.createApiError(
        (data as { error?: string })?.error ?? 'Research already running',
        409,
        'CONFLICT',
      );
    }
    if (!response.ok) throw await ErrorHandler.handleFetchError(response);
    return this.handleResponse<{ message?: string }>(response);
  }

  async getProductIntelligenceUnderstanding(projectId?: string): Promise<{
    valueProposition?: string;
    targetUsers?: string[];
    capabilities?: { name: string; description: string }[];
    differentiators?: string[];
    gapsAndLimitations?: string[];
    periodEnd?: string;
    generatedAt?: string;
  }> {
    const headers = await this.getAuthHeaders();
    const url = projectId
      ? `${this.baseUrl}/product-intelligence/app/understanding?projectId=${encodeURIComponent(projectId)}`
      : `${this.baseUrl}/product-intelligence/app/understanding`;
    const response = await fetch(url, { method: 'GET', headers });
    if (!response.ok) throw await ErrorHandler.handleFetchError(response);
    return this.handleResponse(response);
  }

  // Bug Fixing
  async getAssignedIssues(params: {
    platform: string;
    owner?: string;
    repo?: string;
    projectId?: string;
  }): Promise<{ issues: Array<{
    id: number;
    number?: number;
    iid?: number;
    title: string;
    body?: string;
    description?: string;
    state: string;
    created_at: string;
    updated_at: string;
  }> }> {
    const headers = await this.getAuthHeaders();
    const queryParams = new URLSearchParams();
    
    queryParams.append('platform', params.platform);
    if (params.owner) queryParams.append('owner', params.owner);
    if (params.repo) queryParams.append('repo', params.repo);
    if (params.projectId) queryParams.append('projectId', params.projectId);

    const response = await fetch(`${this.baseUrl}/bug-fix/issues?${queryParams.toString()}`, {
      method: 'GET',
      headers
    });

    return this.handleResponse<{ issues: Array<{
      id: number;
      number?: number;
      iid?: number;
      title: string;
      body?: string;
      description?: string;
      state: string;
      created_at: string;
      updated_at: string;
    }> }>(response);
  }

  async fixBug(request: {
    platform: string;
    owner?: string;
    repo?: string;
    projectId?: string;
    issueNumber?: number;
    issueIid?: number;
  }): Promise<{
    success: boolean;
    branch: string;
    filesCreated: number;
    tokensUsed: number;
    prUrl?: string;
    prNumber?: number;
    message: string;
  }> {
    return this.post('bug-fix/fix', request);
  }

  // AI Actions
  async executeMCPQuery(request: {
    query: string;
    platform?: string;
    repositoryOwner?: string;
    repositoryName?: string;
    gitlabProjectId?: string;
    jiraProjectKey?: string;
  }): Promise<ExecuteMCPQueryResponse> {
    return this.post<ExecuteMCPQueryResponse>('ai-actions/execute', request);
  }

  async executeMCPQueryStream(
    request: {
      query: string;
      platform?: string;
      repositoryOwner?: string;
      repositoryName?: string;
      gitlabProjectId?: string;
      jiraProjectKey?: string;
    },
    onProgress: (event: ProgressEvent) => void
  ): Promise<ExecuteMCPQueryResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/ai-actions/execute-stream`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      await ErrorHandler.handleFetchError(response);
    }

    if (!response.body) {
      throw ErrorHandler.createApiError('No response body', 500, 'STREAM_ERROR');
    }

    return this.handleStreamResponse(response, onProgress);
  }

  async getBranches(params: {
    platform: string;
    repositoryOwner: string;
    repositoryName: string;
  }): Promise<{ branches: string[] }> {
    const queryParams = new URLSearchParams(params as any).toString();
    return this.get<{ branches: string[] }>(`ai-actions/branches?${queryParams}`);
  }

  // Background Tasks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getBackgroundTasks(): Promise<any[]> {
    return this.get<any[]>('background-tasks');
  }

  async getBackgroundTaskLogs(id: string): Promise<{ logs: string }> {
    return this.get<{ logs: string }>(`background-tasks/${id}/logs`);
  }

  async stopBackgroundTask(id: string): Promise<{ message: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/background-tasks/${id}`, {
      method: 'DELETE',
      headers
    });
    return this.handleResponse<{ message: string }>(response);
  }

  // Generic methods
  async get<T>(path: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'GET',
      headers
    });

    return this.handleResponse<T>(response);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<T>(path: string, body: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    return this.handleResponse<T>(response);
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();