# Bassist Client UI - Backend Integration

This document describes the integration between the Bassist client UI and the backend API.

## Overview

The client UI has been fully integrated with the Bassist backend API, providing real-time task generation, task creation, and document generation capabilities.

## API Integration

### Base Configuration
- **API Base URL**: `http://localhost:3000/api/v1` (configurable via `VITE_API_BASE_URL`)
- **Authentication**: Currently no authentication required
- **File Upload**: Supports DOCX files and images up to 10MB

### Endpoints Integrated

#### 1. Task Generation (`/api/v1/tasks/generate-tasks`)
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `planningPlatform`: Planning platform (jira, github, gitlab, azure, bitbucket)
  - `textInput`: Optional text input for project description
  - `idea`: Optional DOCX file upload
- **Response**: Task breakdown with epics, tasks, and summary

#### 2. Create Tasks (`/api/v1/tasks/create-tasks`)
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `planningPlatform`: Target platform
  - `textInput`: Optional task details
  - `tasks`: Optional DOCX file with tasks
  - `autoAssignResources`: Boolean flag
  - `repositoryName`: Required for GitHub/GitLab/Bitbucket
  - `repositoryOwner`: Required for GitHub/GitLab/Bitbucket
- **Response**: Task creation status

#### 3. Document Generation (`/api/v1/document/generate-doc`)
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**:
  - `inputText`: Project description
  - `flowcharts`: Boolean flag for including diagrams
  - `format`: Output format (markdown, html, pdf)
  - `attachments`: Multiple file uploads (DOCX, images)
- **Response**: Generated documentation

## Type Definitions

All API types are defined in `src/types/api.ts` and match the backend schemas:

- `TaskBreakdown`: Complete task breakdown structure
- `PlanningPlatform`: Supported platforms
- `GenOptionsFormat`: Document output formats
- `IAttachment`: File attachment structure
- `ApiError`: Error response structure

## API Client

The `ApiClient` class in `src/lib/api.ts` provides:
- Form data handling for file uploads
- Error handling and response parsing
- File validation (size, type)
- Task breakdown parsing from API responses

## React Hooks

Custom hooks in `src/hooks/useApi.ts` provide:
- `useTaskGeneration()`: Task generation with loading/error states
- `useCreateTasks()`: Task creation functionality
- `useDocumentGeneration()`: Document generation
- `useTaskBreakdownParser()`: Parse API responses
- `useFileValidation()`: File validation utilities

## Components Updated

### TaskGenerator
- Real API integration for task generation
- File upload with validation
- Text input support
- Platform selection
- Task breakdown display with epics and summary

### CreateTasks
- Real API integration for task creation
- Repository configuration for code platforms
- File upload for custom tasks
- Auto-assign resources option
- Task summary display

### DocumentGenerator
- Real API integration for document generation
- Multiple file attachment support
- Format selection (markdown, HTML, PDF)
- Flowchart inclusion option
- Live preview and download

## Error Handling

- Comprehensive error handling for all API calls
- File validation with user-friendly error messages
- Network error handling
- Loading states for all operations
- Form validation before submission

## File Upload Features

- Drag-and-drop file upload
- File type validation (DOCX, images)
- File size validation (10MB limit)
- Multiple file support for document generation
- File removal functionality
- Progress indicators

## Development Setup

1. Ensure the Bassist backend is running on `http://localhost:3000`
2. Set environment variables (optional):
   ```bash
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

The integration includes:
- Form validation
- File upload testing
- API error handling
- Loading state management
- Response parsing

All components are fully functional and ready for production use.
