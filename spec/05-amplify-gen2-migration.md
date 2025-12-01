# Spec 05: Migrate to Amplify Gen 2 with Next.js

## Status: In Progress

## Goal

Migrate from SvelteKit + CDK to Next.js + Amplify Gen 2 for better DynamoDB integration and simpler infrastructure management.

## Problem

Current architecture has issues:
- SvelteKit SSR on Amplify has IAM permission problems accessing DynamoDB
- CDK infrastructure requires manual IAM role management
- Mock data fallback works but isn't a real solution

## Solution

Use Amplify Gen 2 with Next.js:
- First-class SSR support
- TypeScript-first data schema
- Automatic DynamoDB provisioning
- Built-in authentication (for future use)
- No manual IAM configuration

## Implementation

### 1. New Project Structure

Created a new Next.js app at `/Users/timothycochran/work/studio-model-next`:

```
studio-model-next/
├── amplify/
│   ├── data/
│   │   └── resource.ts       # Idea data model
│   └── backend.ts            # Backend configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with Amplify config
│   │   ├── page.tsx          # Ideas list page
│   │   ├── globals.css       # Global styles
│   │   └── ConfigureAmplifyClientSide.tsx
│   └── utils/
│       └── amplify-server-utils.ts  # SSR utilities
├── cypress/
│   ├── e2e/
│   │   └── ideas.cy.ts       # E2E tests
│   └── support/
│       └── e2e.ts
├── amplify.yml               # CI/CD configuration
├── cypress.config.ts
└── package.json
```

### 2. Data Schema

**File:** `amplify/data/resource.ts`

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Idea: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
```

### 3. Server-Side Data Fetching

**File:** `src/utils/amplify-server-utils.ts`

```typescript
import { cookies } from "next/headers";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/data";
import outputs from "../../amplify_outputs.json";
import type { Schema } from "../../amplify/data/resource";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export const cookiesClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});
```

**File:** `src/app/page.tsx`

```typescript
import { cookiesClient } from "../utils/amplify-server-utils";

export default async function Home() {
  const { data: ideas } = await cookiesClient.models.Idea.list();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Idea Backlog
        </h1>

        {ideas && ideas.length > 0 ? (
          <ul className="space-y-4" data-testid="ideas-list">
            {ideas.map((idea) => (
              <li key={idea.id} data-testid="idea-item">
                <h2>{idea.title}</h2>
                <p>{idea.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p data-testid="no-ideas">No ideas yet. Add your first idea!</p>
        )}
      </main>
    </div>
  );
}
```

### 4. Cypress Tests

**File:** `cypress/e2e/ideas.cy.ts`

```typescript
describe("Ideas Page", () => {
  it("displays the heading", () => {
    cy.visit("/");
    cy.contains("h1", "Idea Backlog").should("be.visible");
  });

  it("displays ideas from the database", () => {
    cy.visit("/");
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
  });

  it("shows idea title and description", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get("h2").should("not.be.empty");
      cy.get("p").should("not.be.empty");
    });
  });
});
```

### 5. CI/CD Configuration

**File:** `amplify.yml`

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - nvm install 20
        - nvm use 20
        - npm ci --legacy-peer-deps
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 20
        - npm ci --legacy-peer-deps
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
test:
  phases:
    preTest:
      commands:
        - nvm use 20
        - npm ci --legacy-peer-deps
        - npm run build
    test:
      commands:
        - npx start-server-and-test start http://localhost:3000 cypress:run
    postTest:
      commands:
        - npx mochawesome-merge cypress/report/*.json > cypress/report/combined.json
        - npx marge cypress/report/combined.json -f report -o cypress/report
  artifacts:
    baseDirectory: cypress
    configFilePath: "**/mochawesome.json"
    files:
      - "**/*.png"
      - "**/*.mp4"
```

## Migration Steps

1. [x] Create new Next.js app with Amplify Gen 2
2. [x] Define Idea data model
3. [x] Configure Amplify for SSR
4. [x] Create Ideas list page
5. [x] Set up Cypress testing (3 tests passing)
6. [x] Seed initial data (via GraphQL API)
7. [ ] Deploy to Amplify Hosting
8. [ ] Verify tests pass in CI
9. [ ] Remove old SvelteKit app and CDK infrastructure
10. [ ] Update CLAUDE.md

## Current State

- Amplify sandbox deployed with GraphQL API and DynamoDB
- Next.js app fetching real data from DynamoDB
- 3 Cypress tests passing locally
- Test data seeded: "Build mobile app" and "Add dark mode"

## Remaining Work

### Deploy to Amplify Hosting

The new app needs to be:
1. Pushed to a Git repository
2. Connected to Amplify Hosting
3. CI/CD tests verified

### Cleanup After Migration

Remove old infrastructure:
- `app/` (SvelteKit app)
- `infra/` (CDK stack)
- Run `cdk destroy` to remove AWS resources

## Benefits

- Automatic DynamoDB provisioning from schema
- No IAM permission issues
- TypeScript-first development
- Real-time subscriptions available
- Built-in auth when needed
- Official Amplify support

## Acceptance Criteria

- [x] Next.js app created with Amplify Gen 2
- [x] Idea model defined and deployed
- [x] Ideas displayed from DynamoDB (not mock data)
- [x] Cypress tests passing locally
- [ ] CI/CD pipeline working
- [ ] Old infrastructure removed
