# Spec 26: Idea Edit

**Status:** Not Started
**Created:** 2025-12-01

## Overview

Allow users to edit existing ideas. Users can navigate to an edit form from the idea detail view, update any fields, and save changes. This addresses the customer need to modify ideas after they've been created.

## Requirements

### Functional Requirements

1. **Edit Button on Detail Page**
   - Add "Edit" button to idea detail view
   - Button navigates to edit form
   - URL structure: `/[portfolioCode]/[productCode]/ideas/[id]/edit`

2. **Edit Form Display**
   - Pre-populate all fields with current idea data
   - Allow editing of:
     - Name
     - Hypothesis
     - Validation Status
     - Source
   - Match styling of the "new idea" form

3. **Form Validation**
   - Name: Required, minimum 3 characters
   - Hypothesis: Required, minimum 10 characters
   - Validation Status: Required, must be valid enum value
   - Source: Required, must be valid enum value

4. **Save Functionality**
   - Update idea in database with modified values
   - Preserve original creation timestamp
   - Update `updatedAt` timestamp
   - Show success message after save
   - Redirect to detail view after successful save

5. **Cancel Action**
   - "Cancel" button returns to detail view without saving
   - No confirmation needed if no changes made
   - Optional: Confirm navigation if form has unsaved changes

6. **Error Handling**
   - Show validation errors inline on form
   - Handle update failures gracefully
   - Preserve form data on error
   - Show error message for invalid idea ID

### Technical Requirements

1. **Dynamic Route**
   - Create `/src/app/[portfolioCode]/[productCode]/ideas/[id]/edit/page.tsx`
   - Use Next.js 15 dynamic route with Server Component for initial load
   - Client Component for form interactivity

2. **Data Fetching**
   - Fetch idea: `cookiesClient.models.Idea.get({ id })`
   - Pre-populate form with fetched data
   - Handle case where idea doesn't exist

3. **Data Mutation**
   - Use `cookiesClient.models.Idea.update({ id, ...data })`
   - Validate data before submission
   - Handle optimistic updates (optional)

4. **Form State Management**
   - Track form changes for dirty state
   - Manage validation errors
   - Handle loading states during save

5. **Styling**
   - Match existing dark mode theme
   - Reuse form components from "new idea" form
   - Responsive design
   - Clear visual feedback for actions

## Implementation Plan

### Files to Create

1. **src/app/[portfolioCode]/[productCode]/ideas/[id]/edit/page.tsx**
   - Server Component wrapper to fetch initial data
   - Pass data to client component for editing
   - Handle not found case

2. **src/app/[portfolioCode]/[productCode]/ideas/[id]/edit/IdeaEditForm.tsx** (optional)
   - Client Component for form interactivity
   - Or reuse/extend existing IdeaForm component
   - Handle form submission and validation

### Files to Modify

1. **src/app/[portfolioCode]/[productCode]/ideas/[id]/page.tsx**
   - Add "Edit" button to detail view
   - Link to edit page: `/[portfolioCode]/[productCode]/ideas/${idea.id}/edit`
   - Style button consistently with other actions

2. **amplify/data/resource.ts** (verify permissions)
   - Ensure Idea model allows updates
   - Check authorization rules permit editing

3. **cypress/e2e/ideas.cy.ts**
   - Add tests for edit functionality
   - Test form pre-population
   - Test successful updates
   - Test validation errors
   - Test cancel action

## Test Cases

### Cypress E2E Tests

**Test 1: Edit Button Exists**
```typescript
it("shows edit button on idea detail page", () => {
  cy.visit("/routeburn/product-flow/ideas");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.get('[data-testid="edit-idea-button"]').should("exist");
});
```

**Test 2: Navigate to Edit Form**
```typescript
it("navigates to edit form when clicking edit button", () => {
  cy.visit("/routeburn/product-flow/ideas");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.get('[data-testid="edit-idea-button"]').click();
  cy.url().should("include", "/edit");
});
```

**Test 3: Form Pre-populated**
```typescript
it("pre-populates form with existing idea data", () => {
  cy.visit("/routeburn/product-flow/ideas");
  let ideaName: string;
  let ideaHypothesis: string;

  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"]').invoke("text").then((text) => {
      ideaName = text;
    });
    cy.get('[data-testid="idea-hypothesis"]').invoke("text").then((text) => {
      ideaHypothesis = text.substring(0, 50);
    });
    cy.get('[data-testid="idea-name"] a').click();
  });

  cy.get('[data-testid="edit-idea-button"]').click();

  cy.get('input[name="name"]').should("have.value", ideaName);
  cy.get('textarea[name="hypothesis"]').should("contain.value", ideaHypothesis);
  cy.get('select[name="validationStatus"]').should("not.have.value", "");
  cy.get('select[name="source"]').should("not.have.value", "");
});
```

**Test 4: Update Idea Successfully**
```typescript
it("updates idea and shows updated data", () => {
  const updatedName = "Updated Idea Name " + Date.now();
  const updatedHypothesis = "This is an updated hypothesis for testing.";

  cy.visit("/routeburn/product-flow/ideas");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.get('[data-testid="edit-idea-button"]').click();

  cy.get('input[name="name"]').clear().type(updatedName);
  cy.get('textarea[name="hypothesis"]').clear().type(updatedHypothesis);
  cy.get('select[name="validationStatus"]').select("secondLevel");

  cy.get('button[type="submit"]').click();

  cy.url().should("not.include", "/edit");
  cy.get('[data-testid="idea-detail-name"]').should("contain", updatedName);
  cy.get('[data-testid="idea-detail-hypothesis"]').should("contain", updatedHypothesis);
  cy.get('[data-testid="idea-detail-status"]').should("contain", "Second Level");
});
```

**Test 5: Validation Errors Displayed**
```typescript
it("shows validation errors for invalid data", () => {
  cy.visit("/routeburn/product-flow/ideas");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.get('[data-testid="edit-idea-button"]').click();

  cy.get('input[name="name"]').clear();
  cy.get('textarea[name="hypothesis"]').clear();

  cy.get('button[type="submit"]').click();

  cy.contains("Name is required").should("be.visible");
  cy.contains("Hypothesis is required").should("be.visible");
  cy.url().should("include", "/edit");
});
```

**Test 6: Cancel Returns to Detail View**
```typescript
it("cancels edit and returns to detail view", () => {
  cy.visit("/routeburn/product-flow/ideas");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });

  let originalUrl: string;
  cy.url().then((url) => {
    originalUrl = url;
  });

  cy.get('[data-testid="edit-idea-button"]').click();
  cy.get('input[name="name"]').type(" Some Changes");

  cy.get('[data-testid="cancel-button"]').click();

  cy.url().should((url) => {
    expect(url).to.equal(originalUrl);
  });
});
```

**Test 7: Invalid ID Shows Error**
```typescript
it("shows error for invalid idea ID on edit page", () => {
  cy.visit("/routeburn/product-flow/ideas/invalid-id-123/edit");
  cy.contains("Idea not found").should("be.visible");
  cy.get('[data-testid="back-to-ideas"]').should("exist");
});
```

## UI Design

### Edit Button on Detail Page

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Ideas                    [Edit Button]    │
│                                                       │
│  Idea Name (Large H1)                                │
│  ...                                                  │
└─────────────────────────────────────────────────────┘
```

### Edit Form Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Idea                                      │
│                                                       │
│  Edit Idea                                           │
│                                                       │
│  Name *                                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ [Pre-populated idea name]                      │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  Hypothesis *                                        │
│  ┌────────────────────────────────────────────────┐ │
│  │ [Pre-populated hypothesis text]                │ │
│  │                                                 │ │
│  │                                                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  Validation Status *                                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ [Selected: Current status]            ▼       │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  Source *                                            │
│  ┌────────────────────────────────────────────────┐ │
│  │ [Selected: Current source]            ▼       │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  [Cancel]  [Save Changes]                           │
└─────────────────────────────────────────────────────┘
```

## Architecture Decisions

### Component Reuse vs New Components

**Decision:** Create new edit page but consider extracting shared form logic

**Options:**
1. Create completely new edit form component
2. Reuse existing IdeaForm with `mode` prop (create/edit)
3. Extract shared form fields into reusable components

**Recommendation:** Start with option 1 for simplicity, refactor to option 2 or 3 if duplication becomes problematic.

### Server Component + Client Component Pattern

**Decision:** Use Server Component for data fetching, Client Component for form

**Rationale:**
- Server Component fetches initial data efficiently
- Client Component handles form interactivity and state
- Separates data loading from UI interactions
- Better performance and user experience

### Update Strategy

**Decision:** Direct update without optimistic UI

**Rationale:**
- Simpler implementation for MVP
- Clear feedback on success/failure
- Can add optimistic updates later if needed

### Dirty State Tracking

**Decision:** Track if form has unsaved changes (optional for MVP)

**Implementation:**
- Compare current form values with original values
- Show warning on navigation if dirty
- Optional for first iteration

## Future Enhancements

1. **Optimistic Updates**
   - Update UI before server confirms
   - Roll back on error
   - Better perceived performance

2. **Audit History**
   - Track all changes to ideas
   - Show edit history on detail page
   - Who changed what and when

3. **Inline Editing**
   - Edit fields directly on detail page
   - No separate edit form needed
   - Save individual fields

4. **Collaborative Editing**
   - Show when someone else is editing
   - Prevent conflicting edits
   - Real-time updates

5. **Bulk Edit**
   - Select multiple ideas
   - Update common fields at once
   - Useful for changing validation status

6. **Edit Permissions**
   - Only idea creator can edit
   - Or team members with permissions
   - Admin can edit all ideas

## Notes

- TDD approach: Write tests before implementation
- Preserve `createdAt` timestamp during updates
- Update `updatedAt` automatically
- Consider form validation library (e.g., React Hook Form, Zod)
- Match styling and UX of "new idea" form
- Handle concurrent edits gracefully (optional for MVP)
