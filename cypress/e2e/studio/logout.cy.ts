import { TEST_USERS, TEST_IDEAS_PATH } from '../../support/test-paths';

describe('Studio Logout', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type(TEST_USERS.PRODUCT_MANAGER);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/ideas');
  });

  it('logs out and redirects to login', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });

  it('clears session after logout', () => {
    cy.contains('Logout').click();

    // Try to access protected route
    cy.visit(TEST_IDEAS_PATH);

    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('shows logout button in footer on ideas page', () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.contains('Logout').should('be.visible');
  });

  it('logout button is in footer at bottom', () => {
    // Check that logout is in a footer element
    cy.get('footer').within(() => {
      cy.contains('Logout').should('be.visible');
    });
  });
});
