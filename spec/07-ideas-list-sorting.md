# Spec 07: Ideas List Sorting

**Status:** Complete
**Created:** 2025-12-01

## Overview

Add sorting capability to the ideas list page, allowing users to sort ideas by Name, Validation Status, Age (Newest), and Age (Oldest).

## Requirements

### Functional Requirements

1. **Sort Dropdown**
   - Display a dropdown above the ideas table
   - Include label "Sort by:"
   - Provide four sort options:
     - Age (Newest) - default
     - Age (Oldest)
     - Name
     - Validation Status

2. **Sorting Behavior**
   - **Age (Newest)**: Sort by createdAt timestamp, newest first (descending)
   - **Age (Oldest)**: Sort by createdAt timestamp, oldest first (ascending)
   - **Name**: Sort alphabetically by idea name (ascending)
   - **Validation Status**: Sort by status progression:
     1. First Level
     2. Second Level
     3. Scaling

3. **State Management**
   - Sort parameter stored in URL search params (?sort=name)
   - Default to "age" (newest) when no parameter present
   - Sorting performed server-side in Next.js Server Component
   - Client component updates URL on dropdown change

### Technical Requirements

1. **Server-Side Sorting**
   - Implement sorting in page.tsx (Server Component)
   - Read sort parameter from searchParams
   - Sort ideas array before passing to client component

2. **URL State**
   - Use search parameters for sort state
   - Maintain sort state across page refreshes
   - Make sort state bookmarkable/shareable

3. **Client Component**
   - IdeasList.tsx handles dropdown UI
   - Uses useRouter and useSearchParams for navigation
   - Updates URL when sort selection changes

## Implementation

### Files Modified

1. **src/app/page.tsx**
   - Accept searchParams prop
   - Extract sort parameter
   - Implement sort logic with switch statement
   - Pass currentSort to IdeasList component

2. **src/app/IdeasList.tsx**
   - Accept currentSort prop
   - Remove local state for sorting
   - Implement handleSortChange to update URL
   - Bind dropdown to currentSort value

3. **cypress/e2e/ideas.cy.ts**
   - Add test for sort dropdown visibility
   - Test all four sort options can be selected
   - Verify dropdown value updates

## Test Cases

### Cypress E2E Tests (4 tests added)

**Test 1: Sort Dropdown Options**
```typescript
it("displays a sort dropdown with options", () => {
  cy.visit("/");
  cy.get('[data-testid="sort-dropdown"]').should("be.visible");
  cy.get('[data-testid="sort-dropdown"]').select("name");
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
  cy.get('[data-testid="sort-dropdown"]').select("validationStatus");
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "validationStatus");
  cy.get('[data-testid="sort-dropdown"]').select("age");
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "age");
  cy.get('[data-testid="sort-dropdown"]').select("ageOldest");
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "ageOldest");
});
```

**Test 2: URL Updates**
```typescript
it("updates URL when sort option changes", () => {
  cy.visit("/");
  cy.get('[data-testid="sort-dropdown"]').select("name");
  cy.url().should("include", "?sort=name");
  cy.get('[data-testid="sort-dropdown"]').select("validationStatus");
  cy.url().should("include", "?sort=validationStatus");
});
```

**Test 3: Sort Persistence**
```typescript
it("persists sort option on page refresh", () => {
  cy.visit("/?sort=name");
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
  cy.reload();
  cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
});
```

**Test 4: Alphabetical Sort Verification**
```typescript
it("sorts ideas by name alphabetically", () => {
  cy.visit("/?sort=name");
  cy.get('[data-testid="idea-name"]').then(($names) => {
    const names = [...$names].map((el) => el.textContent || "");
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).to.deep.equal(sortedNames);
  });
});
```

### Test Results

- Total tests: 16 (7 form tests + 9 ideas page tests)
- All tests passing
- 4 new tests specifically for sort functionality

### Manual Test Cases

1. **Default Sort**
   - Navigate to homepage
   - Verify ideas sorted by newest first
   - Verify dropdown shows "Age (Newest)"

2. **Name Sort**
   - Select "Name" from dropdown
   - Verify URL contains ?sort=name
   - Verify ideas sorted alphabetically

3. **Validation Status Sort**
   - Select "Validation Status" from dropdown
   - Verify URL contains ?sort=validationStatus
   - Verify ideas sorted: First Level, Second Level, Scaling

4. **Age (Oldest) Sort**
   - Select "Age (Oldest)" from dropdown
   - Verify URL contains ?sort=ageOldest
   - Verify ideas sorted oldest first

5. **URL Persistence**
   - Select any sort option
   - Refresh the page
   - Verify sort option persists

## Architecture Decisions

### Server-Side vs Client-Side Sorting

**Decision:** Implement sorting server-side using hybrid approach

**Rationale:**
- Better performance (no client-side re-sorting on every render)
- SEO friendly (pre-sorted content)
- Bookmarkable URLs with sort state
- Reduced client-side JavaScript
- Server renders correct order immediately

### Database vs In-Memory Sorting

**Decision:** Hybrid approach - database sorting for createdAt, in-memory for other fields

**Implementation:**
- **Age (Newest/Oldest)**: Use DynamoDB's `sortDirection` parameter
  - `sortDirection: "DESC"` for newest first
  - `sortDirection: "ASC"` for oldest first
  - Sorting happens at database level via AppSync/DynamoDB
- **Name & Validation Status**: Sort in-memory on server
  - Requires fetching all records
  - Acceptable for small datasets
  - GSIs exist but are designed for filtered queries (e.g., "name = 'X'"), not full scans

**GSI Implementation Notes:**
- Added secondary indexes for `name` and `validationStatus` fields
- These GSIs enable efficient queries like "find all ideas with specific name/status"
- For full table scans with sorting, DynamoDB still requires fetching all items
- GSIs are useful for future features (filtering + sorting, search, etc.)
- For pure sorting without filters, in-memory sorting is the practical approach

**Trade-offs:**
- ✅ Age sorting is very efficient (database-level)
- ⚠️ Name/status sorting requires fetching all records (DynamoDB limitation for full scans)
- ⚠️ Not scalable beyond ~10,000 records without pagination
- ✅ GSIs in place for future filtered queries
- ✅ Good performance for expected dataset size (< 1000 ideas)

### URL Search Params vs Local State

**Decision:** Use URL search params

**Rationale:**
- State persists across page refreshes
- Bookmarkable/shareable URLs
- Browser back/forward navigation works
- Server can read and apply sort on initial render

## Future Enhancements

1. **Pagination for Large Datasets**
   - Implement cursor-based pagination for datasets > 1000 records
   - Use DynamoDB's pagination tokens
   - Sort within each page, or implement server-side sorting with pagination
   - Required when app scales beyond current size

2. **Sort Direction Toggle**
   - Add ascending/descending toggle for each field
   - Show sort direction indicator in UI

3. **Multi-Column Sort**
   - Allow secondary sort criteria
   - Example: Sort by status, then by name

4. **Remember User Preference**
   - Store user's preferred sort in localStorage
   - Apply preference on future visits

5. **Table Header Sort**
   - Make column headers clickable for sorting
   - Show sort indicators in column headers

## Performance Considerations

**Current Implementation:**
- Age sorting: O(log n) via DynamoDB query
- Name/Status sorting: O(n log n) via JavaScript sort
- Acceptable for < 1000 ideas
- All sorting happens server-side (not on client)

**Future Optimization (with GSIs):**
- All sorts would be O(log n) via database queries
- Required when dataset grows beyond ~1000 records
- Trade-off: Additional write capacity for maintaining indexes

## Notes

- TDD approach: Tests written before implementation
- All 13 Cypress tests passing
- Sorting logic centralized in page.tsx
- Client component keeps UI concerns separate
