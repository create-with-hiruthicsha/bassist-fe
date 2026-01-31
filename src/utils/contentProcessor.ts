/**
 * Utility functions for processing streaming content
 */
import { logger } from '../lib/utils/logger';

/**
 * Checks if a string appears to be JSON structure
 */
export function isJsonStructure(content: string): boolean {
  try {
    const trimmed = content.trim();
    
    // Check if it starts with array or object bracket
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      // Try to parse as JSON, but handle potential formatting issues
      try {
        const parsed = JSON.parse(trimmed);
        // Check if it has the expected structure for document generation
        if (Array.isArray(parsed)) {
          return parsed.some(item => 
            item && 
            typeof item === 'object' && 
            (item.title || item.sections)
          );
        } else if (parsed && typeof parsed === 'object') {
          return parsed.title || parsed.sections;
        }
      } catch {
        // If direct parsing fails, check if it looks like our expected structure
        return trimmed.includes('"title"') && trimmed.includes('"sections"');
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Converts JSON structure to markdown format
 */
export function convertJsonToMarkdown(jsonOutput: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let documentData: any;

    // Parse JSON if it's a string
    if (typeof jsonOutput === 'string') {
      // Try to extract JSON from markdown code blocks first
      const jsonMatch = jsonOutput.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        try {
          documentData = JSON.parse(jsonMatch[1]);
        } catch {
          // If parsing fails, try to fix common JSON issues
          const fixedJson = jsonMatch[1]
            .replace(/\n/g, '\\n')  // Escape newlines
            .replace(/\r/g, '\\r')  // Escape carriage returns
            .replace(/\t/g, '\\t'); // Escape tabs
          documentData = JSON.parse(fixedJson);
        }
      } else {
        try {
          // Try to parse the entire string as JSON
          documentData = JSON.parse(jsonOutput);
        } catch {
          // If parsing fails, try to fix common JSON issues
          const fixedJson = jsonOutput
            .replace(/\n/g, '\\n')  // Escape newlines
            .replace(/\r/g, '\\r')  // Escape carriage returns
            .replace(/\t/g, '\\t'); // Escape tabs
          documentData = JSON.parse(fixedJson);
        }
      }
    } else {
      documentData = jsonOutput;
    }

    // Ensure it's an array
    if (!Array.isArray(documentData)) {
      documentData = [documentData];
    }

    let markdown = '';

    for (const doc of documentData) {
      if (doc.title) {
        markdown += `# ${doc.title}\n\n`;
      }

      if (doc.sections && Array.isArray(doc.sections)) {
        for (const section of doc.sections) {
          if (section.heading) {
            markdown += `## ${section.heading}\n\n`;
          }
          
          if (section.content) {
            // Process content to handle special formatting
            let content = section.content;
            
            // Handle mermaid diagrams - if content contains "mermaid" and looks like a diagram
            if (content.includes('mermaid') && content.includes('flowchart')) {
              // Check if it's already wrapped in code blocks
              const alreadyWrapped = content.includes('```mermaid');
              
              if (!alreadyWrapped) {
                // Extract mermaid content and wrap it properly
                const mermaidMatch = content.match(/mermaid\s*\n([\s\S]*?)(?=\n\n|\n$|$)/);
                if (mermaidMatch) {
                  const mermaidContent = mermaidMatch[1].trim();
                  content = content.replace(/mermaid\s*\n[\s\S]*?(?=\n\n|\n$|$)/, 
                    `\`\`\`mermaid\n${mermaidContent}\n\`\`\``);
                }
              }
            }
            
            // Handle bullet points that might be formatted as "* " but need proper markdown
            content = content.replace(/\*\s+/g, '- ');
            
            markdown += `${content}\n\n`;
          }
        }
      } else {
        // New structure with direct properties
        if (doc.overview) {
          markdown += `## Overview\n\n${doc.overview}\n\n`;
        }

        if (doc.goals && Array.isArray(doc.goals)) {
          markdown += `## Goals\n\n`;
          for (const goal of doc.goals) {
            markdown += `- ${goal}\n`;
          }
          markdown += '\n';
        }

        if (doc.architecture) {
          markdown += `## Architecture\n\n`;
          
          if (doc.architecture.components && Array.isArray(doc.architecture.components)) {
            markdown += `### Components\n\n`;
            for (const component of doc.architecture.components) {
              markdown += `#### ${component.name}\n\n${component.description}\n\n`;
              if (component.responsibilities && Array.isArray(component.responsibilities)) {
                markdown += `**Responsibilities:**\n`;
                for (const responsibility of component.responsibilities) {
                  markdown += `- ${responsibility}\n`;
                }
                markdown += '\n';
              }
            }
          }

          if (doc.architecture.technology_stack && Array.isArray(doc.architecture.technology_stack)) {
            markdown += `### Technology Stack\n\n`;
            for (const tech of doc.architecture.technology_stack) {
              markdown += `- ${tech}\n`;
            }
            markdown += '\n';
          }
        }

        if (doc.api) {
          markdown += `## API\n\n`;
          for (const [apiName, apiDetails] of Object.entries(doc.api)) {
            const details = apiDetails as { method: string; endpoint: string; request_body?: unknown; response_body?: unknown };
            markdown += `### ${apiName.replace(/_/g, ' ').toUpperCase()}\n\n`;
            markdown += `**Endpoint:** \`${details.method} ${details.endpoint}\`\n\n`;
            
            if (details.request_body) {
              markdown += `**Request Body:**\n\`\`\`json\n${JSON.stringify(details.request_body, null, 2)}\n\`\`\`\n\n`;
            }
            
            if (details.response_body) {
              markdown += `**Response Body:**\n\`\`\`json\n${JSON.stringify(details.response_body, null, 2)}\n\`\`\`\n\n`;
            }
          }
        }

        if (doc.workflow && doc.workflow.diagram) {
          markdown += `## Workflow\n\n${doc.workflow.diagram}\n\n`;
        }

        if (doc.implementation_notes && Array.isArray(doc.implementation_notes)) {
          markdown += `## Implementation Notes\n\n`;
          for (const note of doc.implementation_notes) {
            markdown += `- ${note}\n`;
          }
          markdown += '\n';
        }
      }
    }

    return markdown.trim();
  } catch {
    logger.warn('Failed to convert JSON to markdown, returning original output');
    // If conversion fails, return the original output
    return typeof jsonOutput === 'string' ? jsonOutput : JSON.stringify(jsonOutput);
  }
}

/**
 * Processes streaming content to handle JSON detection and conversion
 */
export function processStreamingContent(
  accumulatedContent: string,
  isReceivingJson: boolean
): { 
  content: string; 
  isJson: boolean; 
  shouldShow: boolean;
} {
  // Check if we're receiving JSON structure
  const isJson = isReceivingJson || accumulatedContent.trim().startsWith('[');
  
  if (isJson) {
    // Try to convert accumulated content to markdown
    try {
      if (isJsonStructure(accumulatedContent)) {
        const markdownContent = convertJsonToMarkdown(accumulatedContent);
        return {
          content: markdownContent,
          isJson: true,
          shouldShow: true
        };
      } else {
        // If JSON is incomplete, show a loading message instead of raw JSON
        return {
          content: "# Document Generation\n\n*Generating documentation...*",
          isJson: true,
          shouldShow: true
        };
      }
    } catch {
      // If conversion fails, show loading message
      return {
        content: "# Document Generation\n\n*Generating documentation...*",
        isJson: true,
        shouldShow: true
      };
    }
  }
  
  // For markdown content, show it directly
  return {
    content: accumulatedContent,
    isJson: false,
    shouldShow: true
  };
}
