describe('Integrations - Alternative Paths', () => {
  beforeEach(() => {
    cy.visitWithAuth('/integrations');
  });

  it('allows connecting to GitHub via direct OAuth flow', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 200,
      body: { authUrl: 'https://github.com/login/oauth/authorize?client_id=test' }
    }).as('getGitHubAuth');
    
    cy.contains('Connect to GitHub').click();
    cy.wait('@getGitHubAuth');
    // Should redirect to GitHub OAuth
    cy.url().should('include', 'github.com');
  });

  it('allows connecting to Jira via direct OAuth flow', () => {
    cy.intercept('GET', '**/api/integrations/oauth/jira', {
      statusCode: 200,
      body: { authUrl: 'https://auth.atlassian.com/authorize?client_id=test' }
    }).as('getJiraAuth');
    
    cy.contains('Connect to Jira').click();
    cy.wait('@getJiraAuth');
    // Should redirect to Jira OAuth
    cy.url().should('include', 'atlassian.com');
  });

  it('handles OAuth connection errors gracefully for GitHub', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 500,
      body: { error: 'OAuth connection failed' }
    }).as('getGitHubAuthError');

    cy.contains('Connect to GitHub').click();
    cy.wait('@getGitHubAuthError');
    cy.contains('Failed to connect to GitHub').should('be.visible');
  });

  it('handles OAuth connection errors gracefully for Jira', () => {
    cy.intercept('GET', '**/api/integrations/oauth/jira', {
      statusCode: 500,
      body: { error: 'OAuth connection failed' }
    }).as('getJiraAuthError');

    cy.contains('Connect to Jira').click();
    cy.wait('@getJiraAuthError');
    cy.contains('Failed to connect to Jira').should('be.visible');
  });

  it('shows loading state during GitHub connection', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 200,
      delay: 1000,
      body: { authUrl: 'https://github.com/login/oauth/authorize?client_id=test' }
    }).as('getGitHubAuth');

    cy.contains('Connect to GitHub').click();
    cy.contains('Connecting...').should('be.visible');
  });

  it('shows loading state during Jira connection', () => {
    cy.intercept('GET', '**/api/integrations/oauth/jira', {
      statusCode: 200,
      delay: 1000,
      body: { authUrl: 'https://auth.atlassian.com/authorize?client_id=test' }
    }).as('getJiraAuth');

    cy.contains('Connect to Jira').click();
    cy.contains('Connecting...').should('be.visible');
  });

  it('allows disconnecting from GitHub', () => {
    cy.intercept('DELETE', '**/api/integrations/github', {
      statusCode: 200,
      body: { success: true }
    }).as('disconnectGitHub');

    cy.intercept('GET', '**/api/integrations/status', {
      statusCode: 200,
      body: {
        github: { connected: true, name: 'GitHub' }
      }
    }).as('getIntegrationStatus');

    cy.visitWithAuth('/integrations');
    cy.wait('@getIntegrationStatus');
    
    cy.contains('Disconnect').click();
    cy.wait('@disconnectGitHub');
  });

  it('allows disconnecting from Jira', () => {
    cy.intercept('DELETE', '**/api/integrations/jira', {
      statusCode: 200,
      body: { success: true }
    }).as('disconnectJira');

    cy.intercept('GET', '**/api/integrations/status', {
      statusCode: 200,
      body: {
        jira: { connected: true, name: 'Jira' }
      }
    }).as('getIntegrationStatus');

    cy.visitWithAuth('/integrations');
    cy.wait('@getIntegrationStatus');
    
    cy.contains('Disconnect').click();
    cy.wait('@disconnectJira');
  });
});