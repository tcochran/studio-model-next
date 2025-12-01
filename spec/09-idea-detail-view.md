# Spec 09: Idea Detail View

**Status:** Complete
**Created:** 2025-12-01

## Overview

Create a detail page for viewing the full details of an individual idea. Users can click on an idea name from the ideas list to view the complete information.

## Requirements

### Functional Requirements

1. **Navigation**
   - Make idea names clickable in the ideas list table
   - Clicking an idea name navigates to `/ideas/[id]`
   - URL structure: `/ideas/{ideaId}`

2. **Detail Page Display**
   - Show full idea name as page heading
   - Display complete hypothesis text with preserved line breaks
   - Show validation status with colored badge
   - Display creation date in readable format
   - Include "Back to Ideas" link to return to main list

3. **Content Display**
   - Name: Large heading (h1)
   - Hypothesis: Full text with all line breaks preserved
   - Validation Status: Colored badge matching list view
   - Created: Formatted date (e.g., "December 1, 2025")

4. **Error Handling**
   - Show error message if idea not found
   - Provide "Back to Ideas" link on error page

### Technical Requirements

1. **Dynamic Route**
   - Create `/src/app/ideas/[id]/page.tsx`
   - Use Next.js 15 dynamic route with Server Component
   - Extract `id` from params

2. **Data Fetching**
   - Use `cookiesClient.models.Idea.get({ id })`
   - Server-side data fetching in Server Component
   - Handle loading and error states

3. **Styling**
   - Match existing dark mode theme
   - Responsive design
   - Proper typography hierarchy
   - Preserve whitespace/line breaks in hypothesis using `whitespace-pre-wrap`

4. **Links**
   - Clickable idea names in IdeasList.tsx using Next.js Link
   - Back navigation link on detail page

## Implementation Plan

### Files to Create

1. **src/app/ideas/[id]/page.tsx**
   - Server Component for idea detail view
   - Extract id from params: `params.id`
   - Fetch idea: `await cookiesClient.models.Idea.get({ id: params.id })`
   - Render idea details or error state
   - Format createdAt date for display

### Files to Modify

1. **src/app/IdeasList.tsx**
   - Import Next.js Link component
   - Wrap idea name in Link component
   - Link to `/ideas/${idea.id}`
   - Style link for proper hover/visited states

2. **cypress/e2e/ideas.cy.ts**
   - Add test for clickable idea names
   - Test navigation to detail page
   - Test detail page displays correct data
   - Test back navigation

### New Test File

1. **cypress/e2e/idea-detail.cy.ts**
   - Test detail page loads with valid ID
   - Test all fields displayed correctly
   - Test hypothesis preserves line breaks
   - Test back link works
   - Test invalid ID shows error

## Test Cases

### Cypress E2E Tests

**Test 1: Idea Name is Clickable**
```typescript
it("makes idea names clickable links", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').should("exist");
  });
});
```

**Test 2: Navigate to Detail Page**
```typescript
it("navigates to detail page when clicking idea name", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.url().should("include", "/ideas/");
});
```

**Test 3: Detail Page Displays Data**
```typescript
it("displays idea details on detail page", () => {
  cy.visit("/");
  let ideaName: string;
  let ideaHypothesis: string;

  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"]').invoke("text").then((text) => {
      ideaName = text;
    });
    cy.get('[data-testid="idea-hypothesis"]').invoke("text").then((text) => {
      ideaHypothesis = text.substring(0, 50); // First 50 chars
    });
    cy.get('[data-testid="idea-name"] a').click();
  });

  cy.get('[data-testid="idea-detail-name"]').should("contain", ideaName);
  cy.get('[data-testid="idea-detail-hypothesis"]').should("contain", ideaHypothesis);
  cy.get('[data-testid="idea-detail-status"]').should("exist");
  cy.get('[data-testid="idea-detail-created"]').should("exist");
});
```

**Test 4: Hypothesis Preserves Line Breaks**
```typescript
it("preserves line breaks in hypothesis on detail page", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });

  cy.get('[data-testid="idea-detail-hypothesis"]')
    .should("have.css", "white-space", "pre-wrap");
});
```

**Test 5: Back Navigation**
```typescript
it("navigates back to ideas list", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });

  cy.get('[data-testid="back-to-ideas"]').click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
});
```

**Test 6: Invalid ID Shows Error**
```typescript
it("shows error for invalid idea ID", () => {
  cy.visit("/ideas/invalid-id-123");
  cy.contains("Idea not found").should("be.visible");
  cy.get('[data-testid="back-to-ideas"]').should("exist");
});
```

## UI Design

### Detail Page Layout

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Ideas                                     │
│                                                       │
│  Idea Name (Large H1)                                │
│                                                       │
│  Validation Status: [Badge]                          │
│  Created: December 1, 2025                           │
│                                                       │
│  Hypothesis:                                          │
│  ┌───────────────────────────────────────────────┐  │
│  │ Full hypothesis text with                      │  │
│  │ preserved line breaks                           │  │
│  │ and all content visible                         │  │
│  │                                                  │  │
│  │ Multiple paragraphs...                           │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Link Styling in Ideas List

- Idea names styled as links (blue/underline on hover)
- Cursor changes to pointer on hover
- Visited links use distinct color
- Maintains accessibility (keyboard navigation, screen readers)

## Architecture Decisions

### Server Component for Detail Page

**Decision:** Use Server Component for idea detail page

**Rationale:**
- Fetch data server-side for better performance
- SEO friendly (pre-rendered content)
- No client-side JavaScript needed for data fetching
- Simpler error handling

### URL Structure

**Decision:** Use `/ideas/[id]` route structure

**Rationale:**
- RESTful URL pattern
- Bookmarkable/shareable links
- Clear hierarchy (collection → item)
- Follows Next.js conventions

### Date Formatting

**Decision:** Format date on server, display human-readable format

**Implementation:**
```typescript
new Date(idea.createdAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
```

## Future Enhancements

1. **Edit Functionality**
   - Add "Edit" button on detail page
   - Navigate to `/ideas/[id]/edit`

2. **Delete Functionality**
   - Add "Delete" button with confirmation
   - Redirect to list after deletion

3. **Related Ideas**
   - Show other ideas with same validation status
   - Breadcrumb navigation

4. **Share Functionality**
   - Copy link button
   - Social media sharing

## Notes

- TDD approach: Tests written before implementation
- Use existing color scheme for consistency
- Preserve line breaks important for readability
- Back navigation improves UX
