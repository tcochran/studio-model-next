# Spec 04: Display Ideas List

## Status: Completed

## Goal

Display a list of ideas on the homepage. Uses mock data with DynamoDB integration planned for a future spec.

## Problem

The Ideas page currently shows a static heading with no actual ideas. We need to:
- Display a list of ideas on the page
- Support both local development and production
- Prepare infrastructure for future DynamoDB integration

## Solution

Use mock data in the server-side code for now. DynamoDB table and seed data are provisioned via CDK but not yet connected due to Amplify SSR IAM permission complexities. Direct DynamoDB integration will be addressed in a future spec.

## Implementation

### 1. Cypress Tests

**File:** `app/cypress/e2e/ideas.cy.ts`

```typescript
describe('Ideas Page', () => {
  it('should display Idea Backlog heading', () => {
    cy.visit('/');
    cy.get('h1').should('contain', 'Idea Backlog');
  });

  it('should have correct page title', () => {
    cy.visit('/');
    cy.title().should('include', 'Idea Backlog');
  });

  it('should display a list of ideas', () => {
    cy.visit('/');
    cy.get('[data-testid="ideas-list"]').should('exist');
    cy.get('[data-testid="idea-item"]').should('have.length.at.least', 1);
  });

  it('should display idea title and description', () => {
    cy.visit('/');
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-title"]').should('exist');
      cy.get('[data-testid="idea-description"]').should('exist');
    });
  });
});
```

### 2. Idea Type

**File:** `app/src/lib/types.ts`

```typescript
export interface Idea {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}
```

### 3. Data Module with Mock Data

**File:** `app/src/lib/server/db.ts`

```typescript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import type { Idea } from '$lib/types';

const TABLE_NAME = process.env.DYNAMODB_IDEAS_TABLE || 'studio-model-ideas';

// Mock data for local development and fallback
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Build a recommendation engine',
    description: 'Use ML to suggest related ideas based on user interests',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Add collaborative editing',
    description: 'Allow multiple users to work on the same idea simultaneously',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Implement idea voting',
    description: 'Let users upvote ideas to surface the best ones',
    createdAt: new Date().toISOString(),
  },
];

export async function getIdeas(): Promise<Idea[]> {
  // Use mock data for local development
  if (import.meta.env.DEV) {
    return mockIdeas;
  }

  try {
    const client = new DynamoDBClient({
      region: 'us-east-1',
    });
    const docClient = DynamoDBDocumentClient.from(client);

    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await docClient.send(command);
    return (response.Items || []) as Idea[];
  } catch (error) {
    console.error('Error fetching ideas from DynamoDB:', error);
    // Return mock data as fallback
    return mockIdeas;
  }
}
```

### 4. Server Load Function

**File:** `app/src/routes/+page.server.ts`

```typescript
import { getIdeas } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const ideas = await getIdeas();

  // Sort by createdAt descending
  ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    ideas,
  };
};
```

### 5. Page Component

**File:** `app/src/routes/+page.svelte`

```svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Idea Backlog</title>
</svelte:head>

<h1>Idea Backlog</h1>

<ul data-testid="ideas-list">
  {#each data.ideas as idea (idea.id)}
    <li data-testid="idea-item">
      <h2 data-testid="idea-title">{idea.title}</h2>
      <p data-testid="idea-description">{idea.description}</p>
    </li>
  {/each}
</ul>
```

### 6. CDK Infrastructure (Provisioned but not connected)

DynamoDB table and seed data are created via CDK for future use:

```typescript
// DynamoDB table
const ideasTable = new dynamodb.Table(this, 'IdeasTable', {
  tableName: 'studio-model-ideas',
  partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

// Seed data via custom resource
const seedData = new cr.AwsCustomResource(this, 'SeedIdeasData', {
  onCreate: {
    service: 'DynamoDB',
    action: 'batchWriteItem',
    // ... 3 sample ideas
  },
});
```

## Project Structure

```
studio-model/
├── app/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── types.ts
│   │   │   └── server/
│   │   │       └── db.ts
│   │   └── routes/
│   │       ├── +page.svelte
│   │       └── +page.server.ts
│   └── cypress/
│       └── e2e/
│           └── ideas.cy.ts
├── infra/
│   └── lib/
│       └── infra-stack.ts
└── spec/
    └── 04-dynamodb-ideas-list.md
```

## Acceptance Criteria

- [x] Cypress tests for ideas list
- [x] Idea type defined
- [x] Server load function fetches ideas
- [x] Page displays list of ideas with titles and descriptions
- [x] Mock data works in development and production
- [x] Cypress tests passing
- [x] Amplify deployment succeeds
- [x] DynamoDB table provisioned (for future use)

## Known Limitations

**DynamoDB not connected:** The Amplify SSR compute environment has IAM permission issues accessing DynamoDB directly. The app currently uses mock data as a fallback.

## Future Work

To connect DynamoDB properly, consider:
1. **API Gateway + Lambda** - Create a separate API endpoint
2. **Debug Amplify SSR IAM** - Investigate the actual Lambda role used by Amplify compute
3. **Use Amplify Gen 2 Data** - Amplify's newer data layer approach

This will be addressed in a separate spec when CRUD operations are needed.

## Running Locally

```bash
cd app
npm run dev
```

The app uses mock data in development mode automatically.

## Verification

- Production URL: https://main.d24d3rnj7cl289.amplifyapp.com
- Displays 3 ideas with titles and descriptions
- All Cypress tests pass in CI/CD
