# Ideas Feature

## Purpose
Manages innovation ideas through validation stages (backlog → first level → second level → scaling). Includes upvoting, filtering, sorting, and funnel visualization.

## Components

### IdeasListPage
- **Purpose**: Server-rendered page displaying all ideas for a product
- **Route**: [/[portfolioCode]/[productCode]/ideas](../../app/(product)/[portfolioCode]/[productCode]/ideas/page.tsx)
- **Props**:
  - `params: Promise<{ portfolioCode: string; productCode: string }>`
- **Features**:
  - Sortable/filterable ideas table
  - Expandable rows with details
  - Upvote functionality
  - Links to create new idea and funnel view
- **Usage**:
  ```tsx
  import { IdeasListPage } from '@/features/ideas/components/IdeasListPage';
  export const dynamic = "force-dynamic";
  export default IdeasListPage;
  ```

### IdeasList
- **Purpose**: Client-side sortable/filterable table component
- **Props**:
  - `portfolioCode: string`
  - `productCode: string`
  - `initialIdeas: Idea[]`
- **Features**:
  - Sort by 6 options (newest, oldest, most upvoted, name A-Z, name Z-A, status)
  - Filter by 5 validation statuses
  - Expandable rows showing hypothesis and status history
  - Optimistic upvoting
- **Usage**:
  ```tsx
  import { IdeasList } from '@/features/ideas/components/IdeasList';
  <IdeasList
    portfolioCode="ABC"
    productCode="P1"
    initialIdeas={ideas}
  />
  ```

### IdeaDetailPage
- **Purpose**: Displays full idea details
- **Route**: [/[portfolioCode]/[productCode]/ideas/[ideaNumber]](../../app/(product)/[portfolioCode]/[productCode]/ideas/[ideaNumber]/page.tsx)
- **Props**:
  - `params: Promise<{ portfolioCode: string; productCode: string; ideaNumber: string }>`
- **Features**:
  - Shows name, hypothesis, source, validation status
  - Displays status history timeline
  - Upvote button
  - Links to edit page

### EditIdeaPage
- **Purpose**: Form to edit existing ideas
- **Route**: [/[portfolioCode]/[productCode]/ideas/[ideaNumber]/edit](../../app/(product)/[portfolioCode]/[productCode]/ideas/[ideaNumber]/edit/page.tsx)
- **Features**:
  - All fields editable (name, hypothesis, source, status)
  - Status change tracking (adds to statusHistory)
  - Client-side validation

### NewIdeaPage
- **Purpose**: Form to create new ideas
- **Route**: [/[portfolioCode]/[productCode]/ideas/new](../../app/(product)/[portfolioCode]/[productCode]/ideas/new/page.tsx)
- **Features**:
  - Form with name, hypothesis, source fields
  - Auto-assigns next ideaNumber
  - Default status: "backlog"
  - Client-side validation

### FunnelPage
- **Purpose**: Funnel visualization of ideas by validation status
- **Route**: [/[portfolioCode]/[productCode]/ideas/funnel](../../app/(product)/[portfolioCode]/[productCode]/ideas/funnel/page.tsx)
- **Features**:
  - 5-stage funnel (backlog → first level → second level → scaling)
  - Failed ideas shown separately
  - Animated transitions
  - Decreasing widths (100% → 85% → 65% → 50%)

## Queries

### getIdeasByProduct(portfolioCode, productCode)
- **Purpose**: Fetches all ideas for a product
- **Parameters**:
  - `portfolioCode: string`
  - `productCode: string`
- **Returns**: `Idea[]`
- **Server-side**: Uses cookiesClient
- **Location**: [queries.ts:4](queries.ts#L4)

### getIdeaByNumber(portfolioCode, productCode, ideaNumber)
- **Purpose**: Fetches a single idea by its number
- **Parameters**:
  - `portfolioCode: string`
  - `productCode: string`
  - `ideaNumber: number`
- **Returns**: `Idea | null`
- **Server-side**: Uses cookiesClient with custom resolver
- **Location**: [queries.ts:19](queries.ts#L19)

### getNextIdeaNumber(portfolioCode, productCode)
- **Purpose**: Gets the next available idea number for a product
- **Returns**: `number`
- **Server-side**: Uses cookiesClient
- **Location**: [queries.ts:35](queries.ts#L35)

## Mutations

### createIdea(portfolioCode, productCode, ideaNumber, name, hypothesis, source)
- **Purpose**: Creates a new idea
- **Parameters**:
  - `portfolioCode: string`
  - `productCode: string`
  - `ideaNumber: number`
  - `name: string`
  - `hypothesis: string`
  - `source: IdeaSource`
- **Default status**: "backlog"
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:6](mutations.ts#L6)

### updateIdea(portfolioCode, productCode, ideaNumber, updates)
- **Purpose**: Updates idea fields (handles status history tracking)
- **Parameters**:
  - `portfolioCode: string`
  - `productCode: string`
  - `ideaNumber: number`
  - `updates: Partial<Idea>` - Fields to update
- **Special handling**: If validationStatus changes, adds entry to statusHistory
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:31](mutations.ts#L31)

### upvoteIdea(portfolioCode, productCode, ideaNumber, currentUpvotes)
- **Purpose**: Increments idea upvote count
- **Parameters**:
  - `portfolioCode: string`
  - `productCode: string`
  - `ideaNumber: number`
  - `currentUpvotes: number`
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:69](mutations.ts#L69)

### deleteIdea(portfolioCode, productCode, ideaNumber)
- **Purpose**: Deletes an idea
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:84](mutations.ts#L84)

## Types

### Idea
```typescript
{
  ideaNumber: number;         // Part of composite key
  name: string;
  hypothesis: string;
  validationStatus: ValidationStatus;
  statusHistory: StatusHistoryEntry[];
  upvotes: number;
  source: IdeaSource;
  portfolioCode: string;      // Partition key
  productCode: string;        // Part of composite key
  createdAt?: string;
  updatedAt?: string;
}
```

### ValidationStatus
```typescript
"backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed"
```

### IdeaSource
```typescript
"customerFeedback" | "teamBrainstorm" | "competitorAnalysis" |
"userResearch" | "marketTrend" | "internalRequest" | "other"
```

### StatusHistoryEntry
```typescript
{
  status: ValidationStatus;
  timestamp: string;        // ISO 8601
  notes?: string;
}
```

## Constants

### STATUS_LABELS
Maps validation statuses to display labels:
- `backlog` → "Backlog"
- `firstLevel` → "First Level Validation"
- etc.

### STATUS_COLORS
Maps validation statuses to Tailwind CSS classes for badges

### SORT_OPTIONS
Array of sort options for the ideas list:
- Newest first
- Oldest first
- Most upvoted
- Name (A-Z)
- Name (Z-A)
- Status (funnel order)

### SOURCE_OPTIONS
Array of idea source options for forms

## Utils

### getStatusLabel(status: ValidationStatus)
- **Purpose**: Returns display label for a status
- **Returns**: `string`
- **Location**: [utils.ts](utils.ts)

### getStatusColor(status: ValidationStatus)
- **Purpose**: Returns Tailwind CSS classes for status badge
- **Returns**: `string`
- **Location**: [utils.ts](utils.ts)

### getStatusSortOrder(status: ValidationStatus)
- **Purpose**: Returns funnel sort order (0-4)
- **Returns**: `number`
- **Location**: [utils.ts](utils.ts)

## Backend Schema

### Idea Model
- **Purpose**: Stores innovation ideas with validation tracking
- **Location**: [amplify/data/schemas/idea-schema.ts](../../../amplify/data/schemas/idea-schema.ts)
- **Identifier**: Composite key `[portfolioCode, productCode, ideaNumber]`
- **Fields**:
  - `ideaNumber: integer` (required) - Sequential number per product
  - `name: string` (required)
  - `hypothesis: string` (required)
  - `validationStatus: enum` (default: "backlog")
  - `statusHistory: json[]` - Array of {status, timestamp, notes}
  - `upvotes: integer` (default: 0)
  - `source: enum`
  - `portfolioCode: string` (required, partition key)
  - `productCode: string` (required)
- **Indexes**: portfolioCode, productCode, name, validationStatus, source
- **Authorization**: Public API key
- **Custom Resolvers**:
  - `getIdeaByNumber` - DynamoDB query by composite key

## Tests

- **Location**: [cypress/e2e/ideas/](../../../cypress/e2e/ideas/)
- **Test files**:
  - [ideas.cy.ts](../../../cypress/e2e/ideas/ideas.cy.ts) - List, sort, filter, upvote (50 tests)
  - [validation-status.cy.ts](../../../cypress/e2e/ideas/validation-status.cy.ts) - Status changes, history (20 tests)
  - [funnel.cy.ts](../../../cypress/e2e/ideas/funnel.cy.ts) - Funnel view, grouping (12 tests)
- **Total**: 82 tests

### Test Coverage
- Ideas list display and navigation
- Sorting (6 sort options)
- Filtering (5 status filters)
- Upvoting with optimistic updates
- Expandable rows
- Status transitions and history tracking
- Funnel visualization
- CRUD operations

### Running Tests
```bash
# Run only ideas tests
npm run test:ideas

# Run all E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui
```

## Dependencies

### Shared
- [@/shared/components/PageHeader](../../shared/components/PageHeader.tsx)
- [@/shared/components/PageTitle](../../shared/components/PageTitle.tsx)
- [@/shared/utils/amplify-server-utils](../../shared/utils/amplify-server-utils.ts)
- [@/shared/utils/formatRelativeTime](../../shared/utils/formatRelativeTime.ts)

### External
- `aws-amplify` - Data client
- `react` - Hooks (useState, useOptimistic, useSearchParams)
- `next/navigation` - useRouter, usePathname
- `next/link` - Client-side navigation

## Usage Examples

### Creating a new idea
1. Navigate to `/{portfolioCode}/{productCode}/ideas/new`
2. Fill in:
   - Name: "AI-powered search"
   - Hypothesis: "Users will find content 3x faster"
   - Source: "User Research"
3. Submit (auto-assigns next ideaNumber, sets status to "backlog")

### Changing idea validation status
1. Navigate to idea detail page
2. Click "Edit"
3. Change validation status (e.g., backlog → firstLevel)
4. Optionally add notes about the change
5. Submit (adds entry to statusHistory)

### Viewing the validation funnel
1. Navigate to `/{portfolioCode}/{productCode}/ideas/funnel`
2. See ideas grouped by validation stage
3. Failed ideas shown separately
4. Visual funnel with decreasing widths

### Filtering and sorting ideas
1. On ideas list page
2. Use filter dropdown to show only specific status
3. Use sort dropdown for different orderings
4. Click row to expand and see details
5. Click upvote to increment count (optimistic update)
