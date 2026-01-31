/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<jQuery<HTMLElement>>
      
      /**
       * Custom command to login with mock user
       * @example cy.login()
       */
      login(): Chainable<void>
      
      /**
       * Custom command to mock API responses
       * @example cy.mockApi('GET', '/api/tasks', { tasks: [] })
       */
      mockApi(method: string, url: string, response: unknown): Chainable<void>
      
      /**
       * Custom command to visit a page with authentication
       * @example cy.visitWithAuth('/tasks')
       */
      visitWithAuth(url: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`)
})

Cypress.Commands.add('login', () => {
  // Real authentication - navigate to login and perform actual login
  cy.visit('/');
  // Wait for the app to load and show login if needed
  cy.get('body').should('be.visible');
  // If login is required, perform real login
  cy.get('button:contains("Sign in")').click();
  // This will use real Supabase authentication
});

Cypress.Commands.add('visitWithAuth', (url: string) => {
  cy.visit(url);
  // Let the app handle authentication naturally
});

export { };
