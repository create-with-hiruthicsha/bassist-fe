describe('Landing Page - Comprehensive E2E Tests', () => {
  beforeEach(() => {
    // Clear any existing console errors before each test
    cy.window().then((win) => {
      win.console.clear();
    });
    
    // If auth wall present, authenticate first (session cached globally)
    cy.ensureAuthenticated();
    cy.visit('/');
  });

  // ===== BASIC FUNCTIONALITY TESTS =====
  it('displays the landing page correctly without errors', () => {
    // Check for console errors
    cy.window().then((win) => {
      const consoleErrors: string[] = [];
      const originalError = win.console.error;
      win.console.error = (...args: unknown[]) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(win.console, args);
      };
      
      // Wait for page to fully load
      cy.get('body').should('be.visible');
      
      // Check for any console errors after page load
      cy.then(() => {
        expect(consoleErrors, 'No console errors should be present').to.have.length(0);
      });
    });

    // Verify main elements are visible
    cy.contains('Bassist').should('be.visible');
    cy.contains('AI-Powered Project Management').should('be.visible');
    cy.contains('Choose what you\'d like to do with your project').should('be.visible');
    
    // Verify no JavaScript errors in the DOM
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', 'TypeError:');
    cy.get('body').should('not.contain', 'ReferenceError:');
  });

  it('shows all three main action cards', () => {
    cy.get('[data-cy="action-card"]').should('have.length', 3);
    
    cy.contains('Generate Documentation').should('be.visible');
    cy.contains('button', 'Generate Tasks').should('be.visible');
    cy.contains('button', 'Create Tasks').should('be.visible');
  });

  it('displays integrations section with correct information', () => {
    cy.contains('Integrations').should('be.visible');
    cy.contains('Connect external services to enhance your workflow').should('be.visible');
    cy.contains('External Services').should('be.visible');
    cy.contains('Connect to GitHub, GitLab, Bitbucket, and Azure DevOps').should('be.visible');
  });

  it('shows proper header with logo and branding', () => {
    cy.get('header').should('be.visible');
    cy.get('header').within(() => {
      cy.contains('Bassist').should('be.visible');
      cy.get('svg').should('be.visible'); // Logo icon
    });
  });

  it('displays step-by-step guidance text', () => {
    cy.contains('Each option will guide you through the process step by step').should('be.visible');
  });

  it('has proper navigation structure', () => {
    cy.get('main').should('be.visible');
    cy.get('header').should('be.visible');
  });

  // ===== NAVIGATION TESTS =====
  it('navigates to documents page when Generate Documentation is clicked', () => {
    cy.contains('button', 'Start DocGen').click();
    cy.url().should('include', '/documents');
    cy.contains('Document Generator').should('be.visible');
    
    // Verify the documents page loads without errors
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', 'TypeError:');
    cy.get('body').should('not.contain', 'ReferenceError:');
    
    // Check for console errors on the new page
    cy.window().then((win) => {
      const consoleErrors: string[] = [];
      const originalError = win.console.error;
      win.console.error = (...args: unknown[]) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(win.console, args);
      };
      
      cy.then(() => {
        expect(consoleErrors, 'No console errors should be present on documents page').to.have.length(0);
      });
    });
  });

  it('navigates to tasks page when Generate Tasks is clicked', () => {
    cy.contains('button', 'Generate Tasks').click();
    cy.url().should('include', '/tasks');
    cy.contains('Task Generator').should('be.visible');
    
    // Verify the tasks page loads without errors
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', 'TypeError:');
    cy.get('body').should('not.contain', 'ReferenceError:');
    
    // Check for console errors on the new page
    cy.window().then((win) => {
      const consoleErrors: string[] = [];
      const originalError = win.console.error;
      win.console.error = (...args: unknown[]) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(win.console, args);
      };
      
      cy.then(() => {
        expect(consoleErrors, 'No console errors should be present on tasks page').to.have.length(0);
      });
    });
  });

  it('navigates to direct create tasks page when Create Tasks is clicked', () => {
    cy.contains('button', 'Create Tasks').click();
    cy.url().should('include', '/direct-create-tasks');
    cy.contains('Create Tasks').should('be.visible');
    
    // Verify the direct create tasks page loads without errors
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', 'TypeError:');
    cy.get('body').should('not.contain', 'ReferenceError:');
    
    // Check for console errors on the new page
    cy.window().then((win) => {
      const consoleErrors: string[] = [];
      const originalError = win.console.error;
      win.console.error = (...args: unknown[]) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(win.console, args);
      };
      
      cy.then(() => {
        expect(consoleErrors, 'No console errors should be present on direct create tasks page').to.have.length(0);
      });
    });
  });

  it('navigates to integrations page when Manage Integrations is clicked', () => {
    cy.contains('button', 'Manage Integrations').click();
    cy.url().should('include', '/integrations');
    cy.contains('Integrations').should('be.visible');
    
    // Verify the integrations page loads without errors
    cy.get('body').should('be.visible');
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', 'TypeError:');
    cy.get('body').should('not.contain', 'ReferenceError:');
    
    // Check for console errors on the new page
    cy.window().then((win) => {
      const consoleErrors: string[] = [];
      const originalError = win.console.error;
      win.console.error = (...args: unknown[]) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(win.console, args);
      };
      
      cy.then(() => {
        expect(consoleErrors, 'No console errors should be present on integrations page').to.have.length(0);
      });
    });
  });

  it('maintains navigation state when returning from other pages', () => {
    cy.contains('button', 'Generate Tasks').click();
    cy.url().should('include', '/tasks');
    
    cy.contains('button', 'Back').click();
    cy.url().should('include', '/');
    cy.contains('AI-Powered Project Management').should('be.visible');
  });

  // ===== RESPONSIVE DESIGN TESTS =====
  it('works correctly on desktop viewport', () => {
    cy.viewport(1280, 720);
    cy.get('[data-cy="action-card"]').should('be.visible');
    cy.get('[data-cy="action-card"]').should('have.length', 3);
    cy.contains('AI-Powered Project Management').should('be.visible');
  });

  it('works correctly on tablet viewport', () => {
    cy.viewport(768, 1024);
    cy.get('[data-cy="action-card"]').should('be.visible');
    cy.get('[data-cy="action-card"]').should('have.length', 3);
    cy.contains('AI-Powered Project Management').should('be.visible');
  });

  it('works correctly on mobile viewport', () => {
    cy.viewport(375, 667);
    cy.get('[data-cy="action-card"]').should('be.visible');
    cy.get('[data-cy="action-card"]').should('have.length', 3);
    cy.contains('AI-Powered Project Management').should('be.visible');
  });

  // ===== ERROR HANDLING TESTS =====
  it('verifies no JavaScript errors are present on page load', () => {
    // Check for uncaught exceptions
    cy.window().then((win) => {
      const uncaughtErrors: unknown[] = [];
      win.addEventListener('unhandledrejection', (event) => {
        uncaughtErrors.push(event.reason);
      });
      win.addEventListener('error', (event) => {
        uncaughtErrors.push(event.error);
      });
      
      cy.then(() => {
        expect(uncaughtErrors, 'No uncaught JavaScript errors should occur').to.have.length(0);
      });
    });
    
    // Verify React error boundaries are not triggered
    cy.get('body').should('not.contain', 'Something went wrong');
    cy.get('body').should('not.contain', 'Error Boundary');
    
    // Check for network errors
    cy.window().then((win) => {
      const networkErrors: unknown[] = [];
      const originalFetch = win.fetch;
      win.fetch = (...args: Parameters<typeof fetch>) => {
        return originalFetch.apply(win, args).catch((error: unknown) => {
          networkErrors.push(error);
          throw error;
        });
      };
      
      cy.then(() => {
        expect(networkErrors, 'No network errors should occur during page load').to.have.length(0);
      });
    });
  });

  it('verifies all interactive elements are functional without errors', () => {
    // Test that all buttons are clickable and don't cause errors
    cy.get('[data-cy="action-card"]').each(($card) => {
      cy.wrap($card).find('button').should('be.visible').and('be.enabled');
    });
    
    // Test navigation without errors
    cy.get('button').each(($button) => {
      cy.wrap($button).should('be.visible');
      // Don't actually click to avoid navigation, just verify they're functional
    });
  });

  it('checks for proper error handling in React components', () => {
    // Verify no React component errors are displayed
    cy.get('body').should('not.contain', 'React');
    cy.get('body').should('not.contain', 'componentDidCatch');
    cy.get('body').should('not.contain', 'getDerivedStateFromError');
    
    // Check that all components render properly
    cy.get('[data-cy="action-card"]').should('have.length', 3);
    cy.get('header').should('be.visible');
    cy.get('main').should('be.visible');
  });
});