# Spec 29: Handle Back from Funnel View Correctly

**Status:** Complete
**Created:** 2025-12-01
**Completed:** 2025-12-01

## Overview

When a user clicks on an idea card in the funnel view and then clicks "Back to Ideas", they should return to the funnel view, not the list view. This preserves the user's navigation context and improves the overall user experience.

## Requirements

### Functional Requirements

1. **Navigation Context Preservation**
   - When navigating from funnel view → idea detail, the back button should return to funnel view
   - When navigating from list view → idea detail, the back button should return to list view
   - The system should remember which view the user came from

2. **Back Button Behavior**
   - "Back to Ideas" button on detail page should navigate to correct view
   - No change to existing back button styling or position
   - Works for both manual navigation and browser back button

3. **URL Structure**
   - Funnel view: `/[portfolioCode]/[productCode]/ideas/funnel`
   - List view: `/[portfolioCode]/[productCode]/ideas`
   - Detail view: `/[portfolioCode]/[productCode]/ideas/[ideaNumber]`

### Technical Requirements

1. **Referrer Tracking**
   - Use query parameter to track source view
   - Example: `/ideas/5?from=funnel` or `/ideas/5?from=list`
   - Fallback to list view if no referrer specified

2. **Link Updates**
   - Update funnel view card links to include `?from=funnel` parameter
   - Update list view links to include `?from=list` parameter (optional, since it's the default)
   - Back button reads query parameter and navigates accordingly

3. **Browser History**
   - Works with browser back/forward buttons
   - Maintains proper navigation stack

## Implementation Plan

### Files to Modify

1. **src/app/[portfolioCode]/[productCode]/ideas/funnel/page.tsx**
   - Update idea card links to include `?from=funnel` query parameter
   - Change from: `href={basePath}/${idea.ideaNumber}`
   - To: `href={basePath}/${idea.ideaNumber}?from=funnel`

2. **src/app/[portfolioCode]/[productCode]/ideas/[ideaNumber]/page.tsx**
   - Read `searchParams.from` to determine return view
   - Update "Back to Ideas" link based on referrer
   - If `from=funnel`, navigate to funnel view
   - If `from=list` or no parameter, navigate to list view

3. **cypress/e2e/ideas.cy.ts** or **cypress/e2e/funnel.cy.ts**
   - Add test for navigation from funnel view
   - Verify back button returns to funnel
   - Add test for navigation from list view
   - Verify back button returns to list

## Test Cases

### Cypress E2E Tests

**Test 1: Back from Funnel Returns to Funnel**
```typescript
it("navigates back to funnel view when coming from funnel", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);

  // Click first idea card in funnel
  cy.get('[data-testid="idea-card"]').first().click();

  // Should be on detail page
  cy.url().should("include", `${TEST_IDEAS_PATH}/`);
  cy.url().should("include", "from=funnel");

  // Click back button
  cy.get('[data-testid="back-to-ideas"]').click();

  // Should return to funnel view
  cy.url().should("include", "/funnel");
  cy.contains("Idea Funnel").should("be.visible");
});
```

**Test 2: Back from List Returns to List**
```typescript
it("navigates back to list view when coming from list", () => {
  cy.visit(TEST_IDEAS_PATH);

  // Click first idea in list
  cy.get('[data-testid="idea-name"] a').first().click();

  // Should be on detail page
  cy.url().should("include", `${TEST_IDEAS_PATH}/`);

  // Click back button
  cy.get('[data-testid="back-to-ideas"]').click();

  // Should return to list view (not funnel)
  cy.url().should("not.include", "/funnel");
  cy.contains("Idea Backlog").should("be.visible");
  cy.get('[data-testid="ideas-list"]').should("exist");
});
```

**Test 3: Default Behavior Without Referrer**
```typescript
it("defaults to list view when no referrer specified", () => {
  // Visit detail page directly without referrer
  cy.visit(TEST_IDEAS_PATH);
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-number"]').invoke("text").as("ideaNumber");
  });

  cy.get("@ideaNumber").then((ideaNumber) => {
    cy.visit(`${TEST_IDEAS_PATH}/${ideaNumber}`);

    // Click back button
    cy.get('[data-testid="back-to-ideas"]').click();

    // Should default to list view
    cy.url().should("not.include", "/funnel");
    cy.contains("Idea Backlog").should("be.visible");
  });
});
```

**Test 4: Browser Back Button Works**
```typescript
it("browser back button returns to correct view", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);

  // Click idea card
  cy.get('[data-testid="idea-card"]').first().click();
  cy.url().should("include", "from=funnel");

  // Use browser back
  cy.go("back");

  // Should be back at funnel
  cy.url().should("include", "/funnel");
  cy.contains("Idea Funnel").should("be.visible");
});
```

## Implementation Details

### Query Parameter Approach

**Pros:**
- Simple to implement
- Works with direct URLs
- Easy to test
- No additional state management needed
- SEO friendly (same canonical URL for idea)

**Cons:**
- Slightly longer URLs
- Requires updating all links

### Alternative: Session Storage

**Not recommended** because:
- Doesn't work with direct URLs
- More complex
- Can have stale data
- Not shareable

### Alternative: Referrer Header

**Not recommended** because:
- Not reliable (can be blocked)
- Doesn't work with direct navigation
- Hard to test

## Code Changes

### Funnel View Card Link
```tsx
// Before
<Link href={`${basePath}/${idea.ideaNumber}`}>

// After
<Link href={`${basePath}/${idea.ideaNumber}?from=funnel`}>
```

### Idea Detail Back Button
```tsx
// Before
<Link href={basePath} data-testid="back-to-ideas">
  ← Back to Ideas
</Link>

// After
const backPath = searchParams.from === "funnel"
  ? `${basePath}/funnel`
  : basePath;

<Link href={backPath} data-testid="back-to-ideas">
  ← Back to Ideas
</Link>
```

## Future Enhancements

1. **Remember View Preference**
   - Use localStorage to remember user's preferred view
   - Auto-redirect to preferred view

2. **Breadcrumb Navigation**
   - Show full navigation path
   - Allow jumping to any level

3. **View Toggle on Detail Page**
   - Switch between views without going back
   - Quick access to both representations

## Notes

- This is a UX improvement that respects user navigation context
- Simple implementation with query parameters
- No breaking changes to existing functionality
- Works seamlessly with both views
- Easy to extend to additional views in the future
