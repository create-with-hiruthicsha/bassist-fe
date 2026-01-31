import React from 'react';
import { FileText } from 'lucide-react';
import ActionCard from '../../src/screens/landing/components/ActionCard';

describe('ActionCard Component', () => {
  const mockProps = {
    circleBgClass: 'bg-blue-100',
    Icon: FileText,
    iconClass: 'w-8 h-8 text-blue-700',
    title: 'Test Action',
    description: 'This is a test action card component',
    buttonLabel: 'Test Button',
    buttonClass: 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-700',
    onClick: cy.stub().as('onClick')
  };

  beforeEach(() => {
    cy.mount(<ActionCard {...mockProps} />);
  });

  it('renders the component with correct content', () => {
    cy.get('[data-cy="action-card"]').should('exist');
    cy.contains('Test Action').should('be.visible');
    cy.contains('This is a test action card component').should('be.visible');
    cy.contains('Test Button').should('be.visible');
  });

  it('displays the icon correctly', () => {
    cy.get('[data-cy="action-card"] .w-8.h-8').should('exist');
  });

  it('has correct styling classes', () => {
    cy.get('[data-cy="action-card"]')
      .should('have.class', 'bg-white')
      .should('have.class', 'border')
      .should('have.class', 'border-gray-200')
      .should('have.class', 'rounded-xl');
  });

  it('calls onClick when button is clicked', () => {
    cy.contains('Test Button').click();
    cy.get('@onClick').should('have.been.called');
  });

  it('button has correct styling', () => {
    cy.contains('Test Button')
      .should('have.class', 'bg-blue-700')
      .should('have.class', 'text-white')
      .should('have.class', 'font-medium')
      .should('have.class', 'rounded-lg');
  });

  it('is accessible', () => {
    cy.contains('Test Button').should('be.focusable');
    cy.contains('Test Button').focus().should('be.focused');
  });
});
