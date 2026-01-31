import React from 'react';
import * as ReactModule from 'react';
import GoogleLogin from '../../src/components/auth/GoogleLogin';

// Mock the AuthContext
const mockSignInWithGoogle = cy.stub().as('signInWithGoogle');
const mockAuthContext = {
  user: null,
  loading: false,
  signInWithGoogle: mockSignInWithGoogle,
  signOut: cy.stub(),
  signInWithEmail: cy.stub(),
  signUpWithEmail: cy.stub()
};

describe('GoogleLogin Component', () => {
  beforeEach(() => {
    // Mock the useAuth hook
    cy.window().then((win) => {
      win.React = ReactModule;
      win.useAuth = () => mockAuthContext;
    });
    
    cy.mount(<GoogleLogin />);
  });

  it('renders the Google login button', () => {
    cy.get('button').should('contain', 'Sign in with Google');
    cy.get('button').should('be.visible');
  });

  it('displays Google logo', () => {
    cy.get('button svg').should('exist');
    cy.get('button svg').should('be.visible');
  });

  it('has correct styling classes', () => {
    cy.get('button')
      .should('have.class', 'w-full')
      .should('have.class', 'flex')
      .should('have.class', 'items-center')
      .should('have.class', 'justify-center')
      .should('have.class', 'bg-white')
      .should('have.class', 'border')
      .should('have.class', 'border-gray-300');
  });

  it('calls signInWithGoogle when clicked', () => {
    cy.get('button').click();
    cy.get('@signInWithGoogle').should('have.been.called');
  });

  it('shows loading state when signing in', () => {
    // Mock loading state
    const loadingAuthContext = {
      ...mockAuthContext,
      loading: true
    };
    
    cy.window().then((win) => {
      win.useAuth = () => loadingAuthContext;
    });
    
    cy.mount(<GoogleLogin />);
    cy.get('button').should('contain', 'Signing in...');
  });

  it('is accessible', () => {
    cy.get('button').should('be.focusable');
    cy.get('button').focus().should('be.focused');
  });

  it('has proper ARIA attributes', () => {
    cy.get('button').should('have.attr', 'type', 'button');
  });
});
