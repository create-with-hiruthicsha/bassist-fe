// Centralized logging utility for the application
import toast from 'react-hot-toast';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Toast {
  private currentLevel: LogLevel = LogLevel.INFO;
  private showToasts: boolean = true;

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  setShowToasts(show: boolean): void {
    this.showToasts = show;
  }

  constructor(private context?: string) { }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private sanitizeMessage(message: string): string {
    // Handle specific error types with generic messages
    if (message.includes('Mermaid') || message.includes('Syntax error')) {
      return 'Diagram error';
    }
    if (message.includes('API Error') || message.includes('Network Error') || message.includes('Failed to fetch')) {
      return 'Something went wrong on our side';
    }

    // Truncate/Genericize long messages which likely contain details/stack traces
    if (message.length > 60) {
      return 'An error occurred';
    }

    return message;
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return;

    // Always log to console with full details/arguments
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(message, ...args);
        break;
      case LogLevel.INFO:
        console.info(message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(message, ...args);
        break;
    }

    // Only show toast notifications for user-facing messages
    if (this.showToasts) {
      // For errors and warnings, we aggressively sanitize to avoid showing sensitive info
      const isErrorOrWarn = level === LogLevel.ERROR || level === LogLevel.WARN;
      const displayMessage = isErrorOrWarn ? this.sanitizeMessage(message) : message;

      switch (level) {
        case LogLevel.INFO:
          toast.success(displayMessage);
          break;
        case LogLevel.WARN:
          toast(displayMessage, {
            icon: '⚠️',
            style: {
              background: '#f59e0b',
              color: '#fff',
            },
          });
          break;
        case LogLevel.ERROR:
          toast.error(displayMessage);
          break;
        case LogLevel.DEBUG:
          // Debug messages don't show toasts by default
          break;
      }
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string): void {
    this.debug(`API Request: ${method} ${url}`);
  }

  apiResponse(method: string, url: string, status: number): void {
    if (status >= 400) {
      // Log the full details to console, but toast will be sanitized
      this.error(`API Error: ${method} ${url} - ${status}`);
    } else {
      this.debug(`API Response: ${method} ${url} - ${status}`);
    }
  }

  apiError(method: string, url: string, error: Error): void {
    // Pass the error object as the second argument so it goes to console
    this.error(`API Error: ${method} ${url} - ${error.message}`, error);
  }
}

// Default logger
export const logger = new Toast();

// Utility function to create context-specific loggers
export const createLogger = (context: string): Toast => new Toast(context);
