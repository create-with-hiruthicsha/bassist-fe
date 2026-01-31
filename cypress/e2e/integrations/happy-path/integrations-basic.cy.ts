describe('Integrations E2E Tests', () => {
  beforeEach(() => {
    cy.visitWithAuth('/integrations');
  });

  it('displays the integrations page correctly', () => {
    cy.contains('Integrations').should('be.visible');
    cy.contains('Connect external services to enhance your workflow').should('be.visible');
  });

  it('shows back button and navigates to landing page', () => {
    cy.contains('Back').should('be.visible');
    cy.contains('Back').click();
    cy.url().should('include', '/');
  });

  it('displays available integration options', () => {
    cy.contains('GitHub').should('be.visible');
    cy.contains('Jira').should('be.visible');
  });

  it('shows connection status for each integration', () => {
    // Mock integration status
    cy.intercept('GET', '**/api/integrations/status', {
      statusCode: 200,
      body: {
        github: { connected: true, name: 'GitHub' },
        jira: { connected: false, name: 'Jira' }
      }
    }).as('getIntegrationStatus');

    cy.visitWithAuth('/integrations');
    cy.wait('@getIntegrationStatus');
    
    cy.contains('Connected').should('be.visible');
    cy.contains('Not Connected').should('be.visible');
  });

  it('allows connecting to GitHub', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 200,
      body: { authUrl: 'https://github.com/login/oauth/authorize?client_id=test' }
    }).as('getGitHubAuth');

    cy.contains('Connect to GitHub').click();
    cy.wait('@getGitHubAuth');
  });

  it('allows connecting to Jira', () => {
    cy.intercept('GET', '**/api/integrations/oauth/jira', {
      statusCode: 200,
      body: { authUrl: 'https://auth.atlassian.com/authorize?client_id=test' }
    }).as('getJiraAuth');

    cy.contains('Connect to Jira').click();
    cy.wait('@getJiraAuth');
  });

  it('shows connected integrations with disconnect option', () => {
    cy.intercept('GET', '**/api/integrations/status', {
      statusCode: 200,
      body: {
        github: { connected: true, name: 'GitHub' },
        jira: { connected: false, name: 'Jira' }
      }
    }).as('getIntegrationStatus');

    cy.visitWithAuth('/integrations');
    cy.wait('@getIntegrationStatus');
    
    cy.contains('Disconnect').should('be.visible');
  });

  it('allows disconnecting from integrations', () => {
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

  it('shows integration descriptions', () => {
    cy.contains('Connect to GitHub repositories').should('be.visible');
    cy.contains('Connect to Jira projects').should('be.visible');
  });

  it('displays integration icons', () => {
    cy.get('svg').should('exist'); // Integration icons
  });

  it('shows loading state during connection', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 200,
      delay: 1000,
      body: { authUrl: 'https://github.com/login/oauth/authorize?client_id=test' }
    }).as('getGitHubAuth');

    cy.contains('Connect to GitHub').click();
    cy.contains('Connecting...').should('be.visible');
  });

  it('handles connection errors gracefully', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 500,
      body: { error: 'Connection failed' }
    }).as('getGitHubAuthError');

    cy.contains('Connect to GitHub').click();
    cy.wait('@getGitHubAuthError');
    cy.contains('Failed to connect').should('be.visible');
  });

  it('shows integration benefits', () => {
    cy.contains('Enhanced workflow').should('be.visible');
    cy.contains('Repository management').should('be.visible');
  });

  it('is responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.contains('Integrations').should('be.visible');
    cy.get('button').should('be.visible');
  });

  it('maintains state when navigating back and forth', () => {
    cy.intercept('GET', '**/api/integrations/status', {
      statusCode: 200,
      body: {
        github: { connected: true, name: 'GitHub' }
      }
    }).as('getIntegrationStatus');

    cy.visitWithAuth('/integrations');
    cy.wait('@getIntegrationStatus');
    
    cy.contains('Back').click();
    cy.url().should('include', '/');
    
    cy.visitWithAuth('/integrations');
    cy.contains('Connected').should('be.visible');
  });
});


