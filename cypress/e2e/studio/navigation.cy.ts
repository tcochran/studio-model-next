import { TEST_USERS, TEST_IDEAS_PATH } from '../../support/test-paths';

describe('Studio Navigation', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type(TEST_USERS.PRODUCT_MANAGER);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/ideas');
  });

  describe('Header', () => {
    it('displays user email correctly', () => {
      cy.get('header').within(() => {
        cy.contains(TEST_USERS.PRODUCT_MANAGER).should('be.visible');
      });
    });

    it('displays studio name correctly', () => {
      cy.get('header').within(() => {
        cy.contains('Test Studio').should('be.visible');
      });
    });

    it('displays portfolio name in switcher', () => {
      cy.get('header').within(() => {
        cy.contains('Test Portfolio').should('be.visible');
      });
    });

    it('logo links to portfolios page', () => {
      cy.get('header').within(() => {
        cy.contains('Studio Model').should('have.attr', 'href', '/portfolios');
      });
    });

    it('portfolio switcher opens dropdown on click', () => {
      cy.get('header').within(() => {
        cy.contains('Test Portfolio').click();
      });
      // Check that dropdown appeared
      cy.contains('View All Portfolios').should('be.visible');
    });

    it('portfolio switcher closes when clicking outside', () => {
      cy.get('header').within(() => {
        cy.contains('Test Portfolio').click();
      });
      cy.contains('View All Portfolios').should('be.visible');

      // Click outside the dropdown
      cy.get('body').click(0, 0);
      cy.contains('View All Portfolios').should('not.exist');
    });

    it('is visible on ideas page', () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('header').should('be.visible');
    });

    it('is visible on portfolios page', () => {
      cy.visit('/portfolios');
      cy.get('header').should('be.visible');
    });
  });

  describe('Footer', () => {
    it('is visible on ideas page', () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('footer').should('be.visible');
    });

    it('is visible on portfolios page', () => {
      cy.visit('/portfolios');
      cy.get('footer').should('be.visible');
    });

    it('contains logout button', () => {
      cy.get('footer').within(() => {
        cy.contains('Logout').should('be.visible');
      });
    });
  });

  describe('Login page', () => {
    it('does not show header or footer', () => {
      cy.visit('/login');
      cy.get('header').should('not.exist');
      cy.get('footer').should('not.exist');
    });
  });
});
