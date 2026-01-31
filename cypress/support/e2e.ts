// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
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
import './auth-commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Setup for real API testing
before(() => {
  // Login once and cache the session across all specs
  cy.establishSession();
});

beforeEach(() => {
  // Ensure we are authenticated for every test (re-uses cached session)
  cy.ensureAuthenticated();
  // Only disable PostHog to prevent analytics during tests
  cy.window().then((win) => {
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
  });
});
