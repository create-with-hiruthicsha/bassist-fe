import React from 'react';
import CelebrationModal from '../../src/components/CelebrationModal';

describe('CelebrationModal Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: cy.stub().as('onClose'),
    message: 'Test celebration message!'
  };

  it('renders when isOpen is true', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.contains('Test celebration message!').should('be.visible');
  });

  it('does not render when isOpen is false', () => {
    cy.mount(<CelebrationModal {...mockProps} isOpen={false} />);
    cy.contains('Test celebration message!').should('not.exist');
  });

  it('displays the celebration message', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.contains('Test celebration message!').should('be.visible');
  });

  it('has close button', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.get('button').should('contain', 'Close');
  });

  it('calls onClose when close button is clicked', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.contains('Close').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('has modal overlay', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.get('.fixed.inset-0').should('exist');
  });

  it('has celebration styling', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.get('.bg-gradient-to-br').should('exist');
  });

  it('is accessible', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.get('button').should('be.focusable');
    cy.get('button').focus().should('be.focused');
  });

  it('can be closed with Escape key', () => {
    cy.mount(<CelebrationModal {...mockProps} />);
    cy.get('body').type('{esc}');
    cy.get('@onClose').should('have.been.called');
  });
});
