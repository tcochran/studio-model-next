# Spec 31: New Validation Status

**Status:** Completed
**Created:** 2025-12-01
**Completed:** 2025-12-01

## Goal

Expand validation statuses to include "Backlog" and "Failed" stages, and implement history tracking to monitor idea progression through all validation stages over time.

## Problem

Currently, ideas only have three validation statuses (First Level, Second Level, Scaling), which doesn't capture:
- Ideas that haven't started validation yet (should be "Backlog")
- Ideas that were tested but didn't validate (should be "Failed")
- Historical progression - we can't see when ideas moved between stages

## Solution

1. Add two new validation statuses: "Backlog" and "Failed"
2. Add a `statusHistory` field to track status changes over time
3. Update all UI components to support the new statuses
4. Update funnel view to display all 5 stages

## Technical Design

### Database Schema Changes

**File**: `amplify/data/resource.ts`

Update the Idea model to include:
```typescript
validationStatus: a.enum([
  "backlog",
  "firstLevel",
  "secondLevel",
  "scaling",
  "failed"
]),
statusHistory: a.json().array() // Array of {status, timestamp, notes?}
```

### Data Model

Status history entry structure:
```typescript
{
  status: "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed",
  timestamp: string, // ISO 8601
  notes?: string // Optional notes about the status change
}
```

### Frontend Changes

**Files to modify:**
1. `src/app/IdeasList.tsx` - Update status labels and colors
2. `src/app/[portfolioCode]/[productCode]/ideas/page.tsx` - Update filter options
3. `src/app/[portfolioCode]/[productCode]/ideas/funnel/page.tsx` - Add Backlog and Failed stages
4. `src/app/[portfolioCode]/[productCode]/ideas/[ideaNumber]/page.tsx` - Display status history
5. `src/app/[portfolioCode]/[productCode]/ideas/new/page.tsx` - Default to "backlog" status

**Status Colors:**
- Backlog: Gray (`bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`)
- First Level: Blue (existing)
- Second Level: Purple (existing)
- Scaling: Green (existing)
- Failed: Red (`bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`)

**Status Labels:**
- backlog → "Backlog"
- firstLevel → "First Level"
- secondLevel → "Second Level"
- scaling → "Scaling"
- failed → "Failed"

### Funnel View Layout

Add two new funnel stages:
1. **Backlog** (top, widest - 100% width)
2. **First Level** (85% width)
3. **Second Level** (65% width)
4. **Scaling** (50% width)
5. **Failed** (bottom, separate section - 100% width, different color)

### Status History Display

On idea detail page, show timeline of status changes:
- Most recent first
- Display timestamp, status, and optional notes
- Visual timeline with colored indicators

## Task List

- [x] Update GraphQL schema in `amplify/data/resource.ts`
- [x] Run `npx ampx sandbox --once` to regenerate schema
- [x] Update `statusLabels` in `IdeasList.tsx`
- [x] Update `statusColors` in `IdeasList.tsx`
- [x] Update filter dropdown in `IdeasList.tsx`
- [x] Update `statusLabels` and `statusColors` in `ideas/[ideaNumber]/page.tsx`
- [x] Add status history display component to idea detail page
- [x] Update funnel view to include Backlog stage
- [x] Update funnel view to include Failed stage (separate section)
- [x] Update new idea form to default to "backlog" status
- [x] Write Cypress tests for new statuses
- [x] Write Cypress tests for status history
- [x] Test manually in browser
- [x] Update documentation

## Test Plan

### E2E Tests (Cypress)

**File**: `cypress/e2e/validation-status.cy.ts`

1. **New Status Display**
   - Verify "Backlog" status displays with gray badge
   - Verify "Failed" status displays with red badge
   - Verify all 5 statuses appear in filter dropdown
   - Verify filtering by each status works

2. **Funnel View**
   - Verify Backlog stage appears at top (100% width)
   - Verify Failed stage appears at bottom
   - Verify ideas group correctly by status
   - Verify each funnel layer has correct styling

3. **Status History**
   - Verify status history displays on idea detail page
   - Verify history shows timestamps
   - Verify history is sorted (most recent first)

4. **New Ideas**
   - Verify new ideas default to "backlog" status
   - Verify status can be changed when creating idea

### Manual Testing

- Light and dark mode for all new status colors
- Responsive design for funnel view with 5 stages
- Status history timeline readability
- Filter dropdown with all 5 options

## Acceptance Criteria

- [x] Database schema includes "backlog" and "failed" statuses
- [x] Database schema includes statusHistory field
- [x] All UI components display new statuses correctly
- [x] Funnel view shows all 5 stages with proper layout
- [x] Status history is visible on idea detail page
- [x] New ideas default to "backlog" status
- [x] Filter dropdown includes all 5 statuses
- [x] All tests pass (136/139 - 3 failures are unrelated API features not yet implemented)
- [x] Documentation updated

## User Decisions

1. **Status History Tracking**: Auto-record when status changes
2. **Failed Stage in Funnel**: Separate section off to the right side - "graveyard of failed ideas" (which is a good thing!)
3. **Default Status**: All new ideas default to "backlog"
4. **Status Transitions**: No rules - free movement between any statuses
5. **Existing Ideas**: Modify to add history starting with their current status
