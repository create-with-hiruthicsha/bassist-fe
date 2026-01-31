// Error handling utilities for the application

import { logger } from './logger';

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

export class ErrorHandler {
  // Create a standardized API error
  static createApiError(message: string, status?: number, code?: string, details?: unknown): ApiError {
    const error = new Error(message) as ApiError;
    error.status = status;
    error.code = code;
    error.details = details;
    return error;
  }

  // Handle fetch errors
  static async handleFetchError(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: unknown = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
      errorDetails = errorData;
    } catch {
      // If we can't parse the error response, use the default message
    }

    logger.error(`API Error: ${response.status}. ${errorMessage}`);

    throw this.createApiError(errorMessage, response.status, 'API_ERROR', errorDetails);
  }

  // Handle network errors
  static handleNetworkError(error: Error): ApiError {
    logger.error('Network Error. ' + error.message);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.createApiError(
        'Network error: Unable to connect to the server. Please check your internet connection.',
        0,
        'NETWORK_ERROR'
      );
    }

    return this.createApiError(
      `Network error: ${error.message}`,
      0,
      'NETWORK_ERROR',
      { originalError: error.message }
    );
  }

  // Handle parsing errors
  static handleParseError(error: Error, data: string): ApiError {
    logger.error('Parse Error. ' + error.message);
    
    return this.createApiError(
      'Failed to parse response from server',
      0,
      'PARSE_ERROR',
      { originalError: error.message, data }
    );
  }

  // Handle validation errors
  static handleValidationError(message: string, field?: string): ApiError {
    return this.createApiError(
      message,
      400,
      'VALIDATION_ERROR',
      { field }
    );
  }

  // Handle authentication errors
  static handleAuthError(message: string = 'Authentication required'): ApiError {
    logger.warn('Authentication Error. ' + message);
    
    return this.createApiError(
      message,
      401,
      'AUTH_ERROR'
    );
  }

  // Handle permission errors
  static handlePermissionError(message: string = 'Insufficient permissions'): ApiError {
    logger.warn('Permission Error. ' + message);
    
    return this.createApiError(
      message,
      403,
      'PERMISSION_ERROR'
    );
  }

  // Handle API errors from the backend
  static handleApiError(error: unknown): ApiError {
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = error as { error: string; message?: string; statusCode?: number };
      return this.createApiError(
        apiError.message || apiError.error,
        apiError.statusCode || 500,
        'API_ERROR'
      );
    }
    return this.handleError(error);
  }

  // Handle database errors (Supabase)
  static handleDatabaseError(error: { message?: string; code?: string }): ApiError {
    const message = error?.message || 'A database error occurred';
    const code = error?.code || 'DATABASE_ERROR';

    logger.error(`Database Error: ${code}. ${message}`);

    return this.createApiError(
      message,
      500,
      code
    );
  }

  // Generic error handler
  static handleError(error: unknown): ApiError {
    if (error instanceof Error) {
      logger.error('Unexpected Error. ' + error.message);
      return this.createApiError(
        error.message,
        500,
        'UNKNOWN_ERROR',
        { originalError: error.message, stack: error.stack }
      );
    }

    logger.error('Unknown Error.');
    return this.createApiError(
      'An unknown error occurred',
      500,
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  // Retry logic for failed requests
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          logger.error(`Operation failed after ${maxRetries} attempts. ${lastError.message}`);
          throw lastError;
        }

        logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms. ${lastError.message}`);

        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }

    throw lastError!;
  }
}
