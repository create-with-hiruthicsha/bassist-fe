import { useState, useCallback } from 'react';
import { apiClient } from '../lib';
import { processStreamingContent } from '../utils/contentProcessor';
import {
  TaskGenerationRequest,
  TaskGenerationResponse,
  CreateTasksRequest,
  CreateTasksResponse,
  DocumentGenerationRequest,
  DocumentGenerationResponse,
  TaskBreakdown,
  ProgressEvent,
  TaskProgress,
  EpicProgress,
} from '../lib';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

function useApi<T>(): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific hooks for each API endpoint
export function useTaskGeneration() {
  const api = useApi<TaskGenerationResponse>();

  const generateTasks = useCallback(async (request: TaskGenerationRequest) => {
    return api.execute(() => apiClient.generateTasks(request));
  }, [api.execute]);

  return {
    ...api,
    generateTasks,
  };
}

export function useTaskGenerationWithProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [epicIndex, setEpicIndex] = useState(0);
  const [epicProgress, setEpicProgress] = useState<EpicProgress[]>([]);
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<TaskGenerationResponse | null>(null);

  const generateTasksWithProgress = useCallback(async (request: TaskGenerationRequest) => {
    setLoading(true);
    setError(null);
    setProgress('');
    setEpicIndex(0);
    setEpicProgress([]);
    setCompleted(false);
    setResult(null);

    try {
      await apiClient.generateTasksWithProgress(
        request,
        (event: ProgressEvent) => {
          setProgress(event.message);
          
          // Handle epic_count event - initialize the progress array with total epics
          if (event.type === 'epic_count' && event.totalEpics) {
            setEpicIndex(event.epicIndex ?? 0);
            const initialProgress: EpicProgress[] = [];
            for (let i = 0; i < event.totalEpics; i++) {
              initialProgress.push({
                epicIndex: i + 1,
                totalEpics: event.totalEpics,
                allEpics: event.allEpics,
                epicName: event.allEpics && event.allEpics[i] ? event.allEpics[i] : `Epic ${i + 1}`,
                status: 'pending',
                message: '',
              });
            }
            setEpicProgress(initialProgress);
          }

          // Handle epic_generated event - update specific epic in the array
          if (event.type === 'epic_generated' && event.epicIndex && event.totalEpics && event.epicName) {
            setEpicIndex(event.epicIndex);
            setEpicProgress(prev => {
              const newProgress = [...prev];
              const epicArrayIndex = event.epicIndex! - 1; // Convert to 0-based index
              
              if (epicArrayIndex >= 0 && epicArrayIndex < newProgress.length) {
                newProgress[epicArrayIndex] = {
                  ...newProgress[epicArrayIndex],
                  epicName: event.epicName!,
                  status: 'completed',
                  message: event.message,
                };
              } else {
                // Fallback: if array wasn't initialized, add to it
                newProgress.push({
                  epicIndex: event.epicIndex!,
                  totalEpics: event.totalEpics!,
                  epicName: event.epicName!,
                  status: 'completed',
                  message: event.message,
                });
              }
              
              return newProgress;
            });
          }
        },
        (error: Error) => {
          setError(error.message);
          setLoading(false);
        },
        (result: TaskGenerationResponse) => {
          setResult(result);
          setCompleted(true);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setProgress('');
    setEpicProgress([]);
    setCompleted(false);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    progress,
    epicIndex,
    epicProgress,
    completed,
    result,
    generateTasksWithProgress,
    reset,
  };
}

export function useCreateTasks() {
  const api = useApi<CreateTasksResponse>();

  const createTasks = useCallback(async (request: CreateTasksRequest) => {
    return api.execute(() => apiClient.createTasks(request));
  }, [api.execute]);

  return {
    ...api,
    createTasks,
  };
}

export function useCreateTasksWithProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);
  const [completed, setCompleted] = useState(false);

  const createTasksWithProgress = useCallback(async (request: CreateTasksRequest) => {
    setLoading(true);
    setError(null);
    setProgress('');
    setTaskProgress([]);
    setCompleted(false);

    try {
      await apiClient.createTasksWithProgress(
        request,
        (event: ProgressEvent) => {
          setProgress(event.message);
          
          if (event.type === 'task_created' && event.taskIndex && event.totalTasks && event.taskName) {
            setTaskProgress(prev => {
              const newProgress = [...prev];
              const existingIndex = newProgress.findIndex(p => p.taskIndex === event.taskIndex);
              
              if (existingIndex >= 0) {
                newProgress[existingIndex] = {
                  ...newProgress[existingIndex],
                  status: 'completed',
                  message: event.message,
                };
              } else {
                newProgress.push({
                  taskIndex: event.taskIndex!,
                  totalTasks: event.totalTasks!,
                  taskName: event.taskName!,
                  status: 'completed',
                  message: event.message,
                });
              }
              
              return newProgress;
            });
          }
        },
        (error: Error) => {
          setError(error.message);
          setLoading(false);
        },
        () => {
          setCompleted(true);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setProgress('');
    setTaskProgress([]);
    setCompleted(false);
  }, []);

  return {
    loading,
    error,
    progress,
    taskProgress,
    completed,
    createTasksWithProgress,
    reset,
  };
}

export function useDocumentGeneration() {
  const api = useApi<DocumentGenerationResponse>();

  const generateDocument = useCallback(async (request: DocumentGenerationRequest) => {
    return api.execute(() => apiClient.generateDocument(request));
  }, [api.execute]);

  return {
    ...api,
    generateDocument,
  };
}

export function useDocumentGenerationWithProgress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [completed, setCompleted] = useState(false);
  const [result, setResult] = useState<DocumentGenerationResponse | null>(null);

  const generateDocumentWithProgress = useCallback(async (request: DocumentGenerationRequest) => {
    setLoading(true);
    setError(null);
    setProgress('');
    setStreamingContent('');
    setCompleted(false);
    setResult(null);

    let accumulatedContent = '';
    let isReceivingJson = false;
    let lastProcessedContent = '';

    try {
      await apiClient.generateDocumentWithProgress(
        request,
        (event: ProgressEvent) => {
          if (event.type === 'progress') {
            setProgress(event.message);
          } else if (event.type === 'chunk') {
            // Only process streaming content for non-DOCX formats
            if (request.format !== 'docx') {
              accumulatedContent += event.message;
              
              // Process the accumulated content
              const processed = processStreamingContent(accumulatedContent, isReceivingJson);
              
              // Update JSON detection state
              if (processed.isJson && !isReceivingJson) {
                isReceivingJson = true;
              }
              
              // Only update if content has changed to avoid unnecessary re-renders
              if (processed.shouldShow && processed.content !== lastProcessedContent) {
                setStreamingContent(processed.content);
                lastProcessedContent = processed.content;
              }
            }
          }
        },
        (error: Error) => {
          setError(error.message);
          setLoading(false);
        },
        (result: DocumentGenerationResponse) => {
          setResult(result);
          setCompleted(true);
          setLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setProgress('');
    setStreamingContent('');
    setCompleted(false);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    progress,
    streamingContent,
    completed,
    result,
    generateDocumentWithProgress,
    reset,
  };
}

// Hook for parsing task breakdown
export function useTaskBreakdownParser() {
  const parseTaskBreakdown = useCallback((response: string): TaskBreakdown => {
    return apiClient.parseTaskBreakdown(response);
  }, []);

  return { parseTaskBreakdown };
}

// Hook for file validation
export function useFileValidation() {
  const validateFile = useCallback((file: File) => {
    return apiClient.validateFile(file);
  }, []);

  return { validateFile };
}

// Bug Fixing hooks
export function useAssignedIssues() {
  const api = useApi<{ issues: Array<{
    id: number;
    number?: number;
    iid?: number;
    title: string;
    body?: string;
    description?: string;
    state: string;
    created_at: string;
    updated_at: string;
  }> }>();

  const getAssignedIssues = useCallback(async (params: {
    platform: string;
    owner?: string;
    repo?: string;
    projectId?: string;
  }) => {
    return api.execute(() => apiClient.getAssignedIssues(params));
  }, [api.execute]);

  return {
    ...api,
    getAssignedIssues,
  };
}

export function useFixBug() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    branch: string;
    filesCreated: number;
    tokensUsed: number;
    prUrl?: string;
    prNumber?: number;
    message: string;
  } | null>(null);

  const fixBug = useCallback(async (request: {
    platform: string;
    owner?: string;
    repo?: string;
    projectId?: string;
    issueNumber?: number;
    issueIid?: number;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.fixBug(request);
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    loading,
    error,
    result,
    fixBug,
    reset,
  };
}

// AI Actions hooks
export function useExecuteMCPQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string | null>(null);

  const executeMCPQuery = useCallback(async (request: {
    query: string;
    platform?: string;
    repositoryOwner?: string;
    repositoryName?: string;
    gitlabProjectId?: string;
    jiraProjectKey?: string;
    branch?: string;
  }) => {
    setLoading(true);
    setError(null);
    setProgressMessage(null);

    try {
      const response = await apiClient.executeMCPQuery(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setProgressMessage(null);
    }
  }, []);

  const executeMCPQueryStream = useCallback(async (
    request: {
      query: string;
      platform?: string;
      repositoryOwner?: string;
      repositoryName?: string;
      gitlabProjectId?: string;
      jiraProjectKey?: string;
      branch?: string;
    },
    onProgress?: (message: string) => void
  ) => {
    setLoading(true);
    setError(null);
    setProgressMessage(null);

    try {
      const response = await apiClient.executeMCPQueryStream(
        request,
        (event: ProgressEvent) => {
          if (event.type === 'progress') {
            const message = event.iteration !== undefined
              ? `Iteration ${event.iteration} of ${event.totalIterations}: ${event.message}`
              : event.message;
            setProgressMessage(message);
            if (onProgress) {
              onProgress(message);
            }
          } else if (event.type === 'error') {
            setError(event.message);
            setProgressMessage(null);
          }
        }
      );
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
      setProgressMessage(null);
    }
  }, []);

  return {
    loading,
    error,
    progressMessage,
    executeMCPQuery,
    executeMCPQueryStream,
  };
}

export function useGetBranches() {
  const api = useApi<{ branches: string[] }>();

  const getBranches = useCallback(async (params: {
    platform: string;
    repositoryOwner: string;
    repositoryName: string;
  }) => {
    return api.execute(() => apiClient.getBranches(params));
  }, [api.execute]);

  return {
    ...api,
    getBranches,
  };
}

export default useApi;
