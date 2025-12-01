# Spec 08: Ideas List Filtering

**Status:** In Progress
**Created:** 2025-12-01

## Overview

Add filtering capability to the ideas list page, allowing users to filter ideas by Validation Status. This feature will work in combination with the existing sorting functionality.

## Requirements

### Functional Requirements

1. **Filter Dropdown**
   - Display a filter dropdown above the ideas table (next to sort dropdown)
   - Include label "Filter by:"
   - Provide filter options:
     - All (default)
     - First Level
     - Second Level
     - Scaling

2. **Filtering Behavior**
   - **All**: Show all ideas (no filter)
   - **First Level**: Show only ideas with validationStatus = "firstLevel"
   - **Second Level**: Show only ideas with validationStatus = "secondLevel"
   - **Scaling**: Show only ideas with validationStatus = "scaling"
   - Filter is applied before sorting
   - Empty state message when no ideas match filter

3. **State Management**
   - Filter parameter stored in URL search params (?filter=firstLevel)
   - Default to "all" when no parameter present
   - Filtering performed server-side using DynamoDB GSI query
   - Client component updates URL on dropdown change
   - Filter and sort work together in URL (?sort=name&filter=firstLevel)

### Technical Requirements

1. **Server-Side Filtering with GSI**
   - Use `listIdeaByValidationStatus` GSI query for filtered requests
   - For "all" filter, use existing list() query
   - Read filter parameter from searchParams
   - Filter ideas before sorting
   - Pass currentFilter to client component

2. **URL State**
   - Use search parameters for filter state
   - Maintain filter state across page refreshes
   - Make filter state bookmarkable/shareable
   - Preserve both sort and filter parameters

3. **Client Component**
   - IdeasList.tsx handles filter dropdown UI
   - Uses useRouter and useSearchParams for navigation
   - Updates URL when filter selection changes
   - Preserves existing sort parameter when changing filter

## Implementation Plan

### Files to Modify

1. **src/app/page.tsx**
   - Extract filter parameter from searchParams
   - Implement filter logic using GSI query
   - Use `cookiesClient.models.Idea.listIdeaByValidationStatus({ validationStatus: "firstLevel" })`
   - Pass currentFilter to IdeasList component
   - Apply sorting after filtering

2. **src/app/IdeasList.tsx**
   - Accept currentFilter prop
   - Add filter dropdown UI next to sort dropdown
   - Implement handleFilterChange to update URL
   - Preserve sort parameter when updating filter
   - Bind dropdown to currentFilter value

3. **cypress/e2e/ideas.cy.ts**
   - Add test for filter dropdown visibility
   - Test all filter options can be selected
   - Test URL updates with filter parameter
   - Test filtering actually filters results
   - Test filter + sort combination works
   - Test empty state when no results match filter

## Test Cases

### Cypress E2E Tests (to be written)

**Test 1: Filter Dropdown Options**
```typescript
it("displays a filter dropdown with options", () => {
  cy.visit("/");
  cy.get('[data-testid="filter-dropdown"]').should("be.visible");
  cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
  cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
  cy.get('[data-testid="filter-dropdown"]').select("secondLevel");
  cy.get('[data-testid="filter-dropdown"]').should("have.value", "secondLevel");
  cy.get('[data-testid="filter-dropdown"]').select("scaling");
  cy.get('[data-testid="filter-dropdown"]').should("have.value", "scaling");
  cy.get('[data-testid="filter-dropdown"]').select("all");
  cy.get('[data-testid="filter-dropdown"]').should("have.value", "all");
});
```

**Test 2: Filter URL Updates**
```typescript
it("updates URL when filter option changes", () => {
  cy.visit("/");
  cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
  cy.url().should("include", "?filter=firstLevel");
  cy.get('[data-testid="filter-dropdown"]').select("secondLevel");
  cy.url().should("include", "?filter=secondLevel");
});
```

**Test 3: Filter Persistence**
```typescript
it("persists filter option on page refresh", () => {
  cy.visit("/?filter=firstLevel");
  cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
  cy.reload();
  cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
});
```

**Test 4: Filter Actually Filters**
```typescript
it("filters ideas by validation status", () => {
  cy.visit("/?filter=firstLevel");
  cy.get('[data-testid="idea-item"]').each(($item) => {
    cy.wrap($item).find('[data-testid="idea-status"]').should("contain", "First Level");
  });
});
```

**Test 5: Filter + Sort Combination**
```typescript
it("preserves sort when changing filter", () => {
  cy.visit("/?sort=name");
  cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
  cy.url().should("include", "sort=name");
  cy.url().should("include", "filter=firstLevel");
});

it("preserves filter when changing sort", () => {
  cy.visit("/?filter=firstLevel");
  cy.get('[data-testid="sort-dropdown"]').select("name");
  cy.url().should("include", "filter=firstLevel");
  cy.url().should("include", "sort=name");
});
```

**Test 6: Empty State**
```typescript
it("shows empty state when no ideas match filter", () => {
  // This test assumes there are no ideas with a specific status
  // Or we could add a test idea first, then filter for a different status
  cy.visit("/?filter=scaling");
  cy.get('[data-testid="no-ideas"]').should("be.visible");
});
```

## Architecture Decisions

### GSI Query for Filtering

**Decision:** Use DynamoDB GSI query `listIdeaByValidationStatus` for filtering

**Rationale:**
- This is the perfect use case for GSIs
- We're querying for specific partition key values (e.g., validationStatus = "firstLevel")
- Much more efficient than fetching all records and filtering in-memory
- Demonstrates proper GSI usage vs. the sorting limitation

**Implementation:**
```typescript
// For filtered queries - use GSI
const result = await cookiesClient.models.Idea.listIdeaByValidationStatus({
  validationStatus: "firstLevel"
});

// For "all" filter - use regular list
const result = await cookiesClient.models.Idea.list();
```

### Filter Before Sort

**Decision:** Apply filter first (at database level), then sort the filtered results

**Rationale:**
- More efficient to sort fewer records
- Database handles filter, we handle sort
- Clear separation of concerns

## Performance Considerations

**Filtering:**
- Filtered queries use GSI - O(log n) lookup
- Much faster than full table scan
- Scales well even with large datasets

**Sorting after filtering:**
- Age sorting: Database-level on filtered results
- Name/Status sorting: In-memory on filtered results
- Smaller dataset to sort after filtering

## Future Enhancements

1. **Multiple Filter Fields**
   - Filter by name (search)
   - Filter by date range
   - Combine multiple filters

2. **Filter Chips**
   - Show active filters as removable chips
   - Quick filter clearing

3. **Filter Count**
   - Show count of items matching filter
   - "Showing 5 of 20 ideas"

## Notes

- TDD approach: Tests written before implementation
- GSI usage demonstrates difference from sorting use case
- Filter + sort combination in URL enables powerful data exploration
- Empty state handling important for UX
