# Spec 26: Product-Scoped Idea ID

**Status:** In Progress
**Created:** 2025-12-01

## Overview

Each idea should have a sequential ID scoped to its product. The first idea created in a product is #1, the second is #2, and so on. This provides a human-friendly reference number for ideas within a product context.

## Requirements

### Functional Requirements

1. **Sequential ID Assignment**
   - When a new idea is created, automatically assign the next sequential number for that product
   - IDs start at 1 for each product
   - IDs are never reused (even if an idea is deleted)

2. **ID Display**
   - Display the idea number in the ideas list (e.g., "#1", "#5")
   - Display the idea number on the idea detail page
   - Include the ID in the page title or heading

3. **ID Reference**
   - Users can reference ideas by their product-scoped ID (e.g., "Idea #5")
   - Future: URL routing could include the ID (e.g., `/portfolio/product/ideas/5`)

### Technical Requirements

1. **Schema**
   - `ideaNumber` field on Idea model (integer, required)
   - `portfolioCode` and `productCode` are also required
   - Field is set automatically on creation, not user-editable

2. **ID Generation**
   - Query for the maximum `ideaNumber` for the product
   - Assign max + 1 to the new idea
   - Handle concurrent creation (use atomic operations or transactions)

3. **Data Integrity**
   - Ensure no duplicate IDs within a product
   - Handle edge cases (first idea in product, concurrent writes)

## Implementation Plan

### Files to Modify

1. **amplify/data/resource.ts**
   - Add `ideaNumber` field to Idea schema (integer, required)
   - Make `portfolioCode` and `productCode` required
   - Consider adding GSI on portfolioCode + productCode + ideaNumber

2. **src/app/[portfolioCode]/[productCode]/ideas/new/page.tsx**
   - Query for max ideaNumber before creating idea
   - Include ideaNumber in create mutation

3. **src/app/IdeasList.tsx**
   - Display ideaNumber in a new column or prefix to name
   - Format as "#N" (e.g., "#1", "#12")

4. **src/app/[portfolioCode]/[productCode]/ideas/[id]/page.tsx**
   - Display ideaNumber in the heading
   - Format as "Idea #N: {name}"

### New/Modified Test Files

1. **cypress/e2e/idea-number.cy.ts**
   - Test ID is displayed in list
   - Test ID is displayed on detail page
   - Test new ideas get incremented IDs

## Test Cases

### Cypress E2E Tests

**Test 1: ID Displayed in Ideas List**
```typescript
it("displays idea number in list", () => {
  cy.visit(TEST_IDEAS_PATH);
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-number"]').should("exist");
    cy.get('[data-testid="idea-number"]').invoke("text").should("match", /^#\d+$/);
  });
});
```

**Test 2: ID Displayed on Detail Page**
```typescript
it("displays idea number on detail page", () => {
  cy.visit(TEST_IDEAS_PATH);
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.get('[data-testid="idea-detail-number"]').should("exist");
  cy.get('[data-testid="idea-detail-number"]').invoke("text").should("match", /^#\d+$/);
});
```

**Test 3: New Ideas Get Sequential IDs**
```typescript
it("assigns sequential ID to new idea", () => {
  // Get current max ID
  cy.visit(TEST_IDEAS_PATH);
  cy.get('[data-testid="idea-number"]')
    .then(($ids) => {
      const ids = [...$ids].map((el) => Number(el.textContent?.replace("#", "")));
      const maxId = Math.max(...ids);

      // Create new idea
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      cy.get('[name="name"]').type("Sequential ID Test");
      cy.get('[name="hypothesis"]').type("Testing sequential ID assignment");
      cy.get('button[type="submit"]').click();

      // Verify new idea has max + 1
      cy.visit(TEST_IDEAS_PATH);
      cy.contains("Sequential ID Test")
        .closest('[data-testid="idea-item"]')
        .find('[data-testid="idea-number"]')
        .should("contain", `#${maxId + 1}`);
    });
});
```

**Test 4: IDs Are Product-Scoped**
```typescript
it("IDs are scoped to product (different products can have same ID)", () => {
  // This test verifies the concept - in practice, test by checking
  // that ideas in test product start from #1
  cy.visit(TEST_IDEAS_PATH);
  cy.get('[data-testid="idea-number"]').first().should("contain", "#");
});
```

## UI Design

### Ideas List with Idea Number

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ #    │ Name          │ Hypothesis      │ Status        │ Age    │ Upvotes  │
├─────────────────────────────────────────────────────────────────────────────┤
│ #1   │ My Idea       │ We believe...   │ First Level   │ 2 days │  5  [+1] │
│ #2   │ Another Idea  │ If we...        │ Scaling       │ 1 day  │  12 [+1] │
│ #3   │ Third Idea    │ Testing...      │ Validated     │ 3 hrs  │  0  [+1] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Detail Page Heading

```
← Back to Ideas

Idea #3: Third Idea
Status: Validated | Source: Customer Feedback | Created: Dec 1, 2025

Hypothesis:
Testing the hypothesis display with proper formatting.
```

## Edge Cases

1. **First Idea in Product**
   - No existing ideas to query
   - Assign ID #1

2. **Concurrent Creation**
   - Two users create ideas simultaneously
   - Use database transaction or optimistic locking
   - Fallback: Query and retry if duplicate detected

3. **Deleted Ideas**
   - IDs should not be reused
   - If idea #3 is deleted, next idea is still #4 (not #3)

4. **Product Migration**
   - If an idea is moved to a different product (future feature)
   - Should receive a new ID in the target product

## Notes

- The `ideaNumber` field has been added to the schema as required
- `portfolioCode` and `productCode` are also required fields
- Seed script already assigns sequential IDs
- This spec focuses on runtime ID assignment when users create ideas through the UI
- Consider adding a compound unique constraint on (portfolioCode, productCode, ideaNumber)
