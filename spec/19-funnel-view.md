# Spec 19: Funnel View

**Status:** Complete
**Created:** 2025-12-01
**Completed:** 2025-12-01

## Overview

Create a visual funnel representation of ideas organized by validation status. The funnel displays ideas as cards arranged in three horizontal layers, with more ideas at the top (First Level validation) narrowing down to fewer ideas at the bottom (Scaling). This provides a clear visualization of the product validation pipeline.

## Requirements

### Functional Requirements

1. **Three-Layer Funnel Structure**
   - Top layer: Unvalidated ideas (First Level validation)
   - Middle layer: Partially validated ideas (Second Level validation)
   - Bottom layer: Fully validated ideas (Scaling)
   - Horizontal lines separate each layer

2. **Idea Cards**
   - Each card displays:
     - Idea number
     - Idea name
   - Cards are clickable and navigate to idea detail page
   - Cards use consistent styling with the rest of the app

3. **Layout**
   - Grid layout within each layer
   - Centered alignment
   - Responsive design that adapts to screen size
   - Visual funnel shape (wider at top, narrower at bottom)
   - Graceful handling of empty layers

4. **Navigation**
   - Add "Funnel" link to main navigation
   - Tab or toggle to switch between List view and Funnel view
   - URL: `/[portfolioCode]/[productCode]/ideas/funnel`

5. **Interaction**
   - Clicking a card navigates to idea detail page
   - Hover states on cards
   - Empty state messaging for layers with no ideas

### Technical Requirements

1. **Data Fetching**
   - Query ideas grouped by validation status
   - Use existing Amplify data client
   - Server-side data fetching for initial render

2. **Responsive Grid**
   - Use CSS Grid or Flexbox for card layout
   - Adjust number of columns based on screen size
   - Mobile-friendly stacking

3. **Visual Design**
   - Funnel shape achieved through max-width constraints
   - Top layer: wider (e.g., max-width: 100%)
   - Middle layer: medium (e.g., max-width: 80%)
   - Bottom layer: narrower (e.g., max-width: 60%)
   - Dark mode compatible

4. **Performance**
   - Efficient rendering of potentially many cards
   - Minimal re-renders
   - Fast page load

## Implementation Plan

### Files to Create

1. **src/app/[portfolioCode]/[productCode]/ideas/funnel/page.tsx**
   - Server Component for funnel view
   - Fetch all ideas for the product
   - Group ideas by validation status
   - Pass data to client component for rendering

2. **src/app/[portfolioCode]/[productCode]/ideas/funnel/FunnelView.tsx** (optional)
   - Client Component if interactivity needed
   - Or keep as Server Component if purely presentational

### Files to Modify

1. **src/app/[portfolioCode]/[productCode]/ideas/page.tsx**
   - Add tab/toggle to switch between List and Funnel views
   - Or add a link to the funnel view in navigation

2. **cypress/e2e/ideas.cy.ts**
   - Add new test suite for Funnel View
   - Test navigation to funnel
   - Test card clicks
   - Test layer organization

### New Test File

1. **cypress/e2e/funnel.cy.ts**
   - Test funnel view loads
   - Test three layers are displayed
   - Test ideas are grouped correctly by status
   - Test card navigation works
   - Test empty state handling
   - Test responsive layout

## Test Cases

### Cypress E2E Tests

**Test 1: Navigate to Funnel View**
```typescript
it("navigates to funnel view from ideas page", () => {
  cy.visit(TEST_IDEAS_PATH);
  cy.get('[data-testid="funnel-view-link"]').click();
  cy.url().should("include", "/ideas/funnel");
  cy.contains("Idea Funnel").should("be.visible");
});
```

**Test 2: Display Three Layers**
```typescript
it("displays three funnel layers", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);
  cy.get('[data-testid="funnel-layer-firstLevel"]').should("exist");
  cy.get('[data-testid="funnel-layer-secondLevel"]').should("exist");
  cy.get('[data-testid="funnel-layer-scaling"]').should("exist");
});
```

**Test 3: Ideas Grouped by Status**
```typescript
it("groups ideas correctly by validation status", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);

  // First level should have ideas
  cy.get('[data-testid="funnel-layer-firstLevel"]')
    .find('[data-testid="idea-card"]')
    .should("have.length.at.least", 1);

  // Check that all cards in first level layer are First Level ideas
  cy.get('[data-testid="funnel-layer-firstLevel"]')
    .find('[data-testid="idea-card"]')
    .each(($card) => {
      // Could verify by clicking and checking detail page status
    });
});
```

**Test 4: Card Displays Idea Number and Name**
```typescript
it("displays idea number and name on cards", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);
  cy.get('[data-testid="idea-card"]').first().within(() => {
    cy.get('[data-testid="idea-card-number"]').should("be.visible");
    cy.get('[data-testid="idea-card-name"]').should("be.visible");
  });
});
```

**Test 5: Card Navigation**
```typescript
it("navigates to idea detail when clicking card", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);
  let ideaNumber: string;

  cy.get('[data-testid="idea-card"]').first().within(() => {
    cy.get('[data-testid="idea-card-number"]').invoke("text").then((text) => {
      ideaNumber = text.replace("#", "");
    });
  }).click();

  cy.url().should("include", `${TEST_IDEAS_PATH}/${ideaNumber}`);
});
```

**Test 6: Layer Labels**
```typescript
it("displays layer labels", () => {
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);
  cy.contains("Unvalidated").should("be.visible");
  cy.contains("Partially Validated").should("be.visible");
  cy.contains("Fully Validated").should("be.visible");
});
```

**Test 7: Empty Layer Handling**
```typescript
it("shows message for empty layers", () => {
  // This test would need a product with no scaling ideas
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);

  // Check if any layer is empty and has appropriate message
  cy.get('[data-testid="funnel-layer-scaling"]').then(($layer) => {
    if ($layer.find('[data-testid="idea-card"]').length === 0) {
      cy.wrap($layer).should("contain", "No ideas in this stage");
    }
  });
});
```

**Test 8: Responsive Layout**
```typescript
it("adjusts layout for mobile screens", () => {
  cy.viewport("iphone-x");
  cy.visit(`${TEST_IDEAS_PATH}/funnel`);

  // Check that cards stack appropriately
  cy.get('[data-testid="funnel-layer-firstLevel"]')
    .should("have.css", "max-width");
});
```

## UI Design

### Funnel Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Portfolio / Product                        Idea Backlog     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [List View]  [Funnel View]                                  │
│                                                               │
│  ════════════════════ Unvalidated (12 ideas) ═══════════════ │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │ #1     │  │ #2     │  │ #3     │  │ #4     │    │   │
│  │  │ Idea A │  │ Idea B │  │ Idea C │  │ Idea D │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │ #5     │  │ #6     │  │ #7     │  │ #8     │    │   │
│  │  │ Idea E │  │ Idea F │  │ Idea G │  │ Idea H │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │ #9     │  │ #10    │  │ #11    │  │ #12    │    │   │
│  │  │ Idea I │  │ Idea J │  │ Idea K │  │ Idea L │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ══════════ Partially Validated (7 ideas) ═══════════       │
│    ┌──────────────────────────────────────────────┐         │
│    │  ┌────────┐  ┌────────┐  ┌────────┐         │         │
│    │  │ #13    │  │ #14    │  │ #15    │         │         │
│    │  │ Idea M │  │ Idea N │  │ Idea O │         │         │
│    │  └────────┘  └────────┘  └────────┘         │         │
│    │  ┌────────┐  ┌────────┐  ┌────────┐         │         │
│    │  │ #16    │  │ #17    │  │ #18    │         │         │
│    │  │ Idea P │  │ Idea Q │  │ Idea R │         │         │
│    │  └────────┘  └────────┘  └────────┘         │         │
│    │  ┌────────┐                                  │         │
│    │  │ #19    │                                  │         │
│    │  │ Idea S │                                  │         │
│    │  └────────┘                                  │         │
│    └──────────────────────────────────────────────┘         │
│                                                               │
│  ═══════ Fully Validated (3 ideas) ═══════                  │
│      ┌──────────────────────────────────┐                   │
│      │  ┌────────┐  ┌────────┐          │                   │
│      │  │ #20    │  │ #21    │          │                   │
│      │  │ Idea T │  │ Idea U │          │                   │
│      │  └────────┘  └────────┘          │                   │
│      │  ┌────────┐                      │                   │
│      │  │ #22    │                      │                   │
│      │  │ Idea V │                      │                   │
│      │  └────────┘                      │                   │
│      └──────────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Idea Card Design

```
┌──────────────────┐
│  #12             │  ← Idea number (top left)
│                  │
│  Frontend Init   │  ← Idea name (centered)
│                  │
└──────────────────┘
```

Card styling:
- White background with dark border (dark mode: dark background with lighter border)
- Padding: 16px
- Border radius: 8px
- Hover: slight elevation/shadow
- Cursor: pointer
- Transition on hover

### Layer Styling

- Layer header with horizontal line
- Label shows validation status and count
- Max-width decreases from top to bottom to create funnel shape
- Margins and padding for visual separation
- Grid gap between cards

## Architecture Decisions

### Server Component vs Client Component

**Decision:** Use Server Component for initial render, Client Component if filtering/sorting needed

**Rationale:**
- Ideas data is relatively static
- Server-side rendering for better performance
- Can add client-side interactivity later if needed

### Grid vs Flexbox

**Decision:** Use CSS Grid for card layout

**Rationale:**
- Better control over columns
- Easier to make responsive
- Natural fit for card-based layouts

### Funnel Shape Implementation

**Decision:** Use max-width constraints on each layer container

**Implementation:**
```css
.funnel-layer-first { max-width: 100%; }
.funnel-layer-second { max-width: 80%; }
.funnel-layer-scaling { max-width: 60%; }
```

**Rationale:**
- Simple CSS-based approach
- Responsive
- Easy to adjust proportions

### Navigation Pattern

**Decision:** Add tab toggle between List and Funnel views

**Rationale:**
- Both views show the same data, just different representations
- User can easily switch between views
- Familiar tab pattern
- Could also add a "View" dropdown menu

## Future Enhancements

1. **Drag and Drop**
   - Drag ideas between funnel layers
   - Updates validation status
   - Visual feedback during drag

2. **Filtering**
   - Filter ideas by source
   - Filter by age
   - Search within funnel

3. **Animation**
   - Smooth transitions when ideas move between layers
   - Card flip animation on hover
   - Entrance animations

4. **Card Details**
   - Show more info on hover (hypothesis preview, age, source)
   - Tooltip with quick details
   - Option to expand card

5. **Metrics**
   - Conversion rate between stages
   - Average time in each stage
   - Funnel statistics

6. **Customization**
   - Adjust funnel proportions
   - Different card sizes
   - Toggle card density

7. **Export**
   - Export funnel as image
   - Share funnel view
   - Print-friendly version

## Notes

- This view is read-only (no inline editing)
- Complements the existing list view
- Focus on visual communication of validation pipeline
- Should handle products with many ideas gracefully (pagination or scrolling)
- Consider performance with 100+ ideas per layer
