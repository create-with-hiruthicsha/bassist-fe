import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Download, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useDocumentGenerationWithProgress } from '../../hooks/useApi';
import { GenOptionsFormat } from '../../lib';
import MermaidDiagram from '../../components/MermaidDiagram';
import FileUpload from '../../components/FileUpload';
import DocxRenderer from '../../components/DocxRenderer';
import GitHubRepositorySelector from '../../components/GitHubRepositorySelector';
import { logger } from '../../lib/utils/logger';

export default function DocumentGenerator() {
  const navigate = useNavigate();
  const {
    generateDocumentWithProgress,
    loading: isGenerating,
    error,
    progress,
    streamingContent,
    completed,
    result: generatedDoc
  } = useDocumentGenerationWithProgress();
  const [inputText, setInputText] = useState('');
  const [includeFlowcharts, setIncludeFlowcharts] = useState(false);
  const [format, setFormat] = useState<GenOptionsFormat>('markdown');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [contentToShow, setContentToShow] = useState<string | ArrayBuffer>(generatedDoc?.output || streamingContent);
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');

  useEffect(() => {
    setContentToShow(generatedDoc?.output || streamingContent);
  }, [generatedDoc, streamingContent]);

  const handleGenerate = async () => {
    if (!inputText && attachments.length === 0) {
      return;
    }

    try {
      const request = {
        inputText: inputText || undefined,
        flowcharts: includeFlowcharts,
        format,
        attachments: attachments.length > 0 ? attachments : undefined,
        repositoryOwner: repositoryOwner || undefined,
        repositoryName: repositoryName || undefined,
      };

      await generateDocumentWithProgress(request);
    } catch {
      logger.error('Failed to generate document');
    }
  };

  const handleDownload = () => {
    if (!generatedDoc?.output) return;

    if (format === 'docx') {
      // For DOCX, the output should be a binary buffer (ArrayBuffer)
      const blob = new Blob([generatedDoc.output as ArrayBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documentation.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // For markdown and other formats
      const mimeType = format === 'markdown' ? 'text/markdown' : 'application/pdf';
      const extension = format === 'markdown' ? 'md' : 'pdf';

      const blob = new Blob([generatedDoc.output as string], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentation.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Custom renderer for code blocks to handle Mermaid diagrams
  const CodeBlock = ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';
    
    if (!inline && language === 'mermaid') {
      return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
    }
    
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Document Generator
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Generate comprehensive documentation from your project details
          </p>
        </div>

        <div className="space-y-8">
          {/* Repository Selection (Optional) */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Repository Context (Optional)
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Select a repository to include its issues and context in the documentation generation
            </p>
            <GitHubRepositorySelector
              repositoryOwner={repositoryOwner}
              repositoryName={repositoryName}
              onRepositoryOwnerChange={setRepositoryOwner}
              onRepositoryNameChange={setRepositoryName}
              disabled={isGenerating}
            />
          </div>

          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Column - Text Input */}
              <div>
                <label
                  htmlFor="doc-input"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3"
                >
                  Project Details
                </label>
                <textarea
                  id="doc-input"
                  className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 dark:focus:ring-blue-400 focus:border-transparent resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700"
                  placeholder="Describe your project architecture, features, APIs, database schema..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              {/* Right Column - File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Attachments (Optional)
                </label>
                <FileUpload
                  files={attachments}
                  onFilesChange={setAttachments}
                  accept=".docx,image/*"
                  multiple={true}
                  maxFiles={10}
                  placeholder="Click to upload DOCX files or images"
                  description="DOCX and image files, max 10MB each"
                  allowedTypes={['application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                  allowedExtensions={['.docx']}
                  uploadAreaClassName="h-64 flex flex-col justify-center"
                />
              </div>
            </div>

            {/* Bottom Section - Options and Generate Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              {/* Flowcharts Option */}
              <div className="mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFlowcharts}
                    onChange={(e) => setIncludeFlowcharts(e.target.checked)}
                    className="w-5 h-5 text-blue-700 border-gray-300 rounded focus:ring-blue-700"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    Include flowcharts and diagrams
                  </span>
                </label>
              </div>

              {/* Format Selection - Full Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Output Format
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormat('markdown')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      format === 'markdown'
                        ? 'bg-blue-700 text-white'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setFormat('docx')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      format === 'docx'
                        ? 'bg-blue-700 text-white'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    DOCX
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Generate Button - Full Width */}
              <button
                onClick={handleGenerate}
                disabled={(!inputText && attachments.length === 0) || isGenerating}
                className="w-full px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? 'Generating...' : 'Generate Documentation'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          {(generatedDoc?.output || streamingContent || isGenerating) ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Generated Document
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{format}</span>
                  {completed && generatedDoc?.output && (
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              {isGenerating && progress && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 dark:border-blue-400"></div>
                    <span className="text-sm text-blue-700 dark:text-blue-300">{progress}</span>
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {(() => {
                  if (!contentToShow) return null;

                  if (format === 'docx') {
                    // For DOCX, show a document preview using a DOCX renderer
                    return (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden min-h-[600px] bg-white dark:bg-gray-900">
                        {contentToShow && typeof contentToShow !== 'string' ? (
                          <DocxRenderer docxBuffer={contentToShow as ArrayBuffer} />
                        ) : (
                          <div className="flex items-center justify-center h-full min-h-[600px]">
                            <div className="text-center">
                              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No Document Content
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Generate a document to see the preview here
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else if (format === 'markdown') {
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                        {/* Markdown Editor */}
                        <div className="border-r border-gray-200 dark:border-gray-700">
                          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Markdown Source</h4>
                          </div>
                          <textarea
                            className="w-full h-[600px] p-4 font-mono text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 resize-none focus:outline-none"
                            value={typeof contentToShow === 'string' ? contentToShow : ''}
                            onChange={(event) => {
                              setContentToShow(event.target.value);
                            }}
                            readOnly={isGenerating}
                            placeholder="Markdown content will appear here..."
                          />
                        </div>

                        {/* Rendered Preview */}
                        <div>
                          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</h4>
                          </div>
                          <div className="p-6 markdown-content h-[600px] overflow-y-auto bg-white dark:bg-gray-900">
                            <ReactMarkdown components={{ code: CodeBlock }}>{typeof contentToShow === 'string' ? contentToShow : ''}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <pre className="p-6 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-mono min-h-[600px] overflow-y-auto bg-white dark:bg-gray-900">
                        {typeof contentToShow === 'string' ? contentToShow : ''}
                      </pre>
                    );
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Ready to Generate Documentation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fill in the project details above and click "Generate Documentation" to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
