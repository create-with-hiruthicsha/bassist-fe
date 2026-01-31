// Integration service without logging

import {
  IntegrationProvider,
  IntegrationConnection,
} from '../interfaces';
import { ErrorHandler } from '../utils/error-handler';
import { apiClient } from './api-client';
import {
  INTEGRATION_PROVIDERS,
  PROVIDER_IDS,
  OAUTH_URL_BUILDERS,
  API_TEST_ENDPOINTS,
  AUTH_HEADER_BUILDERS,
  CLIENT_ID_ENV_VARS,
  type ProviderId
} from '../constants';

class IntegrationService {
  private connections: Map<string, IntegrationConnection> = new Map();
  private API_BASE_URL_WITHOUT_VERSION = import.meta.env.VITE_API_BASE_URL;

  constructor() {
    this.loadConnections();
  }

  private loadConnections() {
    try {
      const stored = localStorage.getItem('integrations');
      
      if (stored) {
        const connections = JSON.parse(stored);
        this.connections = new Map(Object.entries(connections));
      }
    } catch {
      // Silent error handling
    }
  }

  // Get all available providers
  getProviders(): IntegrationProvider[] {
    return INTEGRATION_PROVIDERS.map(provider => ({
      ...provider,
      connected: this.isConnected(provider.id)
    }));
  }

  // Check if a provider is connected
  isConnected(provider: string): boolean {
    return this.connections.has(provider);
  }

  // Get connection for a provider
  getConnection(provider: string): IntegrationConnection | null {
    return this.connections.get(provider) || null;
  }

  // Get access token for a provider
  getAccessToken(provider: string): string | null {
    const connection = this.getConnection(provider);
    return connection?.accessToken || null;
  }

  // Save a connection
  saveConnection(provider: string, connection: IntegrationConnection) {
    this.connections.set(provider, connection);
    this.saveConnectionsToStorage();
  }

  // Remove a connection
  async removeConnection(provider: string) {
    // Call backend API to disconnect the integration
    await apiClient.disconnectIntegration(provider);
    
    // Remove from local storage
    this.connections.delete(provider);
    this.saveConnectionsToStorage();
  }

  // Start OAuth flow for a provider
  async startOAuthFlow(provider: string, organizationId?: string, usePopup = true): Promise<void> {
    const providerConfig = INTEGRATION_PROVIDERS.find(p => p.id === provider);
    
    if (!providerConfig) {
      throw ErrorHandler.handleValidationError(`Provider ${provider} not found`);
    }

    // Call backend to start OAuth session and get state
    const oauthSession = await apiClient.startOAuthForUser(provider, organizationId);

    // Get client ID from environment variables
    const clientIdEnvVar = CLIENT_ID_ENV_VARS[provider as ProviderId];
    const clientId = import.meta.env[clientIdEnvVar];
    
    if (!clientId) {
      throw ErrorHandler.handleValidationError(`Client ID not found for ${provider}`);
    }

    // Build redirect URI
    const redirectUri = `${this.API_BASE_URL_WITHOUT_VERSION}integrations/oauth/callback?provider=${provider}`;

    // Get OAuth URL builder for the provider
    const urlBuilder = OAUTH_URL_BUILDERS[provider as ProviderId];
    if (!urlBuilder) {
      throw ErrorHandler.handleValidationError(`OAuth flow not implemented for ${provider}`);
    }

    // Build OAuth URL
    const authUrl = urlBuilder(clientId, providerConfig.scopes, oauthSession.state, redirectUri);
    
    if (usePopup) {
      // Open in a popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        authUrl,
        `Connect ${provider}`,
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup) {
        // Fallback to redirect if popup is blocked
        window.location.href = authUrl;
      }
    } else {
      // Redirect to OAuth provider
      window.location.href = authUrl;
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(provider: string, code: string, state: string): Promise<void> {
    // Verify state parameter
    const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
    if (storedState !== state) {
      throw ErrorHandler.handleAuthError('Invalid state parameter');
    }
    sessionStorage.removeItem(`oauth_state_${provider}`);
    
    const response = await fetch(`${this.API_BASE_URL_WITHOUT_VERSION}integrations/oauth/callback?provider=${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        code,
        state
      })
    });

    if (!response.ok) {
      throw await ErrorHandler.handleFetchError(response);
    }

    const data = await response.json();
    
    // Save connection
    const connection: IntegrationConnection = {
      provider,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scopes: data.scopes || [],
      connectedAt: new Date().toISOString()
    };

    this.saveConnection(provider, connection);
  }

  // Test connection
  async testConnection(provider: string): Promise<boolean> {
    const connection = this.getConnection(provider);
    if (!connection) {
      return false;
    }

    // Get test endpoint for provider
    const testUrl = API_TEST_ENDPOINTS[provider as ProviderId];
    if (!testUrl) {
      // Azure DevOps test would require specific API endpoint
      return provider === PROVIDER_IDS.AZURE;
    }

    try {
      // Get auth header builder for provider
      const headerBuilder = AUTH_HEADER_BUILDERS[provider as ProviderId];
      const headers = headerBuilder(connection.accessToken);

      const response = await fetch(testUrl, { headers });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get connection status for all providers
  async getConnectionStatuses(): Promise<Record<string, boolean>> {
    const providers = this.getProviders();
    const statuses: Record<string, boolean> = {};

    for (const provider of providers) {
      try {
        statuses[provider.id] = await this.testConnection(provider.id);
      } catch {
        statuses[provider.id] = false;
      }
    }

    return statuses;
  }

  // Fetch user integrations from backend
  async fetchUserIntegrations(): Promise<void> {
    const response = await apiClient.getUserIntegrations();
    
    // Update local connections with backend data
    this.connections.clear();
    response.integrations.forEach((integration: { provider: string; access_token: string; refresh_token?: string; expires_at?: string; scopes?: string[]; created_at: string }) => {
      this.connections.set(integration.provider, {
        provider: integration.provider,
        accessToken: integration.access_token,
        refreshToken: integration.refresh_token,
        expiresAt: integration.expires_at ? parseInt(integration.expires_at, 10) : undefined,
        scopes: integration.scopes || [],
        connectedAt: integration.created_at
      });
    });
    
    // Save to localStorage
    this.saveConnectionsToStorage();
  }

  // Save connections to localStorage
  private saveConnectionsToStorage(): void {
    try {
      const connectionsObj = Object.fromEntries(this.connections);
      localStorage.setItem('integrations', JSON.stringify(connectionsObj));
    } catch {
      // Silent error handling for localStorage
    }
  }
}

// Create and export singleton instance
export const integrationService = new IntegrationService();

// Export the class for testing
export { IntegrationService };