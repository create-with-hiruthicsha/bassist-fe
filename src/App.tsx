import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DebugProvider } from './context/DebugContext';
import { RepositoryProvider } from './context/RepositoryContext';
import AppRouter from './AppRouter.tsx';
import { Toaster } from 'react-hot-toast';
import { GlobalLoaderProvider } from './context/GlobalLoaderContext';

export const App = () => (
  <ThemeProvider>
    <GlobalLoaderProvider>
      <AuthProvider>
        <DebugProvider>
          <RepositoryProvider>
            <AppRouter />
          </RepositoryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </DebugProvider>
      </AuthProvider>
    </GlobalLoaderProvider>
  </ThemeProvider>
);

export default App;
