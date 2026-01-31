// Authentication commands for Cypress tests
// These commands handle secure authentication without storing credentials in code

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginWithTestUser(): Chainable<void>
      loginWithGoogle(): Chainable<void>
      logout(): Chainable<void>
      createTestUser(): Chainable<void>
      cleanupTestData(): Chainable<void>
      establishSession(): Chainable<void>
      ensureAuthenticated(): Chainable<void>
    }
  }
}

// Test user credentials from environment variables
const TEST_USER_EMAIL = Cypress.env('TEST_USER_EMAIL') || 'cypress-test@example.com';
const TEST_USER_PASSWORD = Cypress.env('TEST_USER_PASSWORD') || 'TestPassword123!';
const SUPABASE_URL = Cypress.env('SUPABASE_URL');
const SUPABASE_ANON_KEY = Cypress.env('SUPABASE_ANON_KEY');

Cypress.Commands.add('createTestUser', () => {
  // Create test user using Supabase Admin API via service role is not allowed in client.
  // For tests, attempt sign up via client; if user exists, ignore error.
  cy.window().then(async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.signUp({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
    if (error && !/already registered/i.test(error.message)) {
      throw error;
    }
  });
});

Cypress.Commands.add('loginWithTestUser', () => {
  // Login with Supabase directly
  cy.window().then(async (win) => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
    if (error) throw error;
    // Persist session in localStorage for app to pick up
    const session = data.session;
    if (session) {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600_000,
        token_type: session.token_type,
        user: session.user
      }));
    }
  });
});

// Establish a cached session once per test run (and across specs)
Cypress.Commands.add('establishSession', () => {
  const sessionName = `supabase-session:${TEST_USER_EMAIL}`;
  cy.session(sessionName, () => {
    // Perform Supabase login and persist tokens
    cy.window().then(async (win) => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.auth.signInWithPassword({ email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD });
      if (error) throw error;
      const session = data.session;
      if (session) {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at ? session.expires_at * 1000 : Date.now() + 3600_000,
          token_type: session.token_type,
          user: session.user
        }));
      }
    });
  }, { cacheAcrossSpecs: true });
});

// Ensure we are authenticated; if not, establish session
Cypress.Commands.add('ensureAuthenticated', () => {
  cy.window().then((win) => {
    try {
      const raw = win.localStorage.getItem('supabase.auth.token');
      if (!raw) {
        cy.establishSession();
        return;
      }
      const token = JSON.parse(raw);
      const now = Date.now();
      if (!token?.access_token || !token?.expires_at || token.expires_at < now + 60000) {
        cy.establishSession();
        return;
      }
    } catch {
      cy.establishSession();
      return;
    }
  });
});

Cypress.Commands.add('loginWithGoogle', () => {
  // For Google OAuth, we'll use a test approach that doesn't require real credentials
  cy.log('Google OAuth login - using test approach');
  
  // Option 1: Mock the OAuth flow for testing
  cy.window().then((win) => {
    // Simulate successful Google OAuth
    const mockGoogleUser = {
      id: 'test-google-user-id',
      email: 'cypress-google-test@example.com',
      name: 'Cypress Google Test User',
      picture: 'https://via.placeholder.com/150'
    };
    
    // Mock the OAuth callback
    win.localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-google-token',
      refresh_token: 'mock-google-refresh-token',
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: {
        id: 'test-user-id',
        email: mockGoogleUser.email,
        user_metadata: {
          full_name: mockGoogleUser.name,
          avatar_url: mockGoogleUser.picture,
          provider: 'google'
        },
        app_metadata: {
          provider: 'google',
          providers: ['google']
        }
      }
    }));
  });
  
  cy.log('Mocked Google OAuth login');
});

Cypress.Commands.add('logout', () => {
  // Use Supabase signOut and clear tokens
  cy.window().then(async (win) => {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await supabase.auth.signOut();
    win.localStorage.removeItem('supabase.auth.token');
    win.localStorage.removeItem('supabase.auth.refresh_token');
  });
  cy.log('Logged out successfully');
});

Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test data after tests
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('API_BASE_URL')}/api/test/cleanup`,
    headers: {
      'Authorization': `Bearer ${Cypress.env('TEST_API_KEY')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.log('Test data cleaned up');
  });
});

export {};
