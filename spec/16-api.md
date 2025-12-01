# Spec 16: Public API

**Status:** Draft
**Created:** 2025-12-01

## Overview

Expose a public REST/GraphQL API that allows external tools and integrations to interact with Product Flow data. The primary use case is enabling MCP (Model Context Protocol) integration so AI assistants can query and manipulate ideas, tasks, and other data programmatically.

## Goals

1. Enable MCP integration for AI-assisted workflows (e.g., "implement idea 6", "create tasks for idea 12")
2. Provide programmatic access for third-party integrations
3. Support automation and tooling built on top of Product Flow
4. Maintain security through API key authentication

## Requirements

### Functional Requirements

#### Core API Endpoints

**Ideas**
- `GET /api/ideas` - List all ideas (with portfolio/product filtering)
- `GET /api/ideas/:number` - Get idea by number (portfolio/product scoped)
- `POST /api/ideas` - Create new idea
- `PUT /api/ideas/:number` - Update idea
- `DELETE /api/ideas/:number` - Delete idea
- `POST /api/ideas/:number/upvote` - Upvote an idea

**Portfolios & Products**
- `GET /api/portfolios` - List all portfolios
- `GET /api/portfolios/:code` - Get portfolio details
- `GET /api/portfolios/:code/products` - List products in a portfolio
- `GET /api/portfolios/:code/products/:productCode` - Get product details

**Knowledge Base**
- `GET /api/kb` - List KB documents (with portfolio/product filtering)
- `GET /api/kb/:id` - Get KB document
- `POST /api/kb` - Create KB document
- `PUT /api/kb/:id` - Update KB document
- `DELETE /api/kb/:id` - Delete KB document

**Future Extensions** (not in initial scope)
- `GET /api/ideas/:number/tasks` - Get tasks for an idea
- `POST /api/ideas/:number/tasks` - Create tasks for an idea
- `GET /api/ideas/:number/specs` - Get spec for an idea
- `POST /api/ideas/:number/specs` - Generate spec for an idea

#### Query Parameters

All list endpoints should support:
- `portfolioCode` - Filter by portfolio
- `productCode` - Filter by product
- `status` - Filter by validation status
- `source` - Filter by source
- `sort` - Sort field (name, age, upvotes, status)
- `order` - Sort order (asc, desc)
- `limit` - Pagination limit
- `offset` - Pagination offset

#### Response Format

All responses should follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

Or for errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Idea #42 not found in portfolio routeburn/product-flow"
  }
}
```

### Technical Requirements

#### Authentication

**Current Implementation (Phase 1):**

1. **API Key Authentication (Open Access)**
   - Use existing Amplify API key setup (already configured in data schema)
   - API key passed in header: `x-api-key: <key>`
   - Keys expire in 30 days (current Amplify config)
   - API key grants access to ALL portfolios and products
   - Suitable for internal tools and MCP integration

2. **API Key Management**
   - Keys stored in AWS Secrets Manager or environment variables
   - Rotation mechanism for production
   - Different keys for dev/staging/production

**Future Implementation (Phase 2):**

1. **User Authentication + Portfolio Scoping**
   - Add Cognito user authentication alongside API keys
   - Users can only access portfolios they own/are members of
   - Portfolio ownership defined in `Portfolio.owners` field
   - Support both API key (full access) and user auth (scoped access)
   - User auth uses JWT tokens from Cognito

2. **Authorization Rules**
   - API Key: Full access to all portfolios (for internal tools/MCP)
   - Authenticated User: Access only to portfolios where user is in `owners` array
   - Public: No access (remove `publicApiKey` once user auth is implemented)

3. **Multi-tenant Security**
   - Customers can only see their own portfolios
   - Portfolio owners defined in Portfolio model
   - Row-level security enforced by AppSync authorization rules

#### Technology Stack

**Option A: AppSync GraphQL (Recommended)**
- Use existing Amplify Gen 2 AppSync API
- Already configured with API key auth
- No additional infrastructure needed
- GraphQL queries can be wrapped in REST-like endpoints if needed

**Option B: API Gateway + Lambda**
- Create REST API using AWS API Gateway
- Lambda functions to handle requests
- More control over request/response format
- Additional infrastructure to manage

**Decision: Start with AppSync GraphQL**
- Already exists and configured
- API key auth already working
- Can add REST wrapper later if needed
- MCP can use GraphQL directly

#### AppSync GraphQL Schema

The existing schema already supports most operations:

```graphql
type Query {
  getIdea(id: ID!): Idea
  listIdeas(filter: ModelIdeaFilterInput, limit: Int, nextToken: String): ModelIdeaConnection
  getPortfolio(code: String!): Portfolio
  listPortfolios(filter: ModelPortfolioFilterInput, limit: Int, nextToken: String): ModelPortfolioConnection
  getKBDocument(id: ID!): KBDocument
  listKBDocuments(filter: ModelKBDocumentFilterInput, limit: Int, nextToken: String): ModelKBDocumentConnection
}

type Mutation {
  createIdea(input: CreateIdeaInput!): Idea
  updateIdea(input: UpdateIdeaInput!): Idea
  deleteIdea(input: DeleteIdeaInput!): Idea
  createPortfolio(input: CreatePortfolioInput!): Portfolio
  updatePortfolio(input: UpdatePortfolioInput!): Portfolio
  deletePortfolio(input: DeletePortfolioInput!): Portfolio
  createKBDocument(input: CreateKBDocumentInput!): KBDocument
  updateKBDocument(input: UpdateKBDocumentInput!): KBDocument
  deleteKBDocument(input: DeleteKBDocumentInput!): KBDocument
}
```

#### Additional Queries Needed

Add custom queries to support MCP use cases:

```graphql
type Query {
  # Get idea by number (scoped to portfolio/product)
  getIdeaByNumber(
    portfolioCode: String!
    productCode: String!
    ideaNumber: Int!
  ): Idea

  # Find idea by name (scoped to portfolio/product)
  findIdeaByName(
    portfolioCode: String!
    productCode: String!
    name: String!
  ): Idea

  # List all ideas for a product
  listIdeasByProduct(
    portfolioCode: String!
    productCode: String!
    sortField: String
    sortOrder: String
    limit: Int
    nextToken: String
  ): ModelIdeaConnection

  # List ideas by validation status
  listIdeasByStatus(
    portfolioCode: String!
    productCode: String
    status: String!
    sortField: String
    sortOrder: String
    limit: Int
    nextToken: String
  ): ModelIdeaConnection

  # List ideas with enhanced filtering (combines all filters)
  listIdeasByPortfolio(
    portfolioCode: String!
    productCode: String
    status: String
    source: String
    sortField: String
    sortOrder: String
    limit: Int
    nextToken: String
  ): ModelIdeaConnection
}

type Mutation {
  # Upvote an idea
  upvoteIdea(
    portfolioCode: String!
    productCode: String!
    ideaNumber: Int!
  ): Idea
}
```

#### Error Handling

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid API key
- `403 Forbidden` - API key doesn't have permission
- `404 Not Found` - Resource doesn't exist
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

#### Rate Limiting

- Default: 1000 requests per hour per API key
- Can be increased for specific use cases
- Implemented via API Gateway or AppSync throttling

### Security Requirements

1. **API Key Security**
   - Never expose API keys in client-side code
   - Store keys in environment variables or secrets manager
   - Rotate keys regularly
   - Revoke compromised keys immediately

2. **Input Validation**
   - Validate all input parameters
   - Sanitize strings to prevent injection attacks
   - Enforce max lengths on text fields
   - Validate enum values (status, source, etc.)

3. **Authorization**
   - **Phase 1**: API key grants access to all portfolios (open access)
   - **Phase 2**: Add user authentication with portfolio-scoped access
     - Users can only access portfolios where they are listed in `owners` array
     - AppSync authorization rules enforce row-level security
     - Example: Customer A can only see/modify Portfolio A's data
   - **Phase 3**: Role-based access control (owner, member, viewer roles)

4. **Audit Logging**
   - Log all API requests (CloudWatch)
   - Track which API key made which requests
   - Monitor for abuse patterns

## Implementation Plan

### Phase 1: Enable AppSync API Access

1. **Expose AppSync Endpoint**
   - Document the AppSync GraphQL endpoint URL
   - Document how to get the API key
   - Create example queries for common operations

2. **Create API Documentation**
   - Document all queries and mutations
   - Provide example requests and responses
   - Create a Postman collection or similar

3. **Add Custom Queries**
   - Implement `getIdeaByNumber` query (get by number)
   - Implement `findIdeaByName` query (find by name)
   - Implement `listIdeasByProduct` query (all ideas for a product)
   - Implement `listIdeasByStatus` query (filter by status)
   - Implement `listIdeasByPortfolio` query (combined filters)
   - Implement `upvoteIdea` mutation

### Phase 2: MCP Integration (Spec 17)

1. **Create MCP Server**
   - Implement MCP protocol
   - Wrap AppSync queries in MCP tools
   - Handle authentication

2. **MCP Tools**
   - `get_idea` - Get idea by number
   - `find_idea_by_name` - Find idea by name
   - `list_product_ideas` - List all ideas for a product
   - `list_ideas_by_status` - List ideas in a specific status
   - `list_ideas` - List ideas with combined filters
   - `create_idea` - Create new idea
   - `update_idea` - Update existing idea
   - `upvote_idea` - Upvote an idea

### Phase 3: REST Wrapper (Optional)

1. **Create REST API**
   - API Gateway + Lambda or Next.js API routes
   - Wrap GraphQL queries in REST endpoints
   - Provide OpenAPI/Swagger documentation

### Files to Create/Modify

1. **amplify/data/resource.ts**
   - Add custom queries and mutations
   - Ensure API key auth is properly configured

2. **docs/api-reference.md**
   - Complete API documentation
   - Authentication guide
   - Example requests and responses

3. **docs/api-examples/**
   - Create example scripts (Node.js, Python, curl)
   - Demonstrate common use cases

4. **amplify/backend/function/** (if needed)
   - Custom Lambda resolvers for complex queries

## Test Cases

### Manual Testing

**Test 1: Get Idea by Number**
```graphql
query GetIdea {
  getIdeaByNumber(
    portfolioCode: "routeburn"
    productCode: "product-flow"
    ideaNumber: 6
  ) {
    id
    ideaNumber
    name
    hypothesis
    validationStatus
    upvotes
  }
}
```

**Test 2: Find Idea by Name**
```graphql
query FindIdea {
  findIdeaByName(
    portfolioCode: "routeburn"
    productCode: "product-flow"
    name: "Idea Upvoting"
  ) {
    id
    ideaNumber
    name
    hypothesis
    validationStatus
    upvotes
  }
}
```

**Test 3: List All Ideas for a Product**
```graphql
query ListProductIdeas {
  listIdeasByProduct(
    portfolioCode: "routeburn"
    productCode: "product-flow"
    sortField: "ideaNumber"
    sortOrder: "asc"
  ) {
    items {
      ideaNumber
      name
      validationStatus
      upvotes
    }
  }
}
```

**Test 4: List Ideas by Status**
```graphql
query ListScalingIdeas {
  listIdeasByStatus(
    portfolioCode: "routeburn"
    productCode: "product-flow"
    status: "scaling"
    sortField: "upvotes"
    sortOrder: "desc"
  ) {
    items {
      ideaNumber
      name
      validationStatus
      upvotes
    }
  }
}
```

**Test 5: List Ideas with Combined Filters**
```graphql
query ListIdeas {
  listIdeasByPortfolio(
    portfolioCode: "routeburn"
    productCode: "product-flow"
    status: "scaling"
    source: "customerFeedback"
    sortField: "upvotes"
    sortOrder: "desc"
  ) {
    items {
      ideaNumber
      name
      validationStatus
      source
      upvotes
    }
  }
}
```

**Test 6: Create Idea**
```graphql
mutation CreateIdea {
  createIdea(input: {
    ideaNumber: 99
    name: "Test Idea"
    hypothesis: "This is a test hypothesis"
    validationStatus: "firstLevel"
    source: teamBrainstorm
    portfolioCode: "routeburn"
    productCode: "product-flow"
    upvotes: 0
  }) {
    id
    ideaNumber
    name
  }
}
```

**Test 7: Upvote Idea**
```graphql
mutation UpvoteIdea {
  upvoteIdea(
    portfolioCode: "routeburn"
    productCode: "product-flow"
    ideaNumber: 6
  ) {
    ideaNumber
    name
    upvotes
  }
}
```

### Automated Tests

1. **Integration Tests**
   - Test all CRUD operations via GraphQL API
   - Test filtering and sorting
   - Test pagination
   - Test error cases (404, 400, etc.)

2. **Security Tests**
   - Test API key validation
   - Test missing auth header
   - Test invalid API key
   - Test SQL injection prevention
   - Test XSS prevention

3. **Performance Tests**
   - Load test with 100 concurrent requests
   - Test response times for list queries
   - Test response times for complex filters

## API Usage Examples

### Using curl

```bash
# Get AppSync endpoint and API key from Amplify outputs
ENDPOINT="https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY="da2-xxxxxxxxxxxxx"

# Get idea by number
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{
    "query": "query GetIdea($portfolioCode: String!, $productCode: String!, $ideaNumber: Int!) { getIdeaByNumber(portfolioCode: $portfolioCode, productCode: $productCode, ideaNumber: $ideaNumber) { id ideaNumber name hypothesis validationStatus upvotes } }",
    "variables": {
      "portfolioCode": "routeburn",
      "productCode": "product-flow",
      "ideaNumber": 6
    }
  }'
```

### Using Node.js

```javascript
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import outputs from './amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient();

// Get idea by number
async function getIdea(portfolioCode, productCode, ideaNumber) {
  const result = await client.graphql({
    query: `
      query GetIdea($portfolioCode: String!, $productCode: String!, $ideaNumber: Int!) {
        getIdeaByNumber(
          portfolioCode: $portfolioCode
          productCode: $productCode
          ideaNumber: $ideaNumber
        ) {
          id
          ideaNumber
          name
          hypothesis
          validationStatus
          upvotes
        }
      }
    `,
    variables: { portfolioCode, productCode, ideaNumber }
  });

  return result.data.getIdeaByNumber;
}

// Usage
const idea = await getIdea('routeburn', 'product-flow', 6);
console.log(idea);
```

### Using Python

```python
import requests
import json

ENDPOINT = "https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql"
API_KEY = "da2-xxxxxxxxxxxxx"

def get_idea(portfolio_code, product_code, idea_number):
    query = """
    query GetIdea($portfolioCode: String!, $productCode: String!, $ideaNumber: Int!) {
      getIdeaByNumber(
        portfolioCode: $portfolioCode
        productCode: $productCode
        ideaNumber: $ideaNumber
      ) {
        id
        ideaNumber
        name
        hypothesis
        validationStatus
        upvotes
      }
    }
    """

    response = requests.post(
        ENDPOINT,
        headers={
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        },
        json={
            "query": query,
            "variables": {
                "portfolioCode": portfolio_code,
                "productCode": product_code,
                "ideaNumber": idea_number
            }
        }
    )

    return response.json()["data"]["getIdeaByNumber"]

# Usage
idea = get_idea("routeburn", "product-flow", 6)
print(idea)
```

## Architecture Decisions

### GraphQL vs REST

**Decision:** Use GraphQL (AppSync) as primary API

**Rationale:**
- Already implemented and configured
- API key auth already working
- Flexible queries (clients request exactly what they need)
- Built-in schema and documentation
- Can add REST wrapper later if needed

### API Key vs OAuth

**Decision:** Use API key authentication

**Rationale:**
- Simpler for MCP integration
- No user context needed for AI assistant use cases
- Already configured in Amplify
- Can add OAuth later for user-facing integrations

### Custom Queries vs Generic Queries

**Decision:** Add custom queries for common MCP patterns

**Rationale:**
- `getIdeaByNumber` is more intuitive than filtering by ideaNumber
- Reduces complexity for API consumers
- Better performance (can optimize resolver)
- Clear intent in API design

### Versioning Strategy

**Decision:** No versioning initially, use schema evolution

**Rationale:**
- GraphQL supports additive changes without breaking clients
- Can add versioning later if needed (e.g., `/v1/graphql`)
- Simpler to start without versioning overhead

## Future Enhancements

### Phase 2: User Authentication & Multi-tenancy (HIGH PRIORITY)

**Goal:** Allow customers to securely access only their own portfolios

1. **Cognito Integration**
   - Add Amplify Auth with Cognito
   - User sign-up/sign-in flows
   - Email verification and password reset

2. **Portfolio-Scoped Authorization**
   - Update Amplify data schema authorization rules
   - Replace `allow.publicApiKey()` with conditional auth:
     ```typescript
     .authorization((allow) => [
       allow.apiKey(),  // Full access for internal tools
       allow.owner('owners')  // Users can only access their portfolios
     ])
     ```
   - Enforce that users can only query/mutate data for portfolios where they are in the `owners` array

3. **Customer Portal**
   - Public-facing login page
   - Customers see only their portfolios/products
   - Separate from internal admin interface

4. **Migration Path**
   - Keep API key auth for internal tools and MCP
   - Add user auth for customer-facing access
   - Gradually remove `publicApiKey` once user auth is stable

### Phase 3: Additional Enhancements

1. **REST API Wrapper**
   - Create REST endpoints using Next.js API routes or API Gateway
   - Provide OpenAPI/Swagger documentation
   - Support both GraphQL and REST

2. **Webhooks**
   - Notify external systems when ideas are created/updated
   - Support GitHub, Slack, custom webhooks
   - Event-driven architecture

3. **Advanced API Key Scoping**
   - Scope API keys to specific portfolios/products (in addition to user auth)
   - Service accounts with limited permissions
   - Programmatic API key creation/revocation

4. **Role-Based Access Control**
   - Portfolio owner: Full access to portfolio
   - Portfolio member: Can view and edit ideas
   - Portfolio viewer: Read-only access
   - Roles stored in Portfolio model or separate Team model

5. **Rate Limiting Dashboard**
   - Show API usage per key/user
   - Set custom rate limits per key
   - Alert on unusual usage patterns

6. **API Analytics**
   - Track most used endpoints
   - Monitor response times
   - Error rate tracking

## Notes

- The AppSync API endpoint URL can be found in `amplify_outputs.json`
- The API key can be found in AWS Console > AppSync > Settings > API Keys
- API keys expire in 30 days and need to be rotated
- Consider using AWS Secrets Manager for API key storage in production
- MCP integration (Spec 17) will build on this API foundation
