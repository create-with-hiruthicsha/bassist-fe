import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { logger } from '../lib/utils/logger';
import { useTheme } from '../context/ThemeContext';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const { actualTheme } = useTheme();

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        setError('');
        setSvg('');
        
        // Clear any previous error divs that Mermaid might have created
        if (containerRef.current) {
          const errorDivs = containerRef.current.querySelectorAll('[id^="dmermaid-"]');
          errorDivs.forEach(div => div.remove());
        }
        
        // Determine if dark mode is active
        const isDarkMode = actualTheme === 'dark';
        
        // Initialize mermaid with default config
        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? 'dark' : 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          darkMode: isDarkMode,
        });

        // Validate the chart syntax before rendering
        try {
          await mermaid.parse(chart);
        } catch (parseError) {
          const errorMessage = parseError instanceof Error 
            ? parseError.message 
            : 'Syntax error in Mermaid diagram';
          logger.error(`Mermaid parse error: ${errorMessage}`);
          setError(errorMessage);
          return;
        }

        // Generate a unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, chart);
        
        // Clean up any error divs that Mermaid might have created during rendering
        // Mermaid sometimes creates error divs even when render() succeeds
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = svg;
        const errorDivs = tempContainer.querySelectorAll('[id^="dmermaid-"]');
        errorDivs.forEach(div => div.remove());
        const cleanedSvg = tempContainer.innerHTML;
        
        setSvg(cleanedSvg);
        
        // Also clean up any error divs in the actual container
        if (containerRef.current) {
          const containerErrorDivs = containerRef.current.querySelectorAll('[id^="dmermaid-"]');
          containerErrorDivs.forEach(div => div.remove());
        }
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to render diagram';
        logger.error(`Mermaid rendering error: ${errorMessage}`);
        setError(errorMessage);
        
        // Clean up any error divs that Mermaid created
        if (containerRef.current) {
          const errorDivs = containerRef.current.querySelectorAll('[id^="dmermaid-"]');
          errorDivs.forEach(div => div.remove());
        }
      }
    };

    if (chart.trim()) {
      renderDiagram();
    } else {
      setSvg('');
      setError('');
    }
  }, [chart, actualTheme]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Diagram Error</span>
        </div>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <details className="mt-2">
          <summary className="text-xs text-red-500 cursor-pointer">Show Mermaid code</summary>
          <pre className="text-xs text-red-600 mt-1 bg-red-100 p-2 rounded overflow-x-auto">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Rendering diagram...</span>
      </div>
    );
  }

  // Clean up error divs that Mermaid creates after rendering
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up immediately
    const cleanup = () => {
      const errorDivs = containerRef.current?.querySelectorAll('[id^="dmermaid-"]');
      errorDivs?.forEach(div => {
        // Check if it's an error div (contains "Syntax error" text)
        if (div.textContent?.includes('Syntax error')) {
          div.remove();
        }
      });
    };

    // Clean up immediately and after a short delay
    cleanup();
    const timeoutId = setTimeout(cleanup, 100);

    // Use MutationObserver to watch for error divs being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if the added node is an error div or contains error divs
            if (element.id?.startsWith('dmermaid-') && element.textContent?.includes('Syntax error')) {
              element.remove();
            } else {
              // Check for error divs within the added node
              const errorDivs = element.querySelectorAll?.('[id^="dmermaid-"]');
              errorDivs?.forEach(div => {
                if (div.textContent?.includes('Syntax error')) {
                  div.remove();
                }
              });
            }
          }
        });
      });
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      cleanup();
    };
  }, [svg]);

  return (
    <div 
      ref={containerRef}
      className="my-4 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
