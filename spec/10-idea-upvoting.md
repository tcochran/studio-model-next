# Spec 10: Idea Upvoting

**Status:** Not Started
**Created:** 2025-12-01

## Overview

Add upvoting functionality to ideas. Users can click a +1 button to upvote an idea. Ideas can be sorted by number of upvotes.

## Requirements

### Functional Requirements

1. **Upvote Button**
   - Display a +1 button on the right side of each idea row
   - Show current upvote count next to the button
   - Clicking the button increments the upvote count by 1
   - Button should provide visual feedback on click

2. **Upvote Count Display**
   - Show upvote count (e.g., "5" or "0")
   - Display count even when zero

3. **Sort by Upvotes**
   - Add "Upvotes" option to sort dropdown
   - Sort descending (most upvoted first)
   - Ideas with same upvote count maintain secondary sort by age

### Technical Requirements

1. **Schema Update**
   - Add `upvotes` field to Idea model (integer, default 0)
   - Add GSI for sorting by upvotes if needed

2. **API**
   - Create mutation to increment upvote count
   - Use atomic increment to prevent race conditions

3. **UI Components**
   - Add upvote button column to ideas table
   - Implement optimistic UI update on click
   - Add upvotes option to sort dropdown

## Implementation Plan

### Files to Modify

1. **amplify/data/resource.ts**
   - Add `upvotes` field to Idea schema
   - Default value: 0

2. **src/app/IdeasList.tsx**
   - Add upvote count and button column
   - Handle upvote click with API call
   - Add "Upvotes" to sort dropdown options

3. **src/app/page.tsx**
   - Add upvotes sorting logic
   - Pass upvotes data to IdeasList

4. **cypress/e2e/ideas.cy.ts**
   - Add tests for upvote button visibility
   - Add tests for upvote count display
   - Add tests for sort by upvotes

### New Test File

1. **cypress/e2e/idea-upvoting.cy.ts**
   - Test upvote button exists
   - Test clicking upvote increments count
   - Test sort by upvotes works

## Test Cases

### Cypress E2E Tests

**Test 1: Upvote Button Exists**
```typescript
it("displays upvote button for each idea", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="upvote-button"]').should("exist");
  });
});
```

**Test 2: Displays Upvote Count**
```typescript
it("displays upvote count", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="upvote-count"]').should("exist");
  });
});
```

**Test 3: Clicking Upvote Increments Count**
```typescript
it("increments upvote count when clicked", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="upvote-count"]').invoke("text").then((initialCount) => {
      cy.get('[data-testid="upvote-button"]').click();
      cy.get('[data-testid="upvote-count"]').should("contain", String(Number(initialCount) + 1));
    });
  });
});
```

**Test 4: Sort by Upvotes Option**
```typescript
it("has sort by upvotes option", () => {
  cy.visit("/");
  cy.get('[data-testid="sort-dropdown"]').select("upvotes");
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "upvotes");
});
```

**Test 5: Sorts by Upvotes Descending**
```typescript
it("sorts ideas by upvotes descending", () => {
  cy.visit("/?sort=upvotes");
  cy.get('[data-testid="upvote-count"]').then(($counts) => {
    const counts = [...$counts].map((el) => Number(el.textContent));
    const sortedCounts = [...counts].sort((a, b) => b - a);
    expect(counts).to.deep.equal(sortedCounts);
  });
});
```

## UI Design

### Table Row with Upvote Button

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Name          │ Hypothesis      │ Status        │ Upvotes               │
├──────────────────────────────────────────────────────────────────────────┤
│ My Idea       │ We believe...   │ First Level   │  5  [+1]              │
│ Another Idea  │ If we...        │ Scaling       │  12 [+1]              │
└──────────────────────────────────────────────────────────────────────────┘
```

### Upvote Button Styling

- Compact button with +1 text or thumbs-up icon
- Shows count to the left of the button
- Hover state with slight color change
- Brief animation on click (optional)

## Notes

- Consider whether users can upvote multiple times or only once
- For MVP, allow unlimited upvotes per user
- Future: Track user upvotes to prevent duplicates
