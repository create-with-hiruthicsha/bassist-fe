describe('Landing Page - Sad Path', () => {
  beforeEach(() => {
    cy.visitWithAuth('/');
  });

  it('handles slow network connections gracefully', () => {
    // Simulate slow network
    cy.intercept('GET', '**/api/**', { delay: 2000 }).as('slowApi');
    
    cy.contains('Generate Tasks').click();
    cy.url().should('include', '/tasks');
    // Page should still load even with slow API
    cy.contains('Task Generator').should('be.visible');
  });

  it('handles partial page loads when some resources fail', () => {
    // Mock some resources failing
    cy.intercept('GET', '**/api/integrations/status', { statusCode: 500 }).as('failedApi');
    
    cy.contains('Manage Integrations').click();
    cy.url().should('include', '/integrations');
    // Should still show the page even if some data fails to load
    cy.contains('Integrations').should('be.visible');
  });

  it('handles browser back button navigation correctly', () => {
    cy.contains('Generate Tasks').click();
    cy.url().should('include', '/tasks');
    
    cy.go('back');
    cy.url().should('include', '/');
    cy.contains('AI-Powered Project Management').should('be.visible');
  });

  it('handles page refresh during navigation', () => {
    cy.contains('Generate Tasks').click();
    cy.url().should('include', '/tasks');
    
    cy.reload();
    cy.contains('Task Generator').should('be.visible');
  });

  it('handles interrupted navigation gracefully', () => {
    // Start navigation but interrupt it
    cy.contains('Generate Tasks').click();
    cy.url().should('include', '/tasks');
    
    // Navigate to another page quickly
    cy.visitWithAuth('/');
    cy.contains('AI-Powered Project Management').should('be.visible');
  });

  it('handles authentication token expiration during page load', () => {
    // Mock expired token
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'expired-token',
        refresh_token: 'expired-refresh-token',
        expires_at: Date.now() - 3600000, // Expired 1 hour ago
        user: {
          id: 'mock-user-id',
          email: 'test@example.com'
        }
      }));
    });
    
    cy.visit('/');
    // Should still show the page, might redirect to auth
    cy.contains('Bassist').should('be.visible');
  });

  it('handles missing user data gracefully', () => {
    // Mock missing user data
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000,
        user: null // Missing user data
      }));
    });
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
  });

  it('handles localStorage corruption gracefully', () => {
    // Corrupt localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', 'invalid-json');
    });
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
  });

  it('handles network disconnection during page load', () => {
    // Simulate network offline
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, 'onLine', {
        writable: true,
        value: false
      });
    });
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
  });

  it('handles slow rendering on low-end devices', () => {
    // Simulate slow device
    cy.clock();
    cy.visit('/');
    
    // Fast forward time to simulate slow rendering
    cy.tick(1000);
    cy.contains('Bassist').should('be.visible');
    
    cy.tick(2000);
    cy.get('[data-cy="action-card"]').should('be.visible');
  });

  it('handles memory pressure gracefully', () => {
    // Simulate memory pressure by creating large objects
    cy.window().then((win) => {
      // Create large object to simulate memory pressure
      const largeArray = new Array(10000).fill('test data');
      win.memoryTest = largeArray;
    });
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
  });

  it('handles concurrent navigation attempts', () => {
    // Simulate rapid navigation clicks
    cy.contains('Generate Tasks').click();
    cy.contains('Generate Documentation').click();
    cy.contains('Create Tasks').click();
    
    // Should end up on one of the pages
    cy.url().should('match', /(\/)(tasks|documents|direct-create-tasks)/);
  });

  it('handles browser zoom changes', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
    
    // Simulate zoom
    cy.viewport(640, 360); // 50% zoom
    cy.contains('Bassist').should('be.visible');
    
    cy.viewport(2560, 1440); // 200% zoom
    cy.contains('Bassist').should('be.visible');
  });

  it('handles CSS loading failures', () => {
    // Block CSS resources
    cy.intercept('GET', '**/*.css', { statusCode: 404 }).as('cssFailure');
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
    // Page should still be functional without CSS
  });

  it('handles JavaScript errors in external libraries', () => {
    // Mock PostHog error
    cy.window().then((win) => {
      win.posthog = {
        capture: () => { throw new Error('PostHog error'); },
        identify: () => { throw new Error('PostHog error'); },
        reset: () => { throw new Error('PostHog error'); }
      };
    });
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
  });

  it('handles form submission with network issues', () => {
    cy.contains('Generate Tasks').click();
    cy.url().should('include', '/tasks');
    
    // Simulate network issues during form submission
    cy.intercept('POST', '**/api/tasks/generate', { 
      statusCode: 408, // Request timeout
      body: { error: 'Request timeout' }
    }).as('timeoutError');
    
    cy.contains('Jira').click();
    cy.get('textarea').type('Test project description');
    cy.get('button:contains("Generate Tasks")').click();
    
    cy.wait('@timeoutError');
    cy.contains('Request timeout').should('be.visible');
  });

  it('handles browser compatibility issues', () => {
    // Mock older browser features
    cy.window().then((win) => {
      // Remove modern features
      delete win.IntersectionObserver;
      delete win.ResizeObserver;
    });
    
    cy.visit('/');
    cy.contains('Bassist').should('be.visible');
  });

  it('handles race conditions in navigation', () => {
    // Simulate race condition by rapidly clicking
    cy.contains('Generate Tasks').click();
    cy.contains('Generate Documentation').click();
    
    // Should handle the race condition gracefully
    cy.url().should('match', /(\/)(tasks|documents)/);
  });
});


