// Supabase service without logging

import { createClient, SupabaseClient, Session, User, Provider } from '@supabase/supabase-js';
import { ErrorHandler } from '../utils/error-handler';
import { Project, Task, Document } from '../interfaces';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

class SupabaseService {
  constructor() {
    // Service initialized
  }

  // Authentication methods
  async signInWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google' as Provider,
        options: {
          redirectTo: `${window.location.origin}/oauth-result`
        }
      });

      if (error) {
        throw ErrorHandler.handleAuthError(error.message);
      }
    } catch {
      throw ErrorHandler.handleAuthError('Failed to initiate Google OAuth sign-in');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw ErrorHandler.handleAuthError(error.message);
      }
    } catch {
      throw ErrorHandler.handleAuthError('Failed to sign out user');
    }
  }

  async getSession(): Promise<{ session: Session | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw ErrorHandler.handleAuthError(error.message);
      }

      return { session: data.session };
    } catch {
      throw ErrorHandler.handleAuthError('Failed to get session');
    }
  }

  async getUser(): Promise<{ user: User | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        throw ErrorHandler.handleAuthError(error.message);
      }

      return { user: data.user };
    } catch {
      throw ErrorHandler.handleAuthError('Failed to get user');
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  // Project management
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data;
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to create project'));
    }
  }

  async getProjects(userId: string): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data || [];
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to fetch projects'));
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data;
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to update project'));
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to delete project'));
    }
  }

  // Task management
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data;
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to create task'));
    }
  }

  async getTasks(projectId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data || [];
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to fetch tasks'));
    }
  }

  // Document management
  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([document])
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data;
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to create document'));
    }
  }

  async getDocuments(projectId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error as Error);
      }

      return data || [];
    } catch {
      throw ErrorHandler.handleDatabaseError(new Error('Failed to fetch documents'));
    }
  }
}

// Create and export singleton instance
export const supabaseService = new SupabaseService();