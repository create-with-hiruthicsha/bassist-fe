/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      visitWithAuth(url: string): Chainable<void>
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
      login(): Chainable<void>
      mockApi(method: string, url: string, response: unknown): Chainable<void>
      loginWithTestUser(): Chainable<void>
      establishSession(): Chainable<void>
      ensureAuthenticated(): Chainable<void>
    }
  }
}

export {}
