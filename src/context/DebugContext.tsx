import React, { createContext, useContext, useState, ReactNode } from 'react';
import DebugDialog from '../components/DebugDialog';
import useDebugShortcut from '../hooks/useDebugShortcut';

interface DebugContextType {
  isDebugDialogOpen: boolean;
  openDebugDialog: () => void;
  closeDebugDialog: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

interface DebugProviderProps {
  children: ReactNode;
}

export const DebugProvider: React.FC<DebugProviderProps> = ({ children }) => {
  const [isDebugDialogOpen, setIsDebugDialogOpen] = useState(false);

  const openDebugDialog = () => {
    setIsDebugDialogOpen(true);
  };

  const closeDebugDialog = () => {
    setIsDebugDialogOpen(false);
  };

  // Only enable debug shortcut in non-production environments
  const isProduction = import.meta.env.MODE === 'production';
  
  useDebugShortcut({
    onTrigger: openDebugDialog,
    enabled: !isProduction,
  });

  return (
    <DebugContext.Provider
      value={{
        isDebugDialogOpen,
        openDebugDialog,
        closeDebugDialog,
      }}
    >
      {children}
      {!isProduction && (
        <DebugDialog
          isOpen={isDebugDialogOpen}
          onClose={closeDebugDialog}
        />
      )}
    </DebugContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDebug = (): DebugContextType => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};
