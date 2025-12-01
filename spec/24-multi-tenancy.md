# Spec 24: Multi-Tenancy

**Status:** In Progress
**Created:** 2025-12-01

## Overview

Implement multi-tenancy support where all entities (Ideas, KB Documents) are organized under Portfolios and Products. Each Portfolio belongs to an organization and contains multiple Products. Product managers are responsible for portfolios and manage the products within them.

## Data Model

### Portfolio
- `code` - URL-friendly code, serves as primary key (e.g., "acme")
- `organizationName` - Name of the organization (e.g., "Acme Corp")
- `name` - Portfolio display name (e.g., "Consumer Products")
- `owners` - List of owner email addresses
- `products` - List of products, each with:
  - `code` - URL-friendly product code (e.g., "mobile-app")
  - `name` - Product display name (e.g., "Mobile App")

### Updated Entities
All existing entities (Idea, KBDocument) will include:
- `portfolioCode` - Reference to the portfolio
- `productCode` - Reference to the product within the portfolio

## URL Schema

```
/{portfolio_code}/{product_code}/ideas          - Ideas list for product
/{portfolio_code}/{product_code}/ideas/new      - New idea form
/{portfolio_code}/{product_code}/ideas/{id}     - Idea detail
/{portfolio_code}/{product_code}/kb             - KB list for product
/{portfolio_code}/{product_code}/kb/new         - New KB document form
/{portfolio_code}/{product_code}/kb/{id}        - KB document detail
/portfolios                                     - Portfolio list
/portfolios/{portfolio_code}                    - Portfolio detail
```

## Requirements

### Functional Requirements

1. **Portfolio Management**
   - View list of all portfolios
   - View portfolio details including products and owners
   - Each portfolio has a unique code used in URLs

2. **Product Scoping**
   - All ideas and KB documents are scoped to a specific product
   - URLs reflect the portfolio/product hierarchy
   - Navigation maintains portfolio/product context

3. **Data Isolation**
   - Ideas and KB documents are filtered by portfolio and product codes
   - Each product has its own set of ideas and documents

### Technical Requirements

1. **Data Model Updates**
   - Add Portfolio model to Amplify schema
   - Add portfolioCode and productCode to Idea model
   - Add portfolioCode and productCode to KBDocument model

2. **Routing Updates**
   - Create dynamic route structure: `[portfolioCode]/[productCode]/...`
   - Update all existing pages to work within this structure

3. **Navigation Updates**
   - Add portfolio/product context to navigation
   - Breadcrumb-style navigation showing current context

## Implementation Plan

### Phase 1: Data Model
1. Create Portfolio model in Amplify schema
2. Add portfolioCode and productCode fields to Idea
3. Add portfolioCode and productCode fields to KBDocument
4. Run `npx ampx sandbox --once` to regenerate schema

### Phase 2: Portfolio Page
1. Create `/portfolios` page to list portfolios
2. Create `/portfolios/[id]` page for portfolio details

### Phase 3: Route Restructuring
1. Create `[portfolioCode]/[productCode]` dynamic route structure
2. Move ideas pages under new structure
3. Move KB pages under new structure
4. Update all links and navigation

### Phase 4: Data Filtering
1. Update idea queries to filter by portfolio/product
2. Update KB queries to filter by portfolio/product
3. Update create forms to include portfolio/product codes

## Test Cases

### Cypress E2E Tests

**Portfolio Page Tests**

```typescript
describe("Portfolio Page", () => {
  it("displays the portfolio list heading", () => {
    cy.visit("/portfolios");
    cy.contains("h1", "Portfolios").should("be.visible");
  });

  it("shows portfolio cards with organization name", () => {
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-list"]').should("exist");
  });

  it("displays portfolio details when clicked", () => {
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]').first().click();
    cy.get('[data-testid="portfolio-detail"]').should("exist");
  });

  it("shows products list in portfolio detail", () => {
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]').first().click();
    cy.get('[data-testid="products-list"]').should("exist");
  });

  it("shows owners list in portfolio detail", () => {
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]').first().click();
    cy.get('[data-testid="owners-list"]').should("exist");
  });
});
```

**Scoped Navigation Tests**

```typescript
describe("Scoped Navigation", () => {
  it("navigates to product ideas page", () => {
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]').first().click();
    cy.get('[data-testid="product-link"]').first().click();
    cy.url().should("match", /\/[a-z-]+\/[a-z-]+\/ideas/);
  });

  it("maintains portfolio/product context in navigation", () => {
    cy.visit("/acme/mobile-app/ideas");
    cy.get('[data-testid="nav-portfolio"]').should("contain", "acme");
    cy.get('[data-testid="nav-product"]').should("contain", "mobile-app");
  });
});
```

## UI Design

### Portfolio List Page
```
┌─────────────────────────────────────────────────────────────┐
│  Portfolios                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Acme Corp                                          │   │
│  │  Consumer Products Portfolio                        │   │
│  │  3 products | 2 owners                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  TechStart Inc                                      │   │
│  │  Platform Portfolio                                 │   │
│  │  5 products | 3 owners                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Portfolio Detail Page
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Portfolios                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Consumer Products Portfolio                                │
│  Organization: Acme Corp                                    │
│  Code: acme                                                 │
│                                                             │
│  Owners                                                     │
│  • john@acme.com                                            │
│  • jane@acme.com                                            │
│                                                             │
│  Products                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Mobile App (mobile-app)              [View Ideas]  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Web Platform (web-platform)          [View Ideas]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scoped Ideas Page
```
┌─────────────────────────────────────────────────────────────┐
│  acme / mobile-app                                          │
│  Idea Backlog    Knowledge Base                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Idea Backlog                            [ + New Idea ]     │
│                                                             │
│  (Ideas filtered to this product only)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
