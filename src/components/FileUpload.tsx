import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, Image } from 'lucide-react';
import { ValidationUtils, ValidationResult, FileValidationOptions } from '../lib/utils/validation';

export interface FileUploadProps {
  // File handling
  files: File[];
  onFilesChange: (files: File[]) => void;
  
  // Configuration
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
  
  // UI customization
  className?: string;
  uploadAreaClassName?: string;
  fileListClassName?: string;
  placeholder?: string;
  description?: string;
  showFileList?: boolean;
  
  // Validation
  validateOnChange?: boolean;
  customValidator?: (file: File) => ValidationResult;
  
  // Error handling
  onError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  accept = ".docx,image/*",
  multiple = false,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  allowedExtensions = ['.docx'],
  className = "",
  uploadAreaClassName = "",
  fileListClassName = "",
  placeholder = "Click to upload or drag and drop",
  description = "DOCX and image files, max 10MB each",
  showFileList = true,
  validateOnChange = true,
  customValidator,
  onError
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): ValidationResult => {
    if (customValidator) {
      return customValidator(file);
    }

    const options: FileValidationOptions = {
      maxSize,
      allowedTypes,
      allowedExtensions
    };

    return ValidationUtils.validateFile(file, options);
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check max files limit
    if (!multiple && fileArray.length > 1) {
      newErrors.push('Only one file is allowed');
      return;
    }

    if (multiple && files.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    fileArray.forEach(file => {
      if (validateOnChange) {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          newErrors.push(`${file.name}: ${validation.error}`);
        }
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      if (onError) {
        onError(newErrors.join(', '));
      }
    } else {
      setErrors([]);
    }

    // Update files
    if (multiple) {
      onFilesChange([...files, ...validFiles]);
    } else {
      onFilesChange(validFiles);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileSelect(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    
    // Clear errors when removing files
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const clearAllFiles = () => {
    onFilesChange([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${uploadAreaClassName}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {files.length > 0 ? `${files.length} file(s) selected` : placeholder}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </label>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {showFileList && files.length > 0 && (
        <div className={`space-y-2 ${fileListClassName}`}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected Files ({files.length})
            </h4>
            {files.length > 0 && (
              <button
                onClick={clearAllFiles}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded border dark:border-gray-600"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(file)}
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate block">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm ml-2 flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
