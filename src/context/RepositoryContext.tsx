import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RepositoryContextType {
  repositoryOwner: string;
  repositoryName: string;
  setRepositoryOwner: (owner: string) => void;
  setRepositoryName: (name: string) => void;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [repositoryOwner, setRepositoryOwnerState] = useState('');
  const [repositoryName, setRepositoryNameState] = useState('');

  // Key for localStorage, distinct per user. 
  // If user is null, we don't persist or read, assuming session boundaries.
  const storageKey = user ? `repo_selection_${user.id}` : null;

  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const { owner, name } = JSON.parse(stored);
          setRepositoryOwnerState(owner || '');
          setRepositoryNameState(name || '');
        } catch (e) {
          console.error("Failed to parse repository selection from local storage", e);
        }
      } else {
        // No stored value for this user, reset or keep default
        // If switching users, we probably want to reset if nothing stored
        // But if just refreshing, we want to keep.
        // Actually, if nothing stored, valid state is empty.
      }
    } else {
        // User logged out
        setRepositoryOwnerState('');
        setRepositoryNameState('');
    }
  }, [storageKey]);

  const setRepositoryOwner = (owner: string) => {
    setRepositoryOwnerState(owner);
    if (storageKey) {
       saveToStorage(storageKey, owner, repositoryName);
    }
  };

  const setRepositoryName = (name: string) => {
    setRepositoryNameState(name);
    if (storageKey) {
       saveToStorage(storageKey, repositoryOwner, name);
    }
  };

  const saveToStorage = (key: string, owner: string, name: string) => {
      localStorage.setItem(key, JSON.stringify({ owner, name }));
  };

  return (
    <RepositoryContext.Provider value={{ repositoryOwner, repositoryName, setRepositoryOwner, setRepositoryName }}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepository must be used within a RepositoryProvider');
  }
  return context;
}
