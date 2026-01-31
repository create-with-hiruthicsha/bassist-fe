import { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import { AlertCircle } from 'lucide-react';

interface DocxRendererProps {
  docxBuffer: ArrayBuffer;
}

export default function DocxRenderer({ docxBuffer }: DocxRendererProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const convertDocxToHtml = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await mammoth.convertToHtml({ arrayBuffer: docxBuffer });
        setHtmlContent(result.value);
        
        // Log any warnings
        if (result.messages.length > 0) {
          console.warn('DOCX conversion warnings:', result.messages);
        }
      } catch (err) {
        console.error('Error converting DOCX to HTML:', err);
        setError(err instanceof Error ? err.message : 'Failed to render document');
      } finally {
        setLoading(false);
      }
    };

    if (docxBuffer) {
      convertDocxToHtml();
    }
  }, [docxBuffer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rendering document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error Rendering Document
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80% min-h-[600px] overflow-y-auto">
      <div 
        className="docx-content p-6 prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: '1.6',
          color: 'inherit'
        }}
      />
    </div>
  );
}
