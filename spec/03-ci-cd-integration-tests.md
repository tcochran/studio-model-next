# Spec 03: CI/CD Integration Tests

## Status: Completed

## Goal

Add integration tests to the AWS Amplify deployment pipeline that run automatically on every deployment. If tests fail, prevent the deployment from going live.

## Problem

Currently, code is deployed to production without automated testing in the deployment pipeline. This means:
- Broken code can reach production
- No automated verification that deployments are successful
- Manual testing required after each deployment

## Solution

Use Amplify's native test phase with Cypress and mochawesome reporter. AWS Amplify requires mochawesome JSON format for test result detection.

## Implementation

### 1. Cypress Configuration

**File:** `app/cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:5173',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    video: true,
    screenshotOnRunFailure: true,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/report/mochawesome-report',
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss'
    }
  }
});
```

### 2. Amplify Build Specification

**File:** `app/amplify.yml`

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
        - cd build/compute/default/
        - npm i --production
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
test:
  phases:
    preTest:
      commands:
        - npm ci
        - npm install -g pm2
        - npm install -g wait-on
        - npm install mocha mochawesome mochawesome-merge mochawesome-report-generator
        - pm2 start npm -- run preview
        - wait-on http://localhost:4173
    test:
      commands:
        - 'npx cypress run --config baseUrl=http://localhost:4173 --reporter mochawesome --reporter-options "reportDir=cypress/report/mochawesome-report,overwrite=false,html=false,json=true,timestamp=mmddyyyy_HHMMss"'
    postTest:
      commands:
        - npx mochawesome-merge cypress/report/mochawesome-report/mochawesome*.json > cypress/report/mochawesome.json
        - pm2 kill
  artifacts:
    baseDirectory: cypress
    configFilePath: '**/mochawesome.json'
    files:
      - '**/*.png'
      - '**/*.mp4'
```

**Key points:**
- Test phase is a sibling to `frontend`, not nested inside it
- Uses pm2 to run preview server in background
- Uses wait-on to ensure server is ready before tests
- Mochawesome reporter generates JSON that Amplify can parse
- pm2 kill cleans up the server process after tests

### 3. CDK Infrastructure

**File:** `infra/lib/infra-stack.ts`

The CDK stack defines the Amplify app but does NOT include a buildSpec. Amplify reads the `amplify.yml` file directly from the repository, so build configuration is managed in one place.

```typescript
import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import { Construct } from 'constructs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const amplifyApp = new amplify.App(this, 'StudioModelApp', {
      appName: 'studio-model',
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'tcochran',
        repository: 'studio-model',
        oauthToken: cdk.SecretValue.secretsManager('github-token'),
      }),
      platform: amplify.Platform.WEB_COMPUTE,
      autoBranchDeletion: true,
    });

    amplifyApp.addBranch('main', {
      autoBuild: true,
      stage: 'PRODUCTION',
      pullRequestPreview: true,
    });

    new cdk.CfnOutput(this, 'AmplifyAppUrl', {
      value: `https://main.${amplifyApp.defaultDomain}`,
      description: 'Amplify App URL',
    });

    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.appId,
      description: 'Amplify App ID',
    });
  }
}
```

### 4. Test Files

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
});
```

### 5. Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "cy:run": "cypress run",
    "cy:open": "cypress open",
    "test": "start-server-and-test dev http://localhost:5173 cy:run",
    "test:ci": "cypress run",
    "test:production": "cypress run"
  }
}
```

### 6. Dependencies

```json
{
  "devDependencies": {
    "cypress": "^15.7.0",
    "mochawesome": "^7.1.4",
    "mochawesome-merge": "^5.1.0",
    "mochawesome-report-generator": "^6.3.2",
    "start-server-and-test": "^2.1.3",
    "wait-on": "^9.0.3"
  }
}
```

## Project Structure

```
studio-model/
├── app/
│   ├── amplify.yml
│   ├── cypress.config.ts
│   ├── cypress/
│   │   └── e2e/
│   │       └── ideas.cy.ts
│   └── package.json
├── infra/
│   └── lib/
│       └── infra-stack.ts
└── spec/
    └── 03-ci-cd-integration-tests.md
```

## Verification

### Test 1: Failing Test Blocks Deployment

1. Added intentional failing test
2. Pushed to main
3. Job 14: **FAILED** - deployment blocked
4. DEPLOY step: **CANCELLED**

### Test 2: Passing Tests Allow Deployment

1. Removed failing test
2. Pushed to main
3. Job 15: **SUCCEED** - deployment completed
4. Production updated successfully

## Acceptance Criteria

- [x] Test phase added to amplify.yml
- [x] Cypress configured with mochawesome reporter
- [x] Tests run automatically on every deployment
- [x] Failed tests block deployment
- [x] Test results visible in Amplify Console
- [x] CDK stack deployed successfully
- [x] Verified: failing test blocks deployment (Job 14)
- [x] Verified: passing tests allow deployment (Job 15)

## Monitoring Deployments

### Via AWS Console
https://console.aws.amazon.com/amplify/home#/d24d3rnj7cl289

### Via AWS CLI
```bash
# Check latest job status
aws amplify list-jobs \
  --app-id d24d3rnj7cl289 \
  --branch-name main \
  --max-items 1

# Get job details
aws amplify get-job \
  --app-id d24d3rnj7cl289 \
  --branch-name main \
  --job-id <JOB_ID>
```

## Running Tests Locally

```bash
# Interactive mode
npm run cy:open

# Headless mode
npm run cy:run

# With dev server
npm run test
```

## Why Cypress Instead of Playwright

AWS Amplify's test phase requires **mochawesome JSON format** to detect test failures. Playwright uses a different JSON format that Amplify cannot parse, causing it to report "Tests completed successfully" even when tests fail.

Cypress with mochawesome reporter generates the correct format, allowing Amplify to properly detect failures and block deployment.

## Future Enhancements

These could be implemented in a future spec:

- CloudWatch alarms for production health monitoring
- Automated rollback Lambda function
- SNS notifications for deployment alerts
- Performance testing
- Accessibility testing
