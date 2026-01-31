// Validation utilities for the application

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export class ValidationUtils {
  // File validation
  static validateFile(file: File, options: FileValidationOptions = {}): ValidationResult {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      allowedExtensions = ['.docx']
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      // Also check for image files if no specific types are allowed
      if (!file.type.startsWith('image/')) {
        return {
          valid: false,
          error: 'Unsupported file type. Please upload DOCX files or images.'
        };
      }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          valid: false,
          error: `File extension ${fileExtension} is not allowed.`
        };
      }
    }

    return { valid: true };
  }

  // Email validation
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        error: 'Please enter a valid email address'
      };
    }
    return { valid: true };
  }

  // URL validation
  static validateUrl(url: string): ValidationResult {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: 'Please enter a valid URL'
      };
    }
  }

  // Required field validation
  static validateRequired(value: unknown, fieldName: string): ValidationResult {
    if (value === null || value === undefined || value === '') {
      return {
        valid: false,
        error: `${fieldName} is required`
      };
    }
    return { valid: true };
  }

  // String length validation
  static validateStringLength(value: string, min: number, max: number, fieldName: string): ValidationResult {
    if (value.length < min) {
      return {
        valid: false,
        error: `${fieldName} must be at least ${min} characters long`
      };
    }
    if (value.length > max) {
      return {
        valid: false,
        error: `${fieldName} must be no more than ${max} characters long`
      };
    }
    return { valid: true };
  }
}
