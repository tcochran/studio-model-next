# Spec 11: Idea Age Column

**Status:** Complete
**Created:** 2025-12-01

## Overview

Add an Age column to the ideas list table that displays how old each idea is in a human-readable format (e.g., "2 days ago", "1 week ago").

## Requirements

### Functional Requirements

1. **Age Column**
   - Add new "Age" column to ideas table
   - Display relative time since idea creation
   - Format examples: "just now", "5 minutes ago", "2 hours ago", "3 days ago", "1 week ago", "2 months ago"

2. **Column Placement**
   - Position Age column after Validation Status column
   - Or as the last column before any action buttons

3. **Time Formatting**
   - Use relative time format for recent items
   - Gracefully handle edge cases (future dates, very old dates)

### Technical Requirements

1. **Date Formatting**
   - Use `createdAt` timestamp from Idea model
   - Calculate relative time on client side for real-time updates
   - Or calculate on server side for consistency

2. **Formatting Logic**
   - Less than 1 minute: "just now"
   - Less than 1 hour: "X minutes ago"
   - Less than 24 hours: "X hours ago"
   - Less than 7 days: "X days ago"
   - Less than 30 days: "X weeks ago"
   - Otherwise: "X months ago" or formatted date

## Implementation Plan

### Files to Modify

1. **src/app/IdeasList.tsx**
   - Add Age column header
   - Add Age cell with formatted date
   - Create or use date formatting utility

2. **src/app/page.tsx**
   - Ensure createdAt is passed to IdeasList (already done)

3. **cypress/e2e/ideas.cy.ts**
   - Add test for Age column visibility
   - Add test for Age column content format

### Optional: Utility Function

Create a utility function for formatting relative time:

```typescript
// src/utils/formatRelativeTime.ts
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
}
```

## Test Cases

### Cypress E2E Tests

**Test 1: Age Column Header Exists**
```typescript
it("displays Age column header", () => {
  cy.visit("/");
  cy.get('[data-testid="ideas-list"]').should("exist");
  cy.contains("th", "Age").should("be.visible");
});
```

**Test 2: Age Column Shows Data**
```typescript
it("displays age for each idea", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-age"]').should("exist");
    cy.get('[data-testid="idea-age"]').invoke("text").should("match", /(just now|minutes? ago|hours? ago|days? ago|weeks? ago|months? ago)/);
  });
});
```

**Test 3: Age Format is Readable**
```typescript
it("shows age in human-readable format", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-age"]').first().invoke("text").then((text) => {
    expect(text).to.match(/(just now|\d+ (minute|hour|day|week|month)s? ago)/);
  });
});
```

## UI Design

### Updated Table Layout

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Name          │ Hypothesis      │ Status        │ Age                          │
├────────────────────────────────────────────────────────────────────────────────┤
│ My Idea       │ We believe...   │ First Level   │ 2 days ago                   │
│ Another Idea  │ If we...        │ Scaling       │ 1 week ago                   │
│ New Idea      │ Users want...   │ Second Level  │ just now                     │
└────────────────────────────────────────────────────────────────────────────────┘
```

### Column Styling

- Text color: muted/secondary (zinc-500 or similar)
- Align: left or right
- Width: auto, compact

## Architecture Decisions

### Client vs Server Formatting

**Decision:** Format on client side

**Rationale:**
- Allows real-time updates without refresh
- Avoids timezone issues
- Server already provides ISO timestamp

### Singular vs Plural Handling

**Decision:** Handle singular/plural properly

**Examples:**
- "1 day ago" (not "1 days ago")
- "2 days ago"
- "1 hour ago"
- "5 hours ago"

## Notes

- The `createdAt` field already exists in the Idea model
- Consider using a library like `date-fns` or `dayjs` for robust date formatting
- For simplicity, inline formatting function is acceptable
