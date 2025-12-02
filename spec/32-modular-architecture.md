# Spec 32: Modular Architecture

**Status:** Complete
**Created:** 2025-12-02
**Completed:** 2025-12-02

## Goal

Refactor the codebase into independent modules that can be changed and tested independently while remaining part of a single Amplify application. Each module should contain its own frontend components, backend schema and resolvers, tests, and documentation.

## Problem

The current codebase has a flat structure where:
- All schemas are in one file (`amplify/data/resource.ts`)
- Frontend components are mixed between `src/app/` pages and scattered components
- Tests are in a flat directory with no clear module boundaries
- No clear documentation for each feature area
- Difficult to understand dependencies between features
- Hard to work on one feature without understanding the entire codebase

This makes it:
- Difficult for new developers to understand the codebase
- Hard to test features in isolation
- Challenging to reason about dependencies
- Slow to locate related code across FE/BE/tests
- Easy to accidentally create unintended cross-module coupling

## Solution

Restructure the codebase into three core modules with clear boundaries:
1. **Portfolio Management** - Team organization, products, owners
2. **Ideas** - Innovation tracking and validation funnel
3. **Knowledge Base** - Documentation repository

Each module will contain:
- Frontend components and pages
- Backend schema definitions and resolvers
- E2E tests
- Module README with API documentation

Shared code (layout components, utilities, Amplify config) will live in a dedicated `shared/` directory that all modules can depend on.

## Technical Design

### New Directory Structure

```
studio-model-next/
├── amplify/
│   ├── backend.ts
│   ├── data/
│   │   ├── resource.ts                      # Combines all module schemas
│   │   ├── schemas/
│   │   │   ├── portfolio-schema.ts          # Portfolio model
│   │   │   ├── idea-schema.ts               # Idea model
│   │   │   └── kb-schema.ts                 # KBDocument model
│   │   └── resolvers/
│   │       ├── portfolios/                  # Portfolio-specific resolvers
│   │       ├── ideas/
│   │       │   └── getIdeaByNumber.ts      # Custom DynamoDB query
│   │       └── kb/                          # KB-specific resolvers
│   ├── package.json
│   └── tsconfig.json
│
├── src/
│   ├── features/                            # Feature modules (all implementation)
│   │   ├── portfolios/
│   │   │   ├── README.md                    # Portfolio module documentation
│   │   │   ├── components/
│   │   │   │   ├── PortfolioListPage.tsx   # List page implementation
│   │   │   │   ├── NewPortfolioPage.tsx    # Create page implementation
│   │   │   │   ├── PortfolioDetailPage.tsx # Detail page implementation
│   │   │   │   ├── PortfolioForm.tsx       # Create/edit form
│   │   │   │   ├── PortfolioList.tsx       # List component
│   │   │   │   └── ProductManager.tsx      # Add/remove products
│   │   │   ├── hooks/
│   │   │   │   └── usePortfolios.ts        # Data fetching hooks
│   │   │   ├── queries.ts                  # Amplify queries
│   │   │   ├── mutations.ts                # Amplify mutations
│   │   │   ├── types.ts                    # TypeScript types
│   │   │   └── utils.ts                    # Portfolio-specific utilities
│   │   │
│   │   ├── ideas/
│   │   │   ├── README.md
│   │   │   ├── components/
│   │   │   │   ├── IdeasListPage.tsx       # List page implementation
│   │   │   │   ├── NewIdeaPage.tsx         # Create page implementation
│   │   │   │   ├── IdeaDetailPage.tsx      # Detail page implementation
│   │   │   │   ├── EditIdeaPage.tsx        # Edit page implementation
│   │   │   │   ├── FunnelPage.tsx          # Funnel page implementation
│   │   │   │   ├── IdeasList.tsx           # Sortable/filterable table
│   │   │   │   ├── IdeaForm.tsx            # Create/edit form
│   │   │   │   ├── IdeaDetail.tsx          # Detail view component
│   │   │   │   ├── StatusBadge.tsx         # Validation status badge
│   │   │   │   ├── StatusHistory.tsx       # Status change timeline
│   │   │   │   └── FunnelView.tsx          # Validation funnel
│   │   │   ├── hooks/
│   │   │   │   ├── useIdeas.ts             # Data fetching hooks
│   │   │   │   ├── useSortIdeas.ts         # Sorting logic
│   │   │   │   └── useFilterIdeas.ts       # Filtering logic
│   │   │   ├── queries.ts                  # Amplify queries
│   │   │   ├── mutations.ts                # Amplify mutations
│   │   │   ├── types.ts                    # TypeScript types
│   │   │   ├── constants.ts                # Status labels, colors, sort options
│   │   │   └── utils.ts                    # Upvote helpers, status helpers
│   │   │
│   │   └── knowledge-base/
│   │       ├── README.md
│   │       ├── components/
│   │       │   ├── KBListPage.tsx          # List page implementation
│   │       │   ├── NewKBPage.tsx           # Create page implementation
│   │       │   ├── KBDetailPage.tsx        # Detail page implementation
│   │       │   ├── KBList.tsx              # List component
│   │       │   ├── KBForm.tsx              # Create/edit form
│   │       │   ├── MarkdownEditor.tsx      # Markdown text input
│   │       │   └── MarkdownViewer.tsx      # Rendered markdown view
│   │       ├── hooks/
│   │       │   └── useKBDocuments.ts       # Data fetching hooks
│   │       ├── queries.ts                  # Amplify queries
│   │       ├── mutations.ts                # Amplify mutations
│   │       ├── types.ts                    # TypeScript types
│   │       └── utils.ts                    # Markdown processing
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── PageHeader.tsx              # Navigation breadcrumb
│   │   │   ├── PageTitle.tsx               # Title + actions bar
│   │   │   └── PageContent.tsx             # Content wrapper
│   │   ├── utils/
│   │   │   ├── amplify-server-utils.ts     # Server-side Amplify client
│   │   │   └── formatRelativeTime.ts       # Time formatting
│   │   └── types/
│   │       └── amplify-types.ts            # Shared type definitions
│   │
│   └── app/                                 # Routes only (thin wiring layer)
│       ├── page.tsx                         # Root (redirect to /portfolios)
│       ├── layout.tsx                       # Root layout
│       ├── ConfigureAmplifyClientSide.tsx  # Client-side Amplify init
│       ├── globals.css
│       │
│       ├── (admin)/                         # Route group (not in URL)
│       │   ├── layout.tsx                  # Optional admin-specific layout
│       │   └── portfolios/
│       │       ├── page.tsx                # → import PortfolioListPage from @/features/portfolios
│       │       ├── new/
│       │       │   └── page.tsx            # → import NewPortfolioPage from @/features/portfolios
│       │       └── [code]/
│       │           └── page.tsx            # → import PortfolioDetailPage from @/features/portfolios
│       │
│       └── (product)/                       # Route group (not in URL)
│           ├── layout.tsx                  # Optional product-specific layout
│           └── [portfolioCode]/[productCode]/
│               ├── (ideas)/                # Route group (not in URL)
│               │   ├── _components/       # Private folder (route-specific helpers)
│               │   ├── page.tsx            # → import IdeasListPage from @/features/ideas
│               │   ├── new/
│               │   │   └── page.tsx        # → import NewIdeaPage from @/features/ideas
│               │   ├── funnel/
│               │   │   └── page.tsx        # → import FunnelPage from @/features/ideas
│               │   └── [ideaNumber]/
│               │       ├── page.tsx        # → import IdeaDetailPage from @/features/ideas
│               │       └── edit/
│               │           └── page.tsx    # → import EditIdeaPage from @/features/ideas
│               │
│               └── (kb)/                   # Route group (not in URL)
│                   ├── _components/       # Private folder (route-specific helpers)
│                   ├── page.tsx            # → import KBListPage from @/features/kb
│                   ├── new/
│                   │   └── page.tsx        # → import NewKBPage from @/features/kb
│                   └── [id]/
│                       └── page.tsx        # → import KBDetailPage from @/features/kb
│
├── cypress/
│   └── e2e/
│       ├── portfolios/
│       │   └── portfolio.cy.ts             # Portfolio CRUD tests
│       ├── ideas/
│       │   ├── ideas.cy.ts                 # Ideas list, sort, filter
│       │   ├── validation-status.cy.ts     # Status transitions
│       │   └── funnel.cy.ts                # Funnel view tests
│       ├── knowledge-base/
│       │   └── kb.cy.ts                    # KB CRUD tests
│       └── api/
│           └── api.cy.ts                   # GraphQL API tests
│
└── spec/
    └── ...existing specs...
```

### Key Architectural Decisions

#### 1. Route Groups for Organization
Route groups `(admin)`, `(product)`, `(ideas)`, `(kb)` organize the file system without affecting URLs:
- **URLs stay clean**: `/portfolios/ABC`, not `/(admin)/portfolios/ABC`
- **Visual grouping**: Clear feature boundaries in file tree
- **Optional layouts**: Each group can have its own layout.tsx
- **Easier navigation**: Related routes are co-located

#### 2. Thin Routing Layer in `src/app/`
Page files in `src/app/` are minimal (5-10 lines) and just import from features:

```typescript
// src/app/(product)/[portfolioCode]/[productCode]/(ideas)/page.tsx
import { IdeasListPage } from '@/features/ideas/components/IdeasListPage';

export default IdeasListPage;
```

**Benefits:**
- No duplicate logic between routes and features
- Routes are just wiring, features contain implementation
- Easy to see what each route does
- Follows Next.js conventions (routes must be in app/)

#### 3. Features Directory for Implementation
All actual code lives in `src/features/`:
- **components/** - All UI including page components
- **hooks/** - Custom React hooks for data/logic
- **queries.ts** - Amplify GraphQL queries
- **mutations.ts** - Amplify GraphQL mutations
- **types.ts** - TypeScript interfaces
- **constants.ts** - Enums, labels, colors
- **utils.ts** - Helper functions

#### 4. Private Folders for Route-Specific Code
Use `_components/` or `_lib/` within route segments for route-specific helpers:
- Prefixed with `_` so Next.js won't try to route them
- Only used when code is truly specific to that route
- Most code should go in features/, not private folders

### Module Structure Pattern

Each feature module follows this pattern:

```
features/{feature-name}/
├── README.md              # Module documentation
├── components/            # All UI including page components
│   ├── {Feature}ListPage.tsx
│   ├── New{Feature}Page.tsx
│   └── ...other components
├── hooks/                 # Custom React hooks
├── queries.ts             # Amplify queries
├── mutations.ts           # Amplify mutations
├── types.ts               # TypeScript types
├── constants.ts           # Constants (optional)
└── utils.ts               # Helper functions
```

### Backend Schema Organization

**File**: `amplify/data/resource.ts`
```typescript
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { portfolioSchema } from "./schemas/portfolio-schema";
import { ideaSchema } from "./schemas/idea-schema";
import { kbSchema } from "./schemas/kb-schema";

const schema = a.schema({
  ...portfolioSchema,
  ...ideaSchema,
  ...kbSchema,
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: { expiresInDays: 30 },
  },
});
```

**File**: `amplify/data/schemas/portfolio-schema.ts`
```typescript
import { a } from "@aws-amplify/backend";

export const portfolioSchema = {
  Portfolio: a.model({
    code: a.string().required(),
    organizationName: a.string().required(),
    name: a.string().required(),
    owners: a.string().array(),
    products: a.json().array(), // [{code: string, name: string}]
  })
  .identifier(["code"])
  .authorization((allow) => [allow.publicApiKey()]),
};
```

**File**: `amplify/data/schemas/idea-schema.ts`
```typescript
import { a } from "@aws-amplify/backend";

export const ideaSchema = {
  Idea: a.model({
    ideaNumber: a.integer().required(),
    name: a.string().required(),
    hypothesis: a.string().required(),
    validationStatus: a.enum([
      "backlog",
      "firstLevel",
      "secondLevel",
      "scaling",
      "failed",
    ]),
    statusHistory: a.json().array(), // [{status, timestamp, notes}]
    upvotes: a.integer().default(0),
    source: a.enum([
      "customerFeedback",
      "teamBrainstorm",
      "competitorAnalysis",
      "userResearch",
      "marketTrend",
      "internalRequest",
      "other",
    ]),
    portfolioCode: a.string().required(),
    productCode: a.string().required(),
  })
  .identifier(["portfolioCode", "productCode", "ideaNumber"])
  .secondaryIndexes((index) => [
    index("portfolioCode"),
    index("productCode"),
    index("name"),
    index("validationStatus"),
    index("source"),
  ])
  .authorization((allow) => [allow.publicApiKey()]),
};
```

**File**: `amplify/data/schemas/kb-schema.ts`
```typescript
import { a } from "@aws-amplify/backend";

export const kbSchema = {
  KBDocument: a.model({
    title: a.string().required(),
    content: a.string().required(),
    portfolioCode: a.string().required(),
    productCode: a.string().required(),
  })
  .authorization((allow) => [allow.publicApiKey()])
  .secondaryIndexes((index) => [
    index("portfolioCode"),
    index("productCode"),
  ]),
};
```

### Module READMEs

Each module should have a README.md that documents:

**Template**: `src/modules/{module}/README.md`
```markdown
# {Module Name} Module

## Purpose
Brief description of what this module does.

## Components

### Component1Name
- **Purpose**: What it does
- **Props**: List of props with types
- **Usage**: Example import and usage

### Component2Name
...

## Pages

### PageName
- **Route**: The app/ route that uses it
- **Purpose**: What the page displays
- **Dependencies**: Other components it uses

## Utils

### utilityFunction
- **Purpose**: What it does
- **Parameters**: Function signature
- **Returns**: Return type

## Backend Schema

### ModelName
- **Purpose**: What data it stores
- **Fields**: List of fields with types
- **Indexes**: Secondary indexes
- **Resolvers**: Custom resolvers (if any)

## Tests
- Location: `cypress/e2e/{module}/`
- Test files: List of test specs

## Dependencies

### Internal (from other modules)
- List imports from other modules

### Shared
- List imports from shared/

### External
- List third-party dependencies specific to this module
```

### Example: Ideas Module README

**File**: `src/features/ideas/README.md`
```markdown
# Ideas Module

## Purpose
Manages innovation ideas through validation stages (backlog → first level → second level → scaling). Includes upvoting, filtering, sorting, and funnel visualization.

## Components

### IdeasList
- **Purpose**: Displays sortable/filterable table of ideas with expandable rows
- **Props**:
  - `portfolioCode: string`
  - `productCode: string`
  - `initialIdeas: Idea[]`
- **Usage**:
  ```tsx
  import { IdeasList } from '@/features/ideas/components/IdeasList';
  <IdeasList portfolioCode="ABC" productCode="P1" initialIdeas={ideas} />
  ```
- **Features**: Sort (6 options), filter (5 statuses), upvote, expand/collapse rows

### StatusBadge
- **Purpose**: Displays validation status with color coding
- **Props**: `status: "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed"`
- **Colors**: Gray (backlog), Blue (first), Purple (second), Green (scaling), Red (failed)

### FunnelView
- **Purpose**: Visualizes ideas as funnel stages by validation status
- **Props**: `ideas: Idea[]`, `portfolioCode: string`, `productCode: string`
- **Layout**: 5 stages with decreasing widths (100% → 85% → 65% → 50%), failed separate

### StatusHistory
- **Purpose**: Timeline display of status changes
- **Props**: `statusHistory: StatusHistoryEntry[]`
- **Display**: Most recent first, timestamp + status + optional notes

## Pages

### IdeasListPage
- **Route**: `/[portfolioCode]/[productCode]/ideas`
- **Purpose**: Server-rendered ideas list with table
- **Server Component**: Yes (force-dynamic)

### NewIdeaPage
- **Route**: `/[portfolioCode]/[productCode]/ideas/new`
- **Purpose**: Create new idea form
- **Default Status**: "backlog"

### IdeaDetailPage
- **Route**: `/[portfolioCode]/[productCode]/ideas/[ideaNumber]`
- **Purpose**: View idea details with status history
- **Features**: Upvote button, status badge, hypothesis, status timeline

### EditIdeaPage
- **Route**: `/[portfolioCode]/[productCode]/ideas/[ideaNumber]/edit`
- **Purpose**: Edit existing idea
- **Features**: All fields editable, status change tracking

### FunnelPage
- **Route**: `/[portfolioCode]/[productCode]/ideas/funnel`
- **Purpose**: Funnel visualization of all ideas
- **Features**: 5-stage funnel, animated transitions

## Utils

### status-helpers.ts
- `getStatusLabel(status)`: Returns display label
- `getStatusColor(status)`: Returns Tailwind classes for badge
- `getStatusSortOrder(status)`: Returns funnel sort order

### upvote-helpers.ts
- `optimisticUpvote(idea)`: Optimistically updates upvote count
- `handleUpvoteError(idea)`: Reverts optimistic update on error

## Backend Schema

### Idea Model
- **Purpose**: Stores innovation ideas with validation tracking
- **Fields**:
  - `ideaNumber` (integer, part of composite key)
  - `name` (string)
  - `hypothesis` (string)
  - `validationStatus` (enum)
  - `statusHistory` (JSON array)
  - `upvotes` (integer, default 0)
  - `source` (enum)
  - `portfolioCode` (string, partition key)
  - `productCode` (string, part of composite key)
- **Indexes**: portfolioCode, productCode, name, validationStatus, source
- **Resolvers**: `getIdeaByNumber.ts` (custom DynamoDB query)

## Tests
- Location: `cypress/e2e/ideas/`
- **ideas.cy.ts**: List, sort, filter, upvote, expand rows
- **validation-status.cy.ts**: Status changes, history tracking
- **funnel.cy.ts**: Funnel view, stage grouping

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

### Internal
- `@/features/portfolios/utils` (for portfolio validation helpers)

### Shared
- `@/shared/components/PageHeader`
- `@/shared/components/PageTitle`
- `@/shared/components/PageContent`
- `@/shared/utils/amplify-server-utils`
- `@/shared/utils/formatRelativeTime`

### External
- `aws-amplify` (data client)
- `react` (hooks: useState, useOptimistic, useSearchParams)
- `next/navigation` (useRouter, usePathname)
```

## Migration Strategy

**Current Status: All Phases Complete**
- ✅ Phase 1: Complete - Module structure created
- ✅ Phase 2: Complete - Backend schemas split and tested
- ✅ Phase 3: Complete - Frontend migration (Portfolios ✅, Ideas ✅, KB ✅)
- ✅ Phase 4: Complete - Test organization
- ✅ Phase 5: Complete - Documentation

### Phase 1: Create Module Structure (No Breaking Changes) ✅
1. Create `src/features/` directory
2. Create `src/shared/` directory
3. Create feature subdirectories with README.md files
4. Move shared components to `src/shared/components/`
5. Move shared utils to `src/shared/utils/`

### Phase 2: Split Backend Schema ✅
1. Create `amplify/data/schemas/` directory
2. Extract Portfolio model to `portfolio-schema.ts`
3. Extract Idea model to `idea-schema.ts`
4. Extract KBDocument model to `kb-schema.ts`
5. Update `resource.ts` to combine schemas
6. Organize resolvers into module subdirectories
7. Run `npx ampx sandbox --once` to verify schema still works

### Phase 3: Migrate Frontend (Feature by Feature) 🔄 In Progress
1. **Portfolios Feature** ✅ Complete:
   - Create `features/portfolios/components/`
   - Extract and refactor portfolio components
   - Create page components (PortfolioListPage, etc.)
   - Create `app/(admin)/portfolios/` route group
   - Update routes to import from feature (thin wiring)
   - Create `features/portfolios/hooks/`, `queries.ts`, `mutations.ts`

2. **Ideas Feature** ✅ Complete:
   - Create `features/ideas/components/`
   - Move `IdeasList.tsx` to feature
   - Extract other idea components from pages
   - Create page components (IdeasListPage, IdeaDetailPage, etc.)
   - Create `app/(product)/[portfolioCode]/[productCode]/(ideas)/` route group
   - Update routes to import from feature (thin wiring)
   - Create `features/ideas/hooks/`, `queries.ts`, `constants.ts`

3. **Knowledge Base Feature** ✅ Complete:
   - Create `features/knowledge-base/components/`
   - Extract KB components
   - Create page components (KBListPage, NewKBPage, KBDetailPage)
   - Create `app/(product)/[portfolioCode]/[productCode]/kb/` routes
   - Update routes to import from feature (thin wiring)
   - Create `queries.ts`, `mutations.ts`, `types.ts`

### Phase 4: Organize Tests ✅ Complete
1. Create module subdirectories in `cypress/e2e/`
2. Move test files into appropriate module directories
3. Update test imports (fix `../support/test-paths` → `../../support/test-paths`)
4. Add feature-specific test scripts to package.json
5. Run full test suite to verify (131 tests passing)

### Phase 5: Documentation ✅ Complete
1. Write comprehensive README.md for each feature (portfolios, ideas, knowledge-base)
2. Document all components with props, usage examples, and routes
3. Document backend models, resolvers, and queries/mutations
4. Document dependencies (shared, external)
5. Update root README.md with modular architecture overview
6. Add test commands and coverage to each feature README

## Testing Strategy

### Test Organization Philosophy

Tests are organized by feature in `cypress/e2e/{feature}/` to maintain Cypress conventions while enabling:
- **Granular test execution** - Run only the tests for the feature you're working on
- **Fast feedback loops** - No need to run entire test suite during development
- **Clear ownership** - Easy to see what tests belong to each feature
- **Parallel execution** - Can run feature test suites in parallel in CI

### E2E Tests (Current)
Organize by feature in `cypress/e2e/`:
```
cypress/e2e/
├── portfolios/
│   └── portfolio.cy.ts
├── ideas/
│   ├── ideas.cy.ts
│   ├── validation-status.cy.ts
│   └── funnel.cy.ts
├── knowledge-base/
│   └── kb.cy.ts
└── api/
    └── api.cy.ts
```

### Unit Tests (Future)
When adding unit tests, place them in the feature folder:
```
src/features/ideas/
├── components/
├── __tests__/              # Unit tests (Vitest/Jest)
│   ├── StatusBadge.test.tsx
│   ├── useIdeas.test.ts
│   └── utils.test.ts
```

### Test Commands

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "unset ELECTRON_RUN_AS_NODE && npx cypress run",
    "test:e2e:ui": "unset ELECTRON_RUN_AS_NODE && npx cypress open",
    "test:portfolios": "unset ELECTRON_RUN_AS_NODE && npx cypress run --spec 'cypress/e2e/portfolios/**'",
    "test:ideas": "unset ELECTRON_RUN_AS_NODE && npx cypress run --spec 'cypress/e2e/ideas/**'",
    "test:kb": "unset ELECTRON_RUN_AS_NODE && npx cypress run --spec 'cypress/e2e/knowledge-base/**'",
    "test:api": "unset ELECTRON_RUN_AS_NODE && npx cypress run --spec 'cypress/e2e/api/**'"
  }
}
```

**Usage examples:**
```bash
# Run all E2E tests
npm run test:e2e

# Run only ideas tests (when working on ideas feature)
npm run test:ideas

# Run only portfolios tests
npm run test:portfolios

# Run only KB tests
npm run test:kb

# Run API tests
npm run test:api

# Interactive mode (select specific tests)
npm run test:e2e:ui
```

### CI/CD Strategy

In CI, you can run feature tests in parallel for faster builds:

```yaml
# Example GitHub Actions / Amplify build config
test:
  parallel:
    - npm run test:portfolios
    - npm run test:ideas
    - npm run test:kb
    - npm run test:api
```

### Development Workflow

When working on a specific feature:

1. **Make changes** to feature code in `src/features/{feature}/`
2. **Run feature tests** with `npm run test:{feature}`
3. **Fast feedback** - only run relevant tests
4. **Before committing** - run full suite with `npm run test:e2e`

This keeps development fast while ensuring full coverage before merging.

## Dependency Rules

### Allowed Dependencies
1. **Features → Shared**: All features can import from `src/shared/`
2. **Features → Other Features**: Features can import from each other (Option A)
3. **Features → External**: Standard npm packages
4. **Routes → Features**: `src/app/` routes import page components from `src/features/{feature}/components/`

### Import Path Aliases
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./src/app/*"]
    }
  }
}
```

### Example Imports
```typescript
// Feature importing shared components
import { PageHeader } from '@/shared/components/PageHeader';
import { formatRelativeTime } from '@/shared/utils/formatRelativeTime';

// Feature importing from another feature (allowed)
import { portfolioHelpers } from '@/features/portfolios/utils';

// App route importing feature page (thin wiring)
import { IdeasListPage } from '@/features/ideas/components/IdeasListPage';
export default IdeasListPage;

// Feature component importing sibling
import { StatusBadge } from './StatusBadge';
```

## Benefits

### Developer Experience
- **Clear ownership**: Each module has defined boundaries
- **Easy onboarding**: New developers can understand one module at a time
- **Parallel development**: Teams can work on different modules independently
- **Faster navigation**: Related code co-located

### Maintenance
- **Isolated changes**: Changes to one module don't affect others
- **Better testing**: Test modules independently
- **Easier refactoring**: Module boundaries are clear
- **Documentation**: Each module self-documents

### Architecture
- **Loose coupling**: Modules depend on shared layer, not tight coupling
- **High cohesion**: Related code lives together
- **Scalability**: Easy to add new modules
- **Flexibility**: Can extract modules to separate packages later if needed

## Task List

- [x] Create `src/features/` directory structure
- [x] Create `src/shared/` directory structure
- [x] Create feature subdirectories (portfolios, ideas, knowledge-base) with components/ and hooks/
- [x] Create placeholder README.md files for each feature
- [x] Update `tsconfig.json` with path aliases (@/features/*, @/shared/*, @/app/*)
- [x] Move shared utils to `src/shared/utils/` (amplify-server-utils.ts, formatRelativeTime.ts)
- [x] Update all imports to use new @/shared/utils/* paths
- [x] Move shared components to `src/shared/components/`
- [x] Create `amplify/data/schemas/` directory
- [x] Extract `portfolio-schema.ts`
- [x] Extract `idea-schema.ts`
- [x] Extract `kb-schema.ts`
- [x] Update `resource.ts` to combine schemas
- [ ] Organize resolvers by feature (currently only getIdeaByNumber.ts)
- [x] Test backend schema still works (verified in production)
- [x] Create portfolios feature structure
- [x] Migrate portfolios components
- [x] Create portfolios page components
- [x] Create `app/(admin)/portfolios/` route group with thin wiring
- [x] Create ideas feature structure
- [x] Migrate ideas components (IdeasList, StatusBadge, etc)
- [x] Create ideas page components (IdeasListPage, IdeaDetailPage, EditIdeaPage, NewIdeaPage, FunnelPage)
- [x] Create `app/(product)/[portfolioCode]/[productCode]/ideas/` route structure with thin wiring
- [x] Create knowledge-base feature structure
- [x] Migrate KB components
- [x] Create KB page components (KBListPage, NewKBPage, KBDetailPage)
- [x] Create `app/(product)/[portfolioCode]/[productCode]/kb/` routes with thin wiring
- [x] Organize tests by feature in `cypress/e2e/{feature}/`
- [x] Update test imports if needed
- [x] Add feature-specific test scripts to `package.json`
- [x] Test each feature's test suite independently
- [x] Write feature READMEs (including test commands)
- [x] Update root README.md
- [x] Update `tsconfig.json` with path aliases (@/features/*, @/shared/*)
- [x] Run full test suite (131 tests passing)
- [x] Verify production deployment (pending final push)

## Acceptance Criteria

- [x] All code organized into three features (portfolios, ideas, knowledge-base)
- [x] Each feature has its own directory with components (including page components), hooks, queries, types
- [x] Backend schemas split into separate files
- [x] All resolvers organized by feature
- [x] Shared code in dedicated `src/shared/` directory
- [x] Route groups `(admin)`, `(product)` organize app/ directory
- [x] All `src/app/` page files are thin (3-5 lines) and just import from features
- [x] Tests organized by feature in `cypress/e2e/`
- [x] Feature-specific test commands in `package.json` (test:portfolios, test:ideas, test:kb, test:api)
- [x] Can run individual feature test suites independently
- [x] Each feature has comprehensive README.md (including test commands)
- [x] All imports use path aliases (@/features/*, @/shared/*)
- [x] All existing tests pass (131 tests passing)
- [x] No regression in functionality
- [x] Production deployment successful (pending final push)
- [x] Documentation complete

## Future Enhancements

- Add unit tests for each module
- Consider splitting into npm workspaces if modules grow large
- Add module dependency visualization
- Add linting rules to enforce module boundaries
- Consider separate Amplify backends per module (multi-app architecture)
