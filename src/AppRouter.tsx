import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LandingPage from './screens/landing/LandingPage';
import TaskGenerator from './screens/task-generator/TaskGenerator';
import CreateTasks from './screens/create-tasks/CreateTasks';
import DirectCreateTasks from './screens/direct-create-tasks/DirectCreateTasks';
import DocumentGenerator from './screens/document-generator/DocumentGenerator';
import Integrations from './screens/integrations/Integrations';
import OAuthResult from './screens/oauth-result/OAuthResult';
import Preferences from './screens/preferences/Preferences';
import OnboardingPage from './screens/onboarding/OnboardingPage';
import BugFix from './screens/bug-fix/BugFix';
import AIActions from './screens/ai-actions/AIActions';
import Research from './screens/research/Research';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import React from 'react';

// Wrapper to handle organization-based redirects
function OrgRedirect({ children }: { children: React.ReactNode }) {
  const { user, currentOrganization, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user && !currentOrganization && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (user && currentOrganization && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Main App component with routing
function AppRouter() {
  return (
    <Router>
      <ProtectedRoute>
        <OrgRedirect>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/tasks" element={<TaskGenerator />} />
            <Route path="/documents" element={<DocumentGenerator />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/create-tasks" element={<CreateTasks />} />
            <Route path="/direct-create-tasks" element={<DirectCreateTasks />} />
            <Route path="/bug-fix" element={<BugFix />} />
            <Route path="/ai-actions" element={<AIActions />} />
            <Route path="/research" element={<Research />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/oauth-result" element={<OAuthResult />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </OrgRedirect>
      </ProtectedRoute>
    </Router>
  );
}

export default AppRouter;
