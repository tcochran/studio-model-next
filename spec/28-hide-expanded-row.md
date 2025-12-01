# Spec 28: Hide Expanded Row

**Status:** Complete
**Created:** 2025-12-01
**Completed:** 2025-12-01

## Overview

When a user expands a row in the ideas list table, the collapsed row should hide/fade out while the expanded content shows, avoiding duplicate display of the same data. This creates a cleaner, more polished user experience with smooth animations between states.

## Requirements

### Functional Requirements

1. **Hide Collapsed Row When Expanded**
   - When user clicks to expand a row, the collapsed row content should hide
   - Only show the expanded content panel
   - The row should still occupy space in the table structure
   - Background/styling of the expanded row area should remain visible

2. **Animation Behavior**
   - Smooth fade-out animation when expanding (collapsed row disappears)
   - Smooth fade-in animation when collapsing (collapsed row reappears)
   - Expanded content slides in smoothly
   - Transition duration: 200-300ms for optimal feel

3. **Visual Hierarchy**
   - Expanded content panel should be visually distinct
   - Clear that expanded content is related to the hidden row
   - Maintain table structure and alignment

4. **Interaction**
   - Click anywhere in expanded area to collapse
   - Click collapsed row to expand
   - Smooth transition both directions

### Technical Requirements

1. **Animation Implementation**
   - Use CSS transitions for fade effects
   - Use React state to control visibility
   - Maintain accessibility (screen readers should still access content)

2. **Styling**
   - Conditional rendering or opacity transitions
   - Preserve table layout during transitions
   - Support dark mode
   - Maintain existing hover states

3. **Performance**
   - Smooth 60fps animations
   - No layout shift during transitions
   - Efficient re-renders

## Implementation Plan

### Files to Modify

1. **src/app/IdeasList.tsx**
   - Modify the collapsed row `<tr>` to hide when `expandedId === idea.id`
   - Add CSS transition classes for smooth animations
   - Update expanded content row to include collapse trigger
   - Add animation keyframes or transition styles

### Animation Options

**Option 1: Opacity Fade (Recommended)**
```tsx
<tr
  className={`transition-opacity duration-200 ${
    expandedId === idea.id ? 'opacity-0' : 'opacity-100'
  }`}
>
```

**Option 2: Height Collapse with Fade**
```tsx
<tr
  className={`transition-all duration-300 ${
    expandedId === idea.id
      ? 'opacity-0 h-0 overflow-hidden'
      : 'opacity-100'
  }`}
>
```

**Option 3: Display None (No Animation)**
```tsx
<tr className={expandedId === idea.id ? 'hidden' : ''}>
```

**Recommendation:** Option 1 provides the smoothest experience with minimal complexity.

### Expanded Content Animation

The expanded content should also animate in:
```tsx
<tr
  className="animate-slideDown"
  data-testid="expanded-content"
>
```

With CSS:
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 200ms ease-out;
}
```

## Test Cases

### Cypress E2E Tests

Add to `cypress/e2e/ideas.cy.ts`:

**Test 1: Collapsed Row Hides When Expanded**
```typescript
it("hides collapsed row when expanded", () => {
  cy.visit(TEST_IDEAS_PATH);

  // Get first idea row
  cy.get('[data-testid="idea-item"]').first().as("firstRow");

  // Initially visible
  cy.get("@firstRow").should("be.visible");
  cy.get("@firstRow").should("have.css", "opacity", "1");

  // Click to expand
  cy.get("@firstRow").click();

  // Row should be hidden (opacity 0 or display none)
  cy.get("@firstRow").should("have.css", "opacity", "0");

  // Expanded content should be visible
  cy.get('[data-testid="expanded-content"]').should("be.visible");
});
```

**Test 2: Collapsed Row Shows When Collapsed Again**
```typescript
it("shows collapsed row when collapsed again", () => {
  cy.visit(TEST_IDEAS_PATH);

  cy.get('[data-testid="idea-item"]').first().as("firstRow");

  // Expand
  cy.get("@firstRow").click();
  cy.get("@firstRow").should("have.css", "opacity", "0");

  // Collapse by clicking expanded content
  cy.get('[data-testid="expanded-content"]').click();

  // Row should be visible again
  cy.get("@firstRow").should("have.css", "opacity", "1");
  cy.get('[data-testid="expanded-content"]').should("not.exist");
});
```

**Test 3: Only Affects Expanded Row**
```typescript
it("only hides the expanded row, not others", () => {
  cy.visit(TEST_IDEAS_PATH);

  // Expand first row
  cy.get('[data-testid="idea-item"]').first().click();

  // First row hidden
  cy.get('[data-testid="idea-item"]').first().should("have.css", "opacity", "0");

  // Other rows still visible
  cy.get('[data-testid="idea-item"]').eq(1).should("be.visible");
  cy.get('[data-testid="idea-item"]').eq(1).should("have.css", "opacity", "1");
  cy.get('[data-testid="idea-item"]').eq(2).should("be.visible");
  cy.get('[data-testid="idea-item"]').eq(2).should("have.css", "opacity", "1");
});
```

**Test 4: Animation Smoothness**
```typescript
it("animates smoothly between states", () => {
  cy.visit(TEST_IDEAS_PATH);

  cy.get('[data-testid="idea-item"]').first().as("firstRow");

  // Check transition property exists
  cy.get("@firstRow").should("have.css", "transition");

  // Expand
  cy.get("@firstRow").click();

  // Should transition opacity
  cy.get("@firstRow").should("have.css", "transition").and("include", "opacity");
});
```

**Test 5: Expanded Content Animates In**
```typescript
it("animates expanded content in smoothly", () => {
  cy.visit(TEST_IDEAS_PATH);

  cy.get('[data-testid="idea-item"]').first().click();

  // Expanded content should have animation
  cy.get('[data-testid="expanded-content"]')
    .should("be.visible")
    .and("have.css", "animation-duration");
});
```

## UI Design

### Before (Current Behavior)
```
┌─────────────────────────────────────────────────────────┐
│ # │ Age │ Name     │ Hypothesis       │ Status │ Votes │
├─────────────────────────────────────────────────────────┤
│ 5 │ 2d  │ Feature  │ Users will...    │ First  │ +1    │ ← Collapsed row
├─────────────────────────────────────────────────────────┤
│            Expanded Content Panel                       │
│            Hypothesis: Full text...                     │
│            Status: First Level                          │
│            Source: Team Brainstorm                      │
│            Created: Dec 1, 2025                         │
└─────────────────────────────────────────────────────────┘
                   ↑ DUPLICATE DATA ↑
```

### After (New Behavior)
```
┌─────────────────────────────────────────────────────────┐
│ # │ Age │ Name     │ Hypothesis       │ Status │ Votes │
├─────────────────────────────────────────────────────────┤
│                                                         │ ← Hidden (opacity: 0)
├─────────────────────────────────────────────────────────┤
│            Expanded Content Panel                       │
│            Hypothesis: Full text...                     │
│            Status: First Level                          │
│            Source: Team Brainstorm                      │
│            Created: Dec 1, 2025                         │
└─────────────────────────────────────────────────────────┘
                   ↑ CLEAN DISPLAY ↑
```

### Animation Sequence

**Expanding:**
1. User clicks collapsed row (opacity: 1)
2. Collapsed row fades out over 200ms (opacity: 1 → 0)
3. Simultaneously, expanded content slides down and fades in
4. Final state: collapsed row invisible, expanded content visible

**Collapsing:**
1. User clicks expanded content
2. Expanded content fades out and slides up
3. Simultaneously, collapsed row fades in over 200ms (opacity: 0 → 1)
4. Final state: collapsed row visible, expanded content removed

## Architecture Decisions

### Why Hide vs Remove?

**Decision:** Hide with opacity instead of removing from DOM

**Rationale:**
- Maintains table structure and layout
- Smoother transitions (no layout shift)
- Easier to implement
- Better accessibility (content still in DOM for screen readers)

### Animation Approach

**Decision:** Use CSS transitions on opacity

**Rationale:**
- Simple, performant
- Hardware accelerated
- No JavaScript animation libraries needed
- Works well with existing React state management

### Transition Duration

**Decision:** 200ms for row fade, 200ms for expanded content

**Rationale:**
- Fast enough to feel responsive
- Slow enough to be perceived as smooth
- Standard duration for UI micro-interactions
- Matches common UX patterns

## Future Enhancements

1. **Staggered Animation**
   - Fade out row slightly before sliding in expanded content
   - More dramatic, sequential feel

2. **Height Animation**
   - Animate the expanded content's height
   - Create accordion-style expansion

3. **Hover Preview**
   - Show preview of expanded content on hover
   - Faster access to details

4. **Keyboard Navigation**
   - Expand/collapse with Enter/Space keys
   - Navigate between rows with arrow keys

5. **Expand All/Collapse All**
   - Buttons to expand or collapse all rows at once
   - Useful for quick scanning

## Notes

- This feature improves the visual clarity of the expanded state
- Reduces cognitive load by eliminating duplicate information
- Maintains accessibility by keeping content in DOM
- Uses CSS transitions for smooth, performant animations
- Doesn't break existing functionality or tests
- Works seamlessly with dark mode
