import { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AuthContainer from './AuthContainer';
import PageLoader from '../PageLoader';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <PageLoader message="Authenticating..." />;
  }

  // If not authenticated, show login screen
  if (!user) {
    return <AuthContainer />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
}