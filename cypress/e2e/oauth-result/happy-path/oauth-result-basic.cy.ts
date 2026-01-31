describe('OAuth Result E2E Tests', () => {
  it('displays success result correctly', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github&message=Successfully%20connected%20to%20GitHub');
    
    cy.contains('Connection Successful').should('be.visible');
    cy.contains('Successfully connected to GitHub').should('be.visible');
    cy.contains('GitHub').should('be.visible');
  });

  it('displays error result correctly', () => {
    cy.visitWithAuth('/oauth-result?oauth=error&provider=github&message=Failed%20to%20connect%20to%20GitHub');
    
    cy.contains('Connection Failed').should('be.visible');
    cy.contains('Failed to connect to GitHub').should('be.visible');
    cy.contains('GitHub').should('be.visible');
  });

  it('displays expired result correctly', () => {
    cy.visitWithAuth('/oauth-result?oauth=expired&provider=github&message=OAuth%20session%20expired');
    
    cy.contains('Session Expired').should('be.visible');
    cy.contains('OAuth session expired').should('be.visible');
    cy.contains('GitHub').should('be.visible');
  });

  it('displays invalid result correctly', () => {
    cy.visitWithAuth('/oauth-result?oauth=invalid&provider=github&message=Invalid%20OAuth%20response');
    
    cy.contains('Invalid Response').should('be.visible');
    cy.contains('Invalid OAuth response').should('be.visible');
    cy.contains('GitHub').should('be.visible');
  });

  it('shows success icon for successful connection', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.get('.text-green-600').should('exist');
    cy.get('svg').should('exist'); // Success icon
  });

  it('shows error icon for failed connection', () => {
    cy.visitWithAuth('/oauth-result?oauth=error&provider=github');
    cy.get('.text-red-600').should('exist');
    cy.get('svg').should('exist'); // Error icon
  });

  it('shows warning icon for expired session', () => {
    cy.visitWithAuth('/oauth-result?oauth=expired&provider=github');
    cy.get('.text-yellow-600').should('exist');
    cy.get('svg').should('exist'); // Warning icon
  });

  it('allows retrying connection on error', () => {
    cy.visitWithAuth('/oauth-result?oauth=error&provider=github');
    
    cy.contains('Try Again').should('be.visible');
    cy.contains('Try Again').click();
    cy.url().should('include', '/integrations');
  });

  it('allows retrying connection on expired session', () => {
    cy.visitWithAuth('/oauth-result?oauth=expired&provider=github');
    
    cy.contains('Reconnect').should('be.visible');
    cy.contains('Reconnect').click();
    cy.url().should('include', '/integrations');
  });

  it('navigates to integrations page on success', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    
    cy.contains('Go to Integrations').should('be.visible');
    cy.contains('Go to Integrations').click();
    cy.url().should('include', '/integrations');
  });

  it('navigates to landing page', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    
    cy.contains('Back to Home').should('be.visible');
    cy.contains('Back to Home').click();
    cy.url().should('include', '/');
  });

  it('shows provider-specific messaging', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=gitlab');
    cy.contains('GitLab').should('be.visible');
    
    cy.visitWithAuth('/oauth-result?oauth=success&provider=bitbucket');
    cy.contains('Bitbucket').should('be.visible');
  });

  it('handles missing provider gracefully', () => {
    cy.visitWithAuth('/oauth-result?oauth=success');
    cy.contains('Connection Successful').should('be.visible');
    cy.contains('External service').should('be.visible');
  });

  it('handles missing message gracefully', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Connection Successful').should('be.visible');
    cy.contains('Successfully connected').should('be.visible');
  });

  it('shows appropriate action buttons based on status', () => {
    // Success case
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Go to Integrations').should('be.visible');
    cy.contains('Back to Home').should('be.visible');
    
    // Error case
    cy.visitWithAuth('/oauth-result?oauth=error&provider=github');
    cy.contains('Try Again').should('be.visible');
    cy.contains('Back to Home').should('be.visible');
  });

  it('is responsive on mobile', () => {
    cy.viewport(375, 667);
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Connection Successful').should('be.visible');
    cy.get('button').should('be.visible');
  });

  it('maintains state when navigating back and forth', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Back to Home').click();
    cy.url().should('include', '/');
    
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Connection Successful').should('be.visible');
  });

  it('shows connection details', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Connection Details').should('be.visible');
    cy.contains('Provider: GitHub').should('be.visible');
    cy.contains('Status: Connected').should('be.visible');
  });

  it('allows viewing integration settings', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('View Settings').should('be.visible');
    cy.contains('View Settings').click();
    cy.url().should('include', '/integrations');
  });

  it('shows next steps for successful connection', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Next Steps').should('be.visible');
    cy.contains('You can now sync your repositories').should('be.visible');
  });

  it('shows troubleshooting for failed connection', () => {
    cy.visitWithAuth('/oauth-result?oauth=error&provider=github');
    cy.contains('Troubleshooting').should('be.visible');
    cy.contains('Check your internet connection').should('be.visible');
    cy.contains('Verify your GitHub permissions').should('be.visible');
  });

  it('handles invalid OAuth status gracefully', () => {
    cy.visitWithAuth('/oauth-result?oauth=invalid_status&provider=github');
    cy.contains('Unknown Error').should('be.visible');
    cy.contains('An unexpected error occurred').should('be.visible');
  });

  it('shows loading state during retry', () => {
    cy.intercept('GET', '**/api/integrations/oauth/github', {
      statusCode: 200,
      delay: 1000,
      body: { authUrl: 'https://github.com/login/oauth/authorize?client_id=test' }
    }).as('retryOAuth');

    cy.visitWithAuth('/oauth-result?oauth=error&provider=github');
    cy.contains('Try Again').click();
    cy.contains('Connecting...').should('be.visible');
  });

  it('displays connection timestamp', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Connected at').should('be.visible');
    // Check for timestamp format
    cy.contains(/\d{1,2}\/\d{1,2}\/\d{4}/).should('be.visible');
  });

  it('shows integration capabilities after successful connection', () => {
    cy.visitWithAuth('/oauth-result?oauth=success&provider=github');
    cy.contains('Integration Capabilities').should('be.visible');
    cy.contains('Repository access').should('be.visible');
    cy.contains('Issue management').should('be.visible');
    cy.contains('Project synchronization').should('be.visible');
  });
});


