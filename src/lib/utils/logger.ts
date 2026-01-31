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

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private log(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) return;

    // Only show toast notifications for user-facing messages
    if (this.showToasts) {
      switch (level) {
        case LogLevel.INFO:
          toast.success(message);
          break;
        case LogLevel.WARN:
          toast(message, {
            icon: '⚠️',
            style: {
              background: '#f59e0b',
              color: '#fff',
            },
          });
          break;
        case LogLevel.ERROR:
          toast.error(message);
          break;
        case LogLevel.DEBUG:
          // Debug messages don't show toasts by default
          break;
      }
    }
  }

  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  warn(message: string): void {
    this.log(LogLevel.WARN, message);
  }

  error(message: string): void {
    this.log(LogLevel.ERROR, message);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string): void {
    this.debug(`API Request: ${method} ${url}`);
  }

  apiResponse(method: string, url: string, status: number): void {
    if (status >= 400) {
      this.error(`API Error: ${method} ${url} - ${status}`);
    } else {
      this.debug(`API Response: ${method} ${url} - ${status}`);
    }
  }

  apiError(method: string, url: string, error: Error): void {
    this.error(`API Error: ${method} ${url} - ${error.message}`);
  }
}

// Default logger
export const logger = new Toast();

// Utility function to create context-specific loggers
export const createLogger = (context: string): Toast => new Toast(context);
