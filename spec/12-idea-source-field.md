# Spec 12: Idea Source Field

**Status:** Complete
**Created:** 2025-12-01

## Overview

Add a `source` field to ideas to track where each idea originated from. This helps categorize and analyze ideas by their origin.

## Requirements

### Functional Requirements

1. **Source Field**
   - Add source field to idea creation form
   - Display source in ideas list table
   - Display source on idea detail page
   - Source is optional (can be left unset)

2. **Source Options (Enum)**
   - `customerFeedback` - "Customer Feedback"
   - `teamBrainstorm` - "Team Brainstorm"
   - `competitorAnalysis` - "Competitor Analysis"
   - `userResearch` - "User Research"
   - `marketTrend` - "Market Trend"
   - `internalRequest` - "Internal Request"
   - `other` - "Other"

3. **Filter by Source**
   - Add source filter dropdown to ideas list
   - Filter ideas by selected source

### Technical Requirements

1. **Schema Update**
   - Add `source` field to Idea model as enum
   - Field is optional (nullable)
   - Add GSI for filtering by source

2. **Form Update**
   - Add source dropdown to new idea form
   - Include "Select source..." placeholder option

3. **Display**
   - Show source as badge/tag in ideas list
   - Show source on detail page

## Implementation Plan

### Files to Modify

1. **amplify/data/resource.ts**
   - Add `source` field as enum type
   - Add GSI for source field

2. **src/app/ideas/new/page.tsx**
   - Add source dropdown to form
   - Handle source in form submission

3. **src/app/IdeasList.tsx**
   - Add Source column to table
   - Display source badge with appropriate styling
   - Add source filter dropdown

4. **src/app/ideas/[id]/page.tsx**
   - Display source on detail page

5. **src/app/page.tsx**
   - Add source filtering logic
   - Pass source data to IdeasList

### Test Files to Update

1. **cypress/e2e/ideas.cy.ts**
   - Test source column visibility
   - Test source filter dropdown

2. **cypress/e2e/ideas-form.cy.ts**
   - Test source field in form
   - Test form submission with source

3. **cypress/e2e/idea-detail.cy.ts**
   - Test source display on detail page

## Test Cases

### Cypress E2E Tests

**Test 1: Source Dropdown in Form**
```typescript
it("displays source dropdown in new idea form", () => {
  cy.visit("/ideas/new");
  cy.get('[data-testid="source-select"]').should("exist");
});
```

**Test 2: Source Options Available**
```typescript
it("has all source options", () => {
  cy.visit("/ideas/new");
  cy.get('[data-testid="source-select"]').select("customerFeedback");
  cy.get('[data-testid="source-select"]').should("have.value", "customerFeedback");
  cy.get('[data-testid="source-select"]').select("teamBrainstorm");
  cy.get('[data-testid="source-select"]').should("have.value", "teamBrainstorm");
});
```

**Test 3: Source Column in List**
```typescript
it("displays Source column header", () => {
  cy.visit("/");
  cy.contains("th", "Source").should("be.visible");
});
```

**Test 4: Source Filter Dropdown**
```typescript
it("has source filter dropdown", () => {
  cy.visit("/");
  cy.get('[data-testid="source-filter"]').should("exist");
});
```

**Test 5: Filter by Source**
```typescript
it("filters ideas by source", () => {
  cy.visit("/?source=customerFeedback");
  cy.get('[data-testid="idea-item"]').each(($item) => {
    cy.wrap($item).find('[data-testid="idea-source"]').should("contain", "Customer Feedback");
  });
});
```

**Test 6: Source on Detail Page**
```typescript
it("displays source on detail page", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().within(() => {
    cy.get('[data-testid="idea-name"] a').click();
  });
  cy.get('[data-testid="idea-detail-source"]').should("exist");
});
```

## UI Design

### Form Dropdown

```
Source (optional)
┌─────────────────────────────┐
│ Select source...          ▼ │
├─────────────────────────────┤
│ Customer Feedback           │
│ Team Brainstorm             │
│ Competitor Analysis         │
│ User Research               │
│ Market Trend                │
│ Internal Request            │
│ Other                       │
└─────────────────────────────┘
```

### Table with Source Column

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Name          │ Hypothesis      │ Status        │ Source                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ My Idea       │ We believe...   │ First Level   │ Customer Feedback              │
│ Another Idea  │ If we...        │ Scaling       │ Team Brainstorm                │
│ New Idea      │ Users want...   │ Second Level  │ -                              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Source Badge Styling

Different colors for each source type:
- Customer Feedback: Blue
- Team Brainstorm: Purple
- Competitor Analysis: Orange
- User Research: Green
- Market Trend: Teal
- Internal Request: Gray
- Other: Default gray

## Schema Definition

```typescript
// In amplify/data/resource.ts
const schema = a.schema({
  Idea: a
    .model({
      name: a.string().required(),
      hypothesis: a.string().required(),
      validationStatus: a.string(),
      source: a.enum(['customerFeedback', 'teamBrainstorm', 'competitorAnalysis', 'userResearch', 'marketTrend', 'internalRequest', 'other']),
    })
    .authorization((allow) => [allow.publicApiKey()])
    .secondaryIndexes((index) => [
      index('name'),
      index('validationStatus'),
      index('source'),
    ]),
});
```

## Notes

- Source field is optional to maintain backward compatibility with existing ideas
- Consider adding "Unknown" display for ideas without a source
- Badge colors should be consistent with existing status badge styling
- Filter can combine with existing sort and validation status filter
