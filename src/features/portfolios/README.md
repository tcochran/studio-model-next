# Portfolios Feature

## Purpose
Manages portfolio organization, products, and ownership. A portfolio represents a collection of products owned by a team or organization.

## Components

### PortfolioListPage
- **Purpose**: Server-rendered page displaying all portfolios
- **Route**: [/portfolios](../../app/(admin)/portfolios/page.tsx)
- **Features**:
  - Lists all portfolios with organization name
  - Links to create new portfolio
  - Links to portfolio detail pages
- **Usage**:
  ```tsx
  import { PortfolioListPage } from '@/features/portfolios/components/PortfolioListPage';
  export default PortfolioListPage;
  ```

### PortfolioDetailPage
- **Purpose**: Displays portfolio details with products and owners
- **Route**: [/portfolios/[code]](../../app/(admin)/portfolios/[code]/page.tsx)
- **Props**:
  - `params: Promise<{ code: string }>` - Portfolio code from URL
- **Features**:
  - Shows portfolio name, organization, and code
  - Manages products (add/remove)
  - Manages owners (add/remove)
  - Links to product ideas pages
- **Usage**:
  ```tsx
  import { PortfolioDetailPage } from '@/features/portfolios/components/PortfolioDetailPage';
  export default PortfolioDetailPage;
  ```

### NewPortfolioPage
- **Purpose**: Form to create new portfolios
- **Route**: [/portfolios/new](../../app/(admin)/portfolios/new/page.tsx)
- **Features**:
  - Form with code, name, and organization fields
  - Client-side validation
  - Redirects to portfolio list on success
- **Usage**:
  ```tsx
  import { NewPortfolioPage } from '@/features/portfolios/components/NewPortfolioPage';
  export default NewPortfolioPage;
  ```

## Queries

### getPortfolios()
- **Purpose**: Fetches all portfolios
- **Returns**: `Portfolio[]`
- **Server-side**: Uses cookiesClient
- **Location**: [queries.ts:4](queries.ts#L4)

### getPortfolioByCode(code: string)
- **Purpose**: Fetches a single portfolio by code
- **Parameters**: `code` - Portfolio code (unique identifier)
- **Returns**: `Portfolio | null`
- **Server-side**: Uses cookiesClient
- **Location**: [queries.ts:9](queries.ts#L9)

## Mutations

### createPortfolio(code, name, organizationName)
- **Purpose**: Creates a new portfolio
- **Parameters**:
  - `code: string` - Unique identifier
  - `name: string` - Portfolio name
  - `organizationName: string` - Organization name
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:6](mutations.ts#L6)

### updatePortfolio(code, updates)
- **Purpose**: Updates portfolio fields
- **Parameters**:
  - `code: string` - Portfolio code
  - `updates: object` - Fields to update (name, organizationName, products, owners)
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:19](mutations.ts#L19)

### deletePortfolio(code)
- **Purpose**: Deletes a portfolio
- **Parameters**: `code: string` - Portfolio code
- **Client-side**: Uses generateClient
- **Location**: [mutations.ts:35](mutations.ts#L35)

## Types

### Portfolio
```typescript
{
  code: string;           // Unique identifier (partition key)
  name: string;           // Portfolio display name
  organizationName: string; // Organization that owns this portfolio
  owners?: string[];      // List of owner names
  products?: Product[];   // Array of products
  createdAt?: string;
  updatedAt?: string;
}
```

### Product
```typescript
{
  code: string;  // Product identifier (unique within portfolio)
  name: string;  // Product display name
}
```

## Backend Schema

### Portfolio Model
- **Purpose**: Stores portfolio data in DynamoDB
- **Location**: [amplify/data/schemas/portfolio-schema.ts](../../../amplify/data/schemas/portfolio-schema.ts)
- **Identifier**: `code` (partition key)
- **Fields**:
  - `code: string` (required) - Unique identifier
  - `organizationName: string` (required)
  - `name: string` (required)
  - `owners: string[]` (optional)
  - `products: json[]` (optional) - Array of {code, name} objects
- **Authorization**: Public API key

## Tests

- **Location**: [cypress/e2e/portfolios/](../../../cypress/e2e/portfolios/)
- **Test file**: [portfolio.cy.ts](../../../cypress/e2e/portfolios/portfolio.cy.ts)
- **Test count**: 16 tests

### Test Coverage
- Portfolio list display
- Portfolio creation form validation
- Portfolio detail page
- Product management (add/remove)
- Owner management (add/remove)
- Navigation between pages

### Running Tests
```bash
# Run only portfolio tests
npm run test:portfolios

# Run all E2E tests
npm run test:e2e

# Interactive mode
npm run test:e2e:ui
```

## Dependencies

### Shared
- [@/shared/components/PageHeader](../../shared/components/PageHeader.tsx) - Navigation breadcrumb
- [@/shared/components/PageTitle](../../shared/components/PageTitle.tsx) - Title with action buttons
- [@/shared/components/PageContent](../../shared/components/PageContent.tsx) - Content wrapper
- [@/shared/utils/amplify-server-utils](../../shared/utils/amplify-server-utils.ts) - Server-side Amplify client

### External
- `aws-amplify` - Data client for GraphQL operations
- `react` - Client component hooks
- `next/navigation` - Router for redirects
- `next/link` - Client-side navigation

## Usage Examples

### Creating a new portfolio
1. Navigate to `/portfolios/new`
2. Fill in the form:
   - Code: `ABC` (unique, no spaces)
   - Name: `My Portfolio`
   - Organization: `ACME Corp`
3. Submit to create

### Adding a product to a portfolio
1. Navigate to `/portfolios/{code}`
2. Use "Add Product" form
3. Enter product code and name
4. Submit to add product
5. Product appears in products list with link to ideas page

### Viewing ideas for a product
1. From portfolio detail page
2. Click product name or "View Ideas" link
3. Redirects to `/{portfolioCode}/{productCode}/ideas`
