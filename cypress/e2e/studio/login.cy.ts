import { TEST_USERS, TEST_IDEAS_PATH } from '../../support/test-paths';

describe('Studio Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('allows valid studio member to log in', () => {
    cy.get('input[type="email"]').type(TEST_USERS.PRODUCT_MANAGER);
    cy.get('button[type="submit"]').click();

    // Should redirect to ideas page
    cy.url().should('include', '/ideas');

    // Should show logout button in footer
    cy.contains('Logout').should('be.visible');
  });

  it('shows error for non-existent user', () => {
    cy.get('input[type="email"]').type(TEST_USERS.NON_MEMBER);
    cy.get('button[type="submit"]').click();

    // Should stay on login page
    cy.url().should('include', '/login');

    // Should show error message
    cy.contains('Failed to log in').should('be.visible');
  });

  it('validates email format', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();

    // Should show validation error
    cy.get('input[type="email"]:invalid').should('exist');
  });

  it('is case-insensitive for email', () => {
    cy.get('input[type="email"]').type('PM@TEST.COM');
    cy.get('button[type="submit"]').click();

    // Should log in successfully
    cy.url().should('include', '/ideas');
  });

  it('allows engineer to log in', () => {
    cy.get('input[type="email"]').type(TEST_USERS.ENGINEER);
    cy.get('button[type="submit"]').click();

    // Should redirect to ideas page
    cy.url().should('include', '/ideas');
  });

  it('allows designer to log in', () => {
    cy.get('input[type="email"]').type(TEST_USERS.DESIGNER);
    cy.get('button[type="submit"]').click();

    // Should redirect to ideas page
    cy.url().should('include', '/ideas');
  });
});
