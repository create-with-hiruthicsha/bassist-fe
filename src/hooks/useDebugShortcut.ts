import { useEffect } from 'react';

interface UseDebugShortcutProps {
  onTrigger: () => void;
  enabled?: boolean;
}

const useDebugShortcut = ({ onTrigger, enabled = true }: UseDebugShortcutProps) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl+Shift+Alt+X
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.altKey &&
        event.key.toLowerCase() === 'x'
      ) {
        event.preventDefault();
        event.stopPropagation();
        onTrigger();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTrigger, enabled]);
};

export default useDebugShortcut;
