# Spec 27: Idea Number Column and Expandable Rows

**Status:** Draft
**Created:** 2025-12-01

## Overview

Add a Number column as the first column in the ideas table (displaying the ideaNumber field), and implement expandable rows that allow users to see full idea details inline without navigating away from the list.

## Requirements

### Functional Requirements

1. **Number Column**
   - Add new "#" column as the first column in the ideas table
   - Display the `ideaNumber` field from each idea
   - Column should be narrow and right-aligned
   - Numbers should be displayed plainly (no formatting needed)

2. **Expandable Rows**
   - Clicking anywhere on a table row expands it to show full details
   - Expanded view displays all idea information that would be shown on the detail page
   - Clicking the row again collapses it
   - Only one row can be expanded at a time
   - Visual indicator showing which rows are expanded (e.g., chevron icon, background color change)
   - The Name link should still navigate to the detail page when clicked (don't trigger expansion)

3. **Expanded Content Display**
   - Show all fields from the idea:
     - Full hypothesis (not truncated)
     - Validation status
     - Source
     - Created date
     - Last updated date (if available)
     - Full upvote count
     - Any other metadata
   - Layout should be clean and readable
   - Content should appear between the clicked row and the next row

### Technical Requirements

1. **State Management**
   - Track which row is currently expanded using React state
   - Store the expanded row ID (or null if none expanded)
   - Handle collapse when clicking the same row or a different row

2. **Number Column Integration**
   - Use existing `ideaNumber` field from the Idea type
   - No database changes needed (field already exists per system reminder)

3. **Click Handling**
   - Prevent expansion when clicking on interactive elements (Name link, upvote button)
   - Use event propagation control (stopPropagation) on nested interactive elements
   - Entire row should be clickable except for specific interactive elements

4. **Accessibility**
   - Add proper ARIA attributes for expandable rows
   - Keyboard navigation support (Enter/Space to toggle expansion)
   - Screen reader announcements for expand/collapse state

### UI/UX Requirements

1. **Visual Indicators**
   - Add a chevron icon (▶/▼) in the first column or a dedicated expand column
   - Change row background on hover to indicate clickability
   - Smoothly animate the expansion/collapse transition
   - Different background color for expanded content area

2. **Responsive Design**
   - Expanded content should work on mobile devices
   - Consider stacked layout for expanded content on small screens

## Implementation Plan

### Files to Modify

1. **src/app/IdeasList.tsx**
   - Add state for tracking expanded row: `const [expandedId, setExpandedId] = useState<string | null>(null)`
   - Add "#" column header as first column
   - Add ideaNumber cell as first cell in each row
   - Add click handler to table rows
   - Render expanded content conditionally after each row
   - Prevent expansion when clicking Name link or upvote button

2. **cypress/e2e/ideas.cy.ts**
   - Test: Number column is visible and shows ideaNumber
   - Test: Clicking row expands it
   - Test: Expanded content shows full details
   - Test: Clicking expanded row collapses it
   - Test: Clicking different row collapses previous and expands new one
   - Test: Clicking Name link navigates without expanding
   - Test: Clicking upvote button doesn't trigger expansion

### Component Structure

```tsx
// Expanded row component structure
{ideas.map((idea) => (
  <>
    <tr
      key={idea.id}
      onClick={() => handleRowClick(idea.id)}
      className="cursor-pointer hover:bg-zinc-50"
    >
      <td className="px-4 py-3 text-sm text-right text-zinc-500">
        {idea.ideaNumber}
      </td>
      {/* existing columns */}
    </tr>
    {expandedId === idea.id && (
      <tr key={`${idea.id}-expanded`}>
        <td colSpan={7} className="px-8 py-4 bg-zinc-50">
          {/* Expanded content */}
        </td>
      </tr>
    )}
  </>
))}
```

## Test Cases

### Cypress E2E Tests

**Test 1: Number Column Exists and Shows Data**
```typescript
it("displays # column with idea numbers", () => {
  cy.visit("/");
  cy.get('[data-testid="ideas-list"]').should("exist");
  cy.contains("th", "#").should("be.visible");
  cy.get('[data-testid="idea-number"]').first().should("exist");
  cy.get('[data-testid="idea-number"]').first().invoke("text").should("match", /^\d+$/);
});
```

**Test 2: Row Expands on Click**
```typescript
it("expands row when clicked", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().click();
  cy.get('[data-testid="expanded-content"]').should("be.visible");
});
```

**Test 3: Expanded Content Shows Full Details**
```typescript
it("shows full hypothesis in expanded view", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().click();
  cy.get('[data-testid="expanded-hypothesis"]').should("be.visible");
  cy.get('[data-testid="expanded-hypothesis"]').should("not.have.class", "line-clamp-3");
});
```

**Test 4: Row Collapses on Second Click**
```typescript
it("collapses row when clicked again", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').first().click();
  cy.get('[data-testid="expanded-content"]').should("be.visible");
  cy.get('[data-testid="idea-item"]').first().click();
  cy.get('[data-testid="expanded-content"]').should("not.exist");
});
```

**Test 5: Only One Row Expanded at a Time**
```typescript
it("collapses previous row when expanding a new one", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-item"]').eq(0).click();
  cy.get('[data-testid="expanded-content"]').should("have.length", 1);
  cy.get('[data-testid="idea-item"]').eq(1).click();
  cy.get('[data-testid="expanded-content"]').should("have.length", 1);
});
```

**Test 6: Name Link Doesn't Trigger Expansion**
```typescript
it("navigates to detail page when name is clicked", () => {
  cy.visit("/");
  cy.get('[data-testid="idea-name"]').first().find("a").click();
  cy.url().should("include", "/ideas/");
  cy.get('[data-testid="expanded-content"]').should("not.exist");
});
```

**Test 7: Upvote Button Doesn't Trigger Expansion**
```typescript
it("upvotes without expanding row", () => {
  cy.visit("/");
  cy.get('[data-testid="upvote-button"]').first().click();
  cy.get('[data-testid="expanded-content"]').should("not.exist");
});
```

## UI Design

### Updated Table Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ #  │ Age    │ Name       │ Hypothesis  │ Status      │ Source        │ Votes    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1  │ 2d ago │ My Idea    │ We believe… │ First Level │ User Research │ 5   [+1] │
│ 2  │ 1w ago │ Another    │ If we…      │ Scaling     │ Team Storm    │ 12  [+1] │ ▼
├─────────────────────────────────────────────────────────────────────────────────┤
│    │                         EXPANDED CONTENT                                    │
│    │ Full Hypothesis: If we add this feature, users will be more engaged        │
│    │ Created: November 24, 2025 at 2:30 PM                                      │
│    │ Last Updated: November 25, 2025 at 4:15 PM                                 │
│    │ Validation Status: Scaling                                                  │
│    │ Source: Team Brainstorm                                                     │
│    │ Upvotes: 12                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 3  │ just   │ New Idea   │ Users want… │ Second Lvl  │ Feedback      │ 3   [+1] │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Column Styling for Number Column

- Text size: `text-sm`
- Text color: `text-zinc-500 dark:text-zinc-400`
- Alignment: `text-right`
- Padding: `px-4 py-3`
- Width: Narrow (auto-fit to content)

### Expanded Content Styling

- Background: `bg-zinc-50 dark:bg-zinc-800/30`
- Padding: `px-8 py-4` or `p-6`
- Border: Match existing table borders
- Typography: Use same color scheme as detail page
- Layout: Grid or flexbox for organized display of fields

### Interaction States

1. **Default Row**: Standard table row styling
2. **Hover**: `hover:bg-zinc-50 dark:hover:bg-zinc-800/50` + `cursor-pointer`
3. **Expanded**: Row maintains expanded state, expanded content visible below
4. **Transition**: Smooth height animation (consider using CSS transition or Framer Motion)

## Architecture Decisions

### Single Expansion vs Multiple

**Decision:** Only one row can be expanded at a time

**Rationale:**
- Keeps the interface clean and focused
- Easier to implement and maintain
- Reduces cognitive load for users
- Most common use case is viewing one idea at a time

### Expansion Trigger

**Decision:** Click anywhere on the row except interactive elements

**Rationale:**
- Maximizes clickable area for better UX
- Prevents accidental navigation when trying to expand
- Name link still works for navigation
- Upvote button still works without expanding

### Expanded Content Location

**Decision:** Insert expanded content as a new table row with colspan

**Rationale:**
- Maintains table structure
- Works well with existing table styling
- Easier to implement than overlay/modal
- Better for responsive design

### Animation

**Decision:** Use CSS transitions for smooth expand/collapse

**Rationale:**
- Simple to implement
- Performant
- Provides visual feedback
- Can use Framer Motion if more complex animations needed later

## Notes

- The `ideaNumber` field already exists in the Idea type (per system reminder)
- Consider adding a visual indicator (chevron icon) to show expand/collapse state
- May want to add an expand/collapse all button in the future
- Consider persisting expanded state in URL query params for shareable links
- Expanded content should show formatted dates, not relative time
- Consider adding edit/delete actions in expanded view in future iterations
