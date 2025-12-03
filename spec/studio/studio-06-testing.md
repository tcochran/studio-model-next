# Studio Feature - Part 6: Testing Strategy

## Overview

Comprehensive E2E testing strategy for Studio feature using Cypress.

## Test Organization

```
cypress/
  e2e/
    studio/
      login.cy.ts           # Authentication tests
      logout.cy.ts          # Logout tests
      navigation.cy.ts      # Header/footer/navigation tests
      portfolio-access.cy.ts # Access control tests
      studio-users.cy.ts    # Multi-user scenarios
```

## Test Data Constants

Add to `cypress/support/test-paths.ts`:

```typescript
// Studio test data
export const TEST_STUDIO = {
  name: 'Test Studio',
  id: 'test-studio-id',
};

export const TEST_USERS = {
  productManager: 'pm@test.com',
  engineer: 'engineer@test.com',
  designer: 'designer@test.com',
  projectManager: 'pm2@test.com',
  researcher: 'researcher@test.com',
  nonMember: 'nonmember@test.com',
};

export const TEST_PORTFOLIO = {
  name: 'test',
  id: 'test-portfolio-id',
};
```

## Test Suites

### 1. Authentication Tests

**File:** `cypress/e2e/studio/login.cy.ts`

```typescript
import { TEST_USERS, TEST_PORTFOLIO } from '../../support/test-paths';

describe('Studio Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('allows valid studio member to log in', () => {
    cy.get('input[type="email"]').type(TEST_USERS.productManager);
    cy.get('button[type="submit"]').click();

    // Should redirect to ideas page
    cy.url().should('include', `/${TEST_PORTFOLIO.name}/web-app/ideas`);

    // Should show user email in header
    cy.contains(TEST_USERS.productManager).should('be.visible');
  });

  it('shows error for non-existent user', () => {
    cy.get('input[type="email"]').type(TEST_USERS.nonMember);
    cy.get('button[type="submit"]').click();

    // Should stay on login page
    cy.url().should('include', '/login');

    // Should show error message
    cy.contains('No studio found for this email').should('be.visible');
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
    cy.url().should('include', `/${TEST_PORTFOLIO.name}/web-app/ideas`);
  });
});
```

### 2. Logout Tests

**File:** `cypress/e2e/studio/logout.cy.ts`

```typescript
import { TEST_USERS, TEST_PORTFOLIO } from '../../support/test-paths';

describe('Studio Logout', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type(TEST_USERS.productManager);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', `/${TEST_PORTFOLIO.name}/web-app/ideas`);
  });

  it('logs out and redirects to login', () => {
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });

  it('clears session after logout', () => {
    cy.contains('Logout').click();

    // Try to access protected route
    cy.visit(`/${TEST_PORTFOLIO.name}/web-app/ideas`);

    // Should redirect to login
    cy.url().should('include', '/login');
  });

  it('shows logout button in footer on all pages', () => {
    // Ideas page
    cy.visit(`/${TEST_PORTFOLIO.name}/web-app/ideas`);
    cy.contains('Logout').should('be.visible');

    // Knowledge base page
    cy.visit(`/${TEST_PORTFOLIO.name}/web-app/knowledge`);
    cy.contains('Logout').should('be.visible');
  });
});
```

### 3. Navigation Tests

**File:** `cypress/e2e/studio/navigation.cy.ts`

```typescript
import { TEST_USERS, TEST_STUDIO, TEST_PORTFOLIO } from '../../support/test-paths';

describe('Studio Navigation', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(TEST_USERS.productManager);
    cy.get('button[type="submit"]').click();
  });

  it('shows studio name in header', () => {
    cy.contains(TEST_STUDIO.name).should('be.visible');
  });

  it('shows user email in header', () => {
    cy.contains(TEST_USERS.productManager).should('be.visible');
  });

  it('shows portfolio switcher', () => {
    cy.get('[data-testid="portfolio-switcher"]').should('be.visible');
  });

  it('defaults to first portfolio alphabetically', () => {
    cy.url().should('include', `/${TEST_PORTFOLIO.name}/web-app/ideas`);
  });

  it('switches portfolios via dropdown', () => {
    // Open dropdown
    cy.get('[data-testid="portfolio-switcher"]').click();

    // Select different portfolio
    cy.contains('routeburn').click();

    // URL should update
    cy.url().should('include', '/routeburn/web-app/ideas');
  });

  it('maintains current view when switching portfolios', () => {
    // Navigate to knowledge base
    cy.visit(`/${TEST_PORTFOLIO.name}/web-app/knowledge`);

    // Switch portfolio
    cy.get('[data-testid="portfolio-switcher"]').click();
    cy.contains('routeburn').click();

    // Should stay on knowledge base view
    cy.url().should('include', '/routeburn/web-app/knowledge');
  });
});
```

### 4. Portfolio Access Control Tests

**File:** `cypress/e2e/studio/portfolio-access.cy.ts`

```typescript
import { TEST_USERS, TEST_PORTFOLIO } from '../../support/test-paths';

describe('Portfolio Access Control', () => {
  it('redirects unauthenticated users to login', () => {
    cy.visit(`/${TEST_PORTFOLIO.name}/web-app/ideas`);
    cy.url().should('include', '/login');
  });

  it('allows studio members to access portfolio', () => {
    // Login as engineer
    cy.visit('/login');
    cy.get('input[type="email"]').type(TEST_USERS.engineer);
    cy.get('button[type="submit"]').click();

    // Should access ideas page
    cy.url().should('include', `/${TEST_PORTFOLIO.name}/web-app/ideas`);
  });

  it('portfolio owner must be studio member', () => {
    // This test verifies the database constraint
    // It should be tested at the data layer
    // Seed scripts should ensure portfolio owner is always in studio
  });
});
```

### 5. Multi-User Scenarios

**File:** `cypress/e2e/studio/studio-users.cy.ts`

```typescript
import { TEST_USERS, TEST_PORTFOLIO } from '../../support/test-paths';

describe('Studio Multi-User Scenarios', () => {
  const testUser = (email: string, role: string) => {
    cy.clearCookies();
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', `/${TEST_PORTFOLIO.name}/web-app/ideas`);
    cy.contains(email).should('be.visible');
  };

  it('product manager can access portfolio', () => {
    testUser(TEST_USERS.productManager, 'product_manager');
  });

  it('engineer can access portfolio', () => {
    testUser(TEST_USERS.engineer, 'engineer');
  });

  it('designer can access portfolio', () => {
    testUser(TEST_USERS.designer, 'designer');
  });

  it('project manager can access portfolio', () => {
    testUser(TEST_USERS.projectManager, 'project_manager');
  });

  it('researcher can access portfolio', () => {
    testUser(TEST_USERS.researcher, 'researcher');
  });

  it('all roles have same permissions (Phase 1)', () => {
    // In Phase 1, roles are just labels
    // All users should have same access
    const users = [
      TEST_USERS.productManager,
      TEST_USERS.engineer,
      TEST_USERS.designer,
      TEST_USERS.projectManager,
      TEST_USERS.researcher,
    ];

    users.forEach(email => {
      cy.clearCookies();
      cy.visit('/login');
      cy.get('input[type="email"]').type(email);
      cy.get('button[type="submit"]').click();

      // All should access ideas
      cy.url().should('include', '/ideas');

      // All should access knowledge base
      cy.visit(`/${TEST_PORTFOLIO.name}/web-app/knowledge`);
      cy.url().should('include', '/knowledge');
    });
  });
});
```

## Custom Commands

Add to `cypress/support/commands.ts`:

```typescript
declare namespace Cypress {
  interface Chainable {
    loginAsUser(email: string): void;
  }
}

Cypress.Commands.add('loginAsUser', (email: string) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email);
  cy.get('button[type="submit"]').click();
  cy.url().should('not.include', '/login');
});
```

## Test Data Setup

Before running tests, ensure test data is seeded:

```bash
npm run seed:test-studios
```

This creates:
- Test Studio
- 5 test users with different roles
- Links to test portfolio

## Running Tests

```bash
# Run all studio tests
npx cypress run --spec "cypress/e2e/studio/**/*.cy.ts"

# Run specific test suite
npx cypress run --spec "cypress/e2e/studio/login.cy.ts"

# Interactive mode
npx cypress open
```

## CI/CD Integration

Tests run automatically in Amplify test phase (configured in `amplify.yml`).

## Test Coverage Checklist

### Authentication
- [ ] Valid studio member can log in
- [ ] Non-existent user sees error
- [ ] Email validation works
- [ ] Case-insensitive email matching
- [ ] Session persists across page refreshes

### Logout
- [ ] Logout redirects to login
- [ ] Session cleared after logout
- [ ] Cannot access protected routes after logout
- [ ] Logout button visible on all pages

### Navigation
- [ ] Studio name displayed in header
- [ ] User email displayed in header
- [ ] Portfolio switcher visible
- [ ] Defaults to first portfolio alphabetically
- [ ] Can switch portfolios
- [ ] Current view maintained when switching

### Access Control
- [ ] Unauthenticated users redirected to login
- [ ] Studio members can access portfolio
- [ ] Non-members cannot access portfolio
- [ ] Portfolio owner is studio member

### Multi-User
- [ ] All roles can access portfolio
- [ ] All roles have same permissions (Phase 1)
- [ ] Multiple users can work simultaneously

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-02-authentication.md](./studio-02-authentication.md) - Authentication details
- [studio-03-navigation.md](./studio-03-navigation.md) - Navigation components
- [studio-04-logout.md](./studio-04-logout.md) - Logout functionality

## Future Test Enhancements

- Permission-based tests (when roles get permissions)
- Studio invitation flow tests
- Studio member management tests
- Multi-studio user tests (when users can belong to multiple studios)
