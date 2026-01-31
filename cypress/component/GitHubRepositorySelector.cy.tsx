import React from 'react';
import GitHubRepositorySelector from '../../src/components/GitHubRepositorySelector';

// Mock the integration service and GitHub API
const mockIntegrationService = {
  isConnected: cy.stub().returns(true),
  getAccessToken: cy.stub().returns('mock-token')
};

const mockGithubApi = {
  setAccessToken: cy.stub(),
  getUserOrganizations: cy.stub().resolves([]),
  getCurrentUser: cy.stub().resolves({ login: 'testuser', avatar_url: 'https://via.placeholder.com/40' }),
  getUserRepositoriesByUsername: cy.stub().resolves([]),
  searchRepositories: cy.stub().resolves({ items: [] })
};

describe('GitHubRepositorySelector Component', () => {
  const mockProps = {
    repositoryOwner: '',
    repositoryName: '',
    onRepositoryOwnerChange: cy.stub().as('onRepositoryOwnerChange'),
    onRepositoryNameChange: cy.stub().as('onRepositoryNameChange'),
    disabled: false,
    onIntegrationRequired: cy.stub().as('onIntegrationRequired')
  };

  beforeEach(() => {
    // Mock the services
    cy.window().then((win) => {
      win.integrationService = mockIntegrationService;
      win.githubApi = mockGithubApi;
    });
    
    cy.mount(<GitHubRepositorySelector {...mockProps} />);
  });

  it('renders the component with input fields', () => {
    cy.get('input[placeholder="username or organization"]').should('be.visible');
    cy.get('input[placeholder="repository-name"]').should('be.visible');
  });

  it('displays labels correctly', () => {
    cy.contains('Repository Owner').should('be.visible');
    cy.contains('Repository Name').should('be.visible');
  });

  it('shows GitHub integration status when connected', () => {
    cy.contains('GitHub integration connected').should('be.visible');
    cy.get('.text-green-600').should('exist');
  });

  it('calls onRepositoryOwnerChange when owner input changes', () => {
    cy.get('input[placeholder="username or organization"]')
      .type('testuser')
      .then(() => {
        cy.get('@onRepositoryOwnerChange').should('have.been.calledWith', 'testuser');
      });
  });

  it('calls onRepositoryNameChange when repository input changes', () => {
    cy.get('input[placeholder="repository-name"]')
      .type('test-repo')
      .then(() => {
        cy.get('@onRepositoryNameChange').should('have.been.calledWith', 'test-repo');
      });
  });

  it('shows dropdown arrows', () => {
    cy.get('button').should('have.length.at.least', 2); // At least 2 dropdown buttons
  });

  it('handles disabled state', () => {
    cy.mount(<GitHubRepositorySelector {...mockProps} disabled={true} />);
    cy.get('input').should('be.disabled');
  });

  it('shows integration required when not connected', () => {
    mockIntegrationService.isConnected.returns(false);
    cy.mount(<GitHubRepositorySelector {...mockProps} />);
    cy.contains('GitHub integration not connected').should('be.visible');
  });

  it('calls onIntegrationRequired when connect button is clicked', () => {
    mockIntegrationService.isConnected.returns(false);
    cy.mount(<GitHubRepositorySelector {...mockProps} />);
    cy.contains('Connect').click();
    cy.get('@onIntegrationRequired').should('have.been.called');
  });

  it('is accessible', () => {
    cy.get('input').first().should('be.focusable');
    cy.get('input').first().focus().should('be.focused');
  });
});
