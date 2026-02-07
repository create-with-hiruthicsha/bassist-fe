import { useEffect, useState } from 'react';
import { FileText, Download, Sparkles, AlertCircle } from 'lucide-react';
import PageHeader, { PageTitle, pageMainClasses } from '../../components/PageHeader';
import ReactMarkdown from 'react-markdown';
import { useDocumentGenerationWithProgress } from '../../hooks/useApi';
import { GenOptionsFormat } from '../../lib';
import MermaidDiagram from '../../components/MermaidDiagram';
import FileUpload from '../../components/FileUpload';
import DocxRenderer from '../../components/DocxRenderer';
import GitHubRepositorySelector from '../../components/GitHubRepositorySelector';
import { useRepository } from '../../context/RepositoryContext';
import { logger } from '../../lib/utils/logger';
import { styles } from './styles';

export default function DocumentGenerator() {
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
  const [includeFlowcharts, setIncludeFlowcharts] = useState(true);
  const [format, setFormat] = useState<GenOptionsFormat>('markdown');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [contentToShow, setContentToShow] = useState<string | ArrayBuffer>(generatedDoc?.output || streamingContent);
  const { repositoryOwner, setRepositoryOwner, repositoryName, setRepositoryName } = useRepository();

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
    <div className={styles.container}>
      <PageHeader backTo="/" />

      <main className={pageMainClasses}>
        <PageTitle
          title="Document Generator"
          subtitle="Generate comprehensive documentation from your project details"
        />
        <div className={styles.contentSpace}>
          {/* Repository Selection (Optional) */}
          <div className={styles.card}>
            <h3 className={styles.section.title}>
              Repository Context (Optional)
            </h3>
            <p className={styles.section.description}>
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
          <div className={styles.card}>
            <div className={styles.section.grid}>
              {/* Left Column - Text Input */}
              <div>
                <label
                  htmlFor="doc-input"
                  className={styles.section.label}
                >
                  Project Details
                </label>
                <textarea
                  id="doc-input"
                  className={styles.textarea}
                  placeholder="Describe your project architecture, features, APIs, database schema..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              {/* Right Column - File Upload */}
              <div>
                <label className={styles.section.label}>
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
                  uploadAreaClassName={styles.fileUpload.area}
                />
              </div>
            </div>

            <div className={styles.section.divider}>
              {/* <div className={styles.options.container}>
                <label className={styles.options.label}>
                  <input
                    type="checkbox"
                    checked={includeFlowcharts}
                    onChange={(e) => setIncludeFlowcharts(e.target.checked)}
                    className={styles.options.checkbox}
                  />
                  <span className={styles.options.text}>
                    Include flowcharts and diagrams
                  </span>
                </label>
              </div> */}

              <div className={styles.formatSelect.container}>
                <label className={styles.formatSelect.label}>
                  Output Format
                </label>
                <div className={styles.formatSelect.group}>
                  <button
                    onClick={() => setFormat('markdown')}
                    className={format === 'markdown' ? styles.formatSelect.button.active : styles.formatSelect.button.inactive}
                  >
                    Markdown
                  </button>
                  <button
                    onClick={() => setFormat('docx')}
                    className={format === 'docx' ? styles.formatSelect.button.active : styles.formatSelect.button.inactive}
                  >
                    DOCX
                  </button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className={styles.error.container}>
                  <AlertCircle className={styles.error.icon} />
                  <span className={styles.error.text}>{error}</span>
                </div>
              )}

              {/* Generate Button - Full Width */}
              <button
                onClick={handleGenerate}
                disabled={(!inputText && attachments.length === 0) || isGenerating}
                className={styles.generateButton}
              >
                <Sparkles className={styles.buttonIcon} />
                {isGenerating ? 'Generating...' : 'Generate Documentation'}
              </button>
            </div>
          </div>

          {/* Output Section */}
          {(generatedDoc?.output || streamingContent || isGenerating) ? (
            <div className={styles.preview.container}>
              <div className={styles.preview.header}>
                <div className={styles.preview.titleWrapper}>
                  <FileText className={styles.preview.titleIcon} />
                  <h3 className={styles.preview.title}>
                    Generated Document
                  </h3>
                </div>
                <div className={styles.preview.actions}>
                  <span className={styles.preview.formatBadge}>{format}</span>
                  {completed && generatedDoc?.output && (
                    <button
                      onClick={handleDownload}
                      className={styles.preview.downloadButton}
                    >
                      <Download className={styles.preview.downloadIcon} />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              {isGenerating && progress && (
                <div className={styles.preview.progress.container}>
                  <div className={styles.preview.progress.content}>
                    <div className={styles.preview.progress.spinner}></div>
                    <span className={styles.preview.progress.text}>{progress}</span>
                  </div>
                </div>
              )}

              {/* Document Content */}
              <div className={styles.preview.content.wrapper}>
                {(() => {
                  if (!contentToShow) return null;

                  if (format === 'docx') {
                    // For DOCX, show a document preview using a DOCX renderer
                    return (
                      <div className={styles.preview.content.docxWrapper}>
                        {contentToShow && typeof contentToShow !== 'string' ? (
                          <DocxRenderer docxBuffer={contentToShow as ArrayBuffer} />
                        ) : (
                          <div className={styles.preview.content.noContent}>
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
                      <div className={styles.preview.content.splitLayout}>
                        {/* Markdown Editor */}
                        <div className={styles.preview.content.columnLeft}>
                          <div className={styles.preview.content.headerBar}>
                            <h4 className={styles.preview.content.headerTitle}>Markdown Source</h4>
                          </div>
                          <textarea
                            className={styles.preview.content.editor}
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
                          <div className={styles.preview.content.headerBar}>
                            <h4 className={styles.preview.content.headerTitle}>Preview</h4>
                          </div>
                          <div className={styles.preview.content.markdownPreview}>
                            <ReactMarkdown components={{ code: CodeBlock }}>{typeof contentToShow === 'string' ? contentToShow : ''}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <pre className={styles.preview.content.rawPre}>
                        {typeof contentToShow === 'string' ? contentToShow : ''}
                      </pre>
                    );
                  }
                })()}
              </div>
            </div>
          ) : (
            <div className={styles.preview.empty.container}>
              <div className={styles.preview.empty.content}>
                <FileText className={styles.preview.empty.icon} />
                <h3 className={styles.preview.empty.title}>
                  Ready to Generate Documentation
                </h3>
                <p className={styles.preview.empty.text}>
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
