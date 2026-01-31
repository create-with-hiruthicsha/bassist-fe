// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your component test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Mock external services for component tests
beforeEach(() => {
  // Mock Supabase auth
  cy.window().then((win) => {
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000,
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }
    }));
  });

  // Mock PostHog to prevent it from running
  cy.window().then((win) => {
    // Block PostHog from loading
    win.posthog = {
      capture: cy.stub(),
      identify: cy.stub(),
      reset: cy.stub(),
      isFeatureEnabled: cy.stub().returns(false),
      getFeatureFlag: cy.stub().returns(false),
      init: cy.stub(),
      loaded: cy.stub().returns(true),
      opt_in_capturing: cy.stub(),
      opt_out_capturing: cy.stub(),
      has_opted_in_capturing: cy.stub().returns(true),
      has_opted_out_capturing: cy.stub().returns(false)
    };
    
    // Prevent PostHog script from loading
    Object.defineProperty(win.document, 'createElement', {
      value: function(tagName) {
        const element = win.document.createElement.call(this, tagName);
        if (tagName === 'script' && element.src && element.src.includes('posthog')) {
          element.src = 'data:text/javascript,// PostHog blocked in tests';
        }
        return element;
      }
    });
  });
});
