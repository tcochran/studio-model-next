# Knowledge Base Feature

## Purpose
Documentation repository for storing and managing knowledge base documents. Provides a lightweight system for creating, viewing, and downloading markdown documents organized by product.

## Components

### KBListPage
- **Purpose**: Server-rendered page displaying all KB documents for a product
- **Route**: [/[portfolioCode]/[productCode]/kb](../../app/(product)/[portfolioCode]/[productCode]/kb/page.tsx)
- **Props**:
  - `params: Promise<{ portfolioCode: string; productCode: string }>`
- **Features**:
  - Lists all documents sorted by creation date (newest first)
  - Shows document titles as clickable links
  - Displays creation dates
  - Link to create new document
  - Empty state message when no documents
- **Usage**:
  ```tsx
  import { KBListPage } from '@/features/knowledge-base/components/KBListPage';
  export const dynamic = "force-dynamic";
  export default KBListPage;
  ```

### KBDetailPage
- **Purpose**: Displays full document content with download option
- **Route**: [/[portfolioCode]/[productCode]/kb/[id]](../../app/(product)/[portfolioCode]/[productCode]/kb/[id]/page.tsx)
- **Props**:
  - `params: Promise<{ portfolioCode: string; productCode: string; id: string }>`
- **Features**:
  - Shows document title and creation date
  - Renders content in monospace font (whitespace preserved)
  - Download button (exports as .md file)
  - Back link to KB list
  - Error handling for missing documents
- **Usage**:
  ```tsx
  import { KBDetailPage } from '@/features/knowledge-base/components/KBDetailPage';
  export default KBDetailPage;
  ```

### NewKBPage
- **Purpose**: Form to create new KB documents
- **Route**: [/[portfolioCode]/[productCode]/kb/new](../../app/(product)/[portfolioCode]/[productCode]/kb/new/page.tsx)
- **Features**:
  - Title input field
  - Large markdown content textarea (15 rows, monospace font)
  - Client-side validation (title and content required)
  - Redirects to KB list on success
- **Usage**:
  ```tsx
  import { NewKBPage } from '@/features/knowledge-base/components/NewKBPage';
  export default NewKBPage;
  ```

## Queries

### getKBDocumentsByProduct(portfolioCode, productCode)
- **Purpose**: Fetches all KB documents for a product
- **Parameters**:
  - `portfolioCode: string`
  - `productCode: string`
- **Returns**: `KBDocument[]` (sorted by createdAt descending)
- **Server-side**: Uses cookiesClient with GSI query
- **Location**: [queries.ts:4](queries.ts#L4)
- **Note**: Filters in-memory by portfolioCode after GSI query

### getKBDocumentById(id)
- **Purpose**: Fetches a single KB document by ID
- **Parameters**: `id: string` - Document UUID
- **Returns**: `KBDocument | null`
- **Server-side**: Uses cookiesClient
- **Location**: [queries.ts:24](queries.ts#L24)

## Mutations

### createKBDocument(title, content, portfolioCode, productCode)
- **Purpose**: Creates a new KB document
- **Parameters**:
  - `title: string` - Document title
  - `content: string` - Markdown content
  - `portfolioCode: string`
  - `productCode: string`
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:6](mutations.ts#L6)
- **Note**: Auto-generates UUID for document ID

### updateKBDocument(id, title, content)
- **Purpose**: Updates KB document
- **Parameters**:
  - `id: string`
  - `title: string`
  - `content: string`
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:22](mutations.ts#L22)

### deleteKBDocument(id)
- **Purpose**: Deletes a KB document
- **Parameters**: `id: string`
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:37](mutations.ts#L37)

## Types

### KBDocument
```typescript
{
  id: string;              // UUID (auto-generated)
  title: string;
  content: string;         // Markdown text
  portfolioCode: string;
  productCode: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
```

### Product
```typescript
{
  code: string;
  name: string;
}
```

## Backend Schema

### KBDocument Model
- **Purpose**: Stores knowledge base documents in DynamoDB
- **Location**: [amplify/data/schemas/kb-schema.ts](../../../amplify/data/schemas/kb-schema.ts)
- **Identifier**: `id` (UUID, auto-generated)
- **Fields**:
  - `title: string` (required)
  - `content: string` (required)
  - `portfolioCode: string` (required)
  - `productCode: string` (required)
- **Indexes**:
  - Secondary index on `portfolioCode`
  - Secondary index on `productCode` (used for efficient queries)
- **Authorization**: Public API key

## Tests

- **Location**: [cypress/e2e/knowledge-base/](../../../cypress/e2e/knowledge-base/)
- **Test file**: [kb.cy.ts](../../../cypress/e2e/knowledge-base/kb.cy.ts)
- **Test count**: 18 tests

### Test Coverage
- KB page heading and navigation
- Empty state display
- Document list display
- Document creation form validation
- Document creation and redirect
- Document detail page
- Document title and content rendering
- Download functionality
- Back navigation
- Error handling for invalid IDs
- Navigation between Ideas and KB pages

### Running Tests
```bash
# Run only KB tests
npm run test:kb

# Run all E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui
```

## Dependencies

### Shared
- [@/shared/components/PageHeader](../../shared/components/PageHeader.tsx) - Navigation breadcrumb
- [@/shared/components/PageTitle](../../shared/components/PageTitle.tsx) - Title with action buttons
- [@/shared/utils/amplify-server-utils](../../shared/utils/amplify-server-utils.ts) - Server-side Amplify client

### External
- `aws-amplify` - Data client for GraphQL operations
- `react` - Client component hooks (useState, useEffect, useMemo)
- `next/navigation` - useRouter, useParams for client components
- `next/link` - Client-side navigation

## Usage Examples

### Creating a new document
1. Navigate to `/{portfolioCode}/{productCode}/kb/new`
2. Fill in:
   - Title: "Product Architecture"
   - Content: Paste or type markdown content
3. Submit (validates title and content required)
4. Redirects to KB list

### Downloading a document
1. Navigate to document detail page
2. Click "Download" button
3. File downloads as `{title-slug}.md`
4. Example: "Product Architecture" → `product-architecture.md`

### Viewing all documents for a product
1. Navigate to `/{portfolioCode}/{productCode}/kb`
2. See list of documents sorted by newest first
3. Each document shows:
   - Title (clickable link)
   - Creation date (e.g., "Dec 1, 2024")
4. Click title to view full document

### Navigation between Ideas and KB
1. From Ideas page: Click "Knowledge Base" tab in PageHeader
2. From KB page: Click "Ideas" tab in PageHeader
3. Both maintain portfolio and product context

## Future Enhancements

Potential improvements not yet implemented:
- Markdown rendering (currently shows plain text)
- Full-text search across documents
- Document categories or tags
- Edit functionality
- Version history
- Document templates
- Rich markdown editor
- Table of contents generation
