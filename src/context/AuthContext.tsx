import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/services/supabase-service';
import { integrationService } from '../lib/services/integrations-service';
import { organizationService } from '../lib/services/organization-service';
import { OrganizationWithRole } from '../lib/interfaces/IOrganization';
import { logger } from '../lib/utils/logger';
import { useGlobalLoader } from './GlobalLoaderContext';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  currentOrganization: OrganizationWithRole | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  createOrganization: (name: string) => Promise<void>;
  joinOrganization: (code: string) => Promise<void>;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentOrganization, setCurrentOrganization] =
    useState<OrganizationWithRole | null>(null);
  const orgIdRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showLoader, hideLoader } = useGlobalLoader();

  // Unified initialization and organization loading
  const loadUserAndOrg = useCallback(async (newUser: User | null) => {
    if (!newUser) {
      setCurrentOrganization(null);
      orgIdRef.current = null;
      setLoading(false);
      hideLoader();
      return;
    }

    const orgId = newUser.user_metadata?.organizationId;
    if (!orgId) {
      setCurrentOrganization(null);
      orgIdRef.current = null;
      setLoading(false);
      hideLoader();
      return;
    }

    // Only fetch if it's a new org or we don't have one
    if (orgIdRef.current === orgId && currentOrganization) {
      setLoading(false);
      hideLoader();
      return;
    }

    try {
      setLoading(true);
      showLoader('Loading your workspace...');
      const org = await organizationService.getOrganization(orgId);
      setCurrentOrganization(org);
      orgIdRef.current = orgId;
      // Fire and forget integration fetch
      integrationService.fetchUserIntegrations().catch(() => { });
    } catch (error) {
      logger.error(`Failed to load organization in AuthContext: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentOrganization(null);
      orgIdRef.current = null;
    } finally {
      setLoading(false);
      hideLoader();
    }
  }, [showLoader, hideLoader, currentOrganization]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;

        const initialSession = data.session;
        const initialUser = initialSession?.user ?? null;

        setSession(initialSession);
        setUser(initialUser);

        // Load organization if user exists
        if (initialUser) {
          await loadUserAndOrg(initialUser);
        } else {
          setLoading(false);
        }
      } catch (error) {
        logger.error(`Failed to initialize auth: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUser = session?.user ?? null;

        setUser(newUser);
        setSession(session);

        // If user updated or signed in, ensure org is loaded
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newUser) {
            loadUserAndOrg(newUser);
          }
        }

        if (event === 'SIGNED_OUT') {
          setCurrentOrganization(null);
          orgIdRef.current = null;
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserAndOrg]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setCurrentOrganization(null);
    orgIdRef.current = null;
  };

  const createOrganization = async (name: string) => {
    try {
      showLoader('Creating your organization...');
      await organizationService.createOrganization(name);
      const { data } = await supabase.auth.refreshSession();
      if (data.user) {
        setUser(data.user);
        await loadUserAndOrg(data.user);
      }
    } finally {
      hideLoader();
    }
  };

  const joinOrganization = async (code: string) => {
    try {
      showLoader('Joining organization...');
      await organizationService.joinOrganization(code);
      const { data } = await supabase.auth.refreshSession();
      if (data.user) {
        setUser(data.user);
        await loadUserAndOrg(data.user);
      }
    } finally {
      hideLoader();
    }
  };

  const switchOrganization = async (orgId: string) => {
    try {
      showLoader('Switching workspace...');
      await supabase.auth.updateUser({
        data: { organizationId: orgId },
      });
    } finally {
      hideLoader();
    }
  };

  const refreshOrganization = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
      await loadUserAndOrg(data.user);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    currentOrganization,
    signInWithGoogle,
    signOut,
    createOrganization,
    joinOrganization,
    switchOrganization,
    refreshOrganization,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
