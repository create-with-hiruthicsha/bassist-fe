// API Types matching the backend interfaces

export type PlanningPlatform = "jira" | "azure" | "github" | "gitlab" | "bitbucket";

export type GenOptionsFormat = "markdown" | "docx";

export interface IAttachment {
  filename: string;
  content: string;
  mimeType: string;
}

export interface ISimpleLLMResponse {
  status: string;
  response: string;
}

// Task Generation Types
export interface ITaskGenOptions {
  planningPlatform: PlanningPlatform;
  attachments?: IAttachment[];
}

export interface TaskGenerationRequest {
  planningPlatform: PlanningPlatform;
  textInput?: string;
  idea?: File; // DOCX file
  repositoryOwner?: string;
  repositoryName?: string;
}

export interface TaskGenerationResponse {
  status: string;
  output?: string;
  response?: string;
}

// Task Breakdown Types (from backend schema)
export interface TaskBreakdownTask {
  title: string;
  estimate: string; // e.g., "2h", "1d"
  description?: string; // Optional description for editing
}

export interface TaskBreakdownEpic {
  name: string;
  tasks: TaskBreakdownTask[];
}

export interface TaskBreakdownSummary {
  total_estimated_hours: number;
  number_of_epics: number;
  number_of_tasks: number;
  assumptions: string[];
}

export interface TaskBreakdown {
  epics: TaskBreakdownEpic[];
  summary: TaskBreakdownSummary;
}

// Create Tasks Types
export interface CreateTasksRequest {
  planningPlatform: PlanningPlatform;
  textInput?: string;
  tasks?: File;
  autoAssignResources?: boolean;
  repositoryName?: string;
  repositoryOwner?: string;
  jiraProjectKey?: string;
}

export interface CreateTasksResponse {
  status: string;
  output?: string;
  result?: string;
}

// Progress Event Types for SSE
export interface ProgressEvent {
  type: 'progress' | 'task_created' | 'epic_generated' | 'epic_count' | 'error' | 'complete' | 'chunk';
  message: string;
  taskIndex?: number;
  totalTasks?: number;
  taskName?: string;
  epicIndex?: number;
  totalEpics?: number;
  epicName?: string;
  allEpics?: string[];
  error?: string;
  iteration?: number;
  totalIterations?: number;
}

export interface TaskProgress {
  taskIndex: number;
  totalTasks: number;
  taskName: string;
  status: 'pending' | 'creating' | 'completed' | 'error';
  message?: string;
}

export interface EpicProgress {
  epicIndex: number;
  totalEpics: number;
  epicName: string;
  allEpics?: string[];
  status: 'pending' | 'generating' | 'completed' | 'error';
  message?: string;
}

// Document Generation Types
export interface IGenOptions {
  flowcharts: boolean;
  format: GenOptionsFormat;
  attachments?: IAttachment[];
}

export interface DocumentGenerationRequest {
  inputText?: string;
  flowcharts?: boolean;
  format?: GenOptionsFormat;
  attachments?: File[]; // DOCX files and images
  repositoryOwner?: string;
  repositoryName?: string;
}

export interface DocumentGenerationResponse {
  status: string;
  output: string | ArrayBuffer;
}

// API Error Response Type
export interface IApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

// Constants matching backend
export const PLATFORMS: PlanningPlatform[] = ["jira", "azure", "github", "gitlab", "bitbucket"];

export const PLATFORM_WITH_CODE_REPOSITORY: PlanningPlatform[] = ["github", "gitlab", "bitbucket", "azure"];

export const MAX_UPLOAD_SIZE_MB = 10;

// Platform configuration
export interface PlatformConfig {
  id: PlanningPlatform;
  name: string;
  needsRepo: boolean;
  description?: string;
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  { id: "jira", name: "Jira", needsRepo: false, description: "Atlassian Jira" },
  { id: "github", name: "GitHub", needsRepo: true, description: "GitHub Issues" },
  { id: "gitlab", name: "GitLab", needsRepo: true, description: "GitLab Issues" },
  { id: "azure", name: "Azure DevOps", needsRepo: true, description: "Azure DevOps Work Items" },
  { id: "bitbucket", name: "Bitbucket", needsRepo: true, description: "Bitbucket Issues" },
];
