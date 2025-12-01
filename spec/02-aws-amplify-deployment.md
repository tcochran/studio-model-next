# Spec 02: AWS Amplify Deployment with CDK

## Goal

Deploy the SvelteKit application to AWS Amplify using AWS CDK (Infrastructure as Code) with continuous deployment from GitHub. Configure integration tests to run against both local and deployed environments.

## Reference

- AWS Amplify Documentation: https://docs.aws.amazon.com/amplify/latest/userguide/get-started-sveltekit.html
- AWS CDK Amplify Constructs: https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_amplify_alpha/README.html

## Tasks

### Part 1: Frontend Configuration

#### 1. Install Amplify Adapter

**Command:**
```bash
cd app
npm install -D amplify-adapter
```

**Why:** AWS doesn't maintain an official SvelteKit adapter, so we use the community-built `amplify-adapter`.

#### 2. Update SvelteKit Configuration

**File:** `app/svelte.config.js`

Replace the import and adapter:

```javascript
import adapter from 'amplify-adapter';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter()
  }
};

export default config;
```

#### 3. Create Amplify Build Configuration

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
```

#### 4. Configure Test Environments

**File:** `app/playwright.config.ts`

Update to support multiple environments:

```typescript
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.TEST_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: baseURL.includes('localhost') ? {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  } : undefined,
});
```

#### 5. Add Test Scripts for Production

**File:** `app/package.json`

Update scripts section:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:production": "playwright test"
  }
}
```

#### 6. Create Environment Configuration

**File:** `app/.env.example`

```
# Amplify deployment URL
TEST_URL=https://main.xxxxxx.amplifyapp.com
```

#### 7. Test Build Locally

**Command:**
```bash
cd app
npm run build
```

**Expected:** Build completes successfully with "Using amplify-adapter" message.

#### 8. Commit Frontend Changes

```bash
git add .
git commit -m "Configure AWS Amplify adapter and build settings"
git push
```

### Part 2: CDK Infrastructure Setup

#### 9. Initialize CDK Project

**Create infrastructure directory:**
```bash
mkdir infra
cd infra
```

**Initialize CDK project:**
```bash
npx aws-cdk@latest init app --language typescript
```

#### 10. Install CDK Amplify Constructs

**Command:**
```bash
npm install @aws-cdk/aws-amplify-alpha
```

#### 11. Create GitHub Token Secret

**Store GitHub personal access token in AWS Secrets Manager:**

```bash
aws secretsmanager create-secret \
  --name github-token \
  --description "GitHub personal access token for Amplify" \
  --secret-string "YOUR_GITHUB_TOKEN"
```

**To create a GitHub token:**
1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token with `repo` and `admin:repo_hook` scopes
3. Copy the token and use it in the command above

#### 12. Create Amplify Stack

**File:** `infra/lib/infra-stack.ts`

```typescript
import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
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
      platform: amplify.Platform.WEB_COMPUTE, // Enable SSR
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        applications: [{
          appRoot: 'app',
          frontend: {
            phases: {
              preBuild: {
                commands: ['npm ci']
              },
              build: {
                commands: [
                  'npm run build',
                  'cd build/compute/default/',
                  'npm i --production'
                ]
              }
            },
            artifacts: {
              baseDirectory: 'build',
              files: ['**/*']
            },
            cache: {
              paths: ['node_modules/**/*']
            }
          }
        }]
      }),
    });

    // Add main branch
    const mainBranch = amplifyApp.addBranch('main', {
      autoBuild: true,
      stage: 'PRODUCTION',
    });

    // Output the app URL
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

#### 13. Update CDK App Entry Point

**File:** `infra/bin/infra.ts`

```typescript
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
new InfraStack(app, 'StudioModelStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});
```

#### 14. Bootstrap CDK (First Time Only)

If you haven't used CDK in your AWS account before:

```bash
cd infra
npx cdk bootstrap
```

#### 15. Deploy Infrastructure

**Preview changes:**
```bash
npx cdk diff
```

**Deploy:**
```bash
npx cdk deploy
```

**Expected output:**
```
StudioModelStack.AmplifyAppUrl = https://main.d1234567890abc.amplifyapp.com
StudioModelStack.AmplifyAppId = d1234567890abc

✅ StudioModelStack

Stack ARN:
arn:aws:cloudformation:us-east-1:ACCOUNT:stack/StudioModelStack/...
```

Copy the `AmplifyAppUrl` for testing.

#### 16. Monitor First Deployment

**Check deployment status:**
```bash
aws amplify list-jobs --app-id YOUR_APP_ID --branch-name main
```

Or visit the Amplify Console:
```
https://console.aws.amazon.com/amplify/home
```

Wait for the build to complete (usually 3-5 minutes).

### Part 3: Testing and Verification

#### 17. Create Local Environment File

**File:** `app/.env`

```
TEST_URL=https://main.YOUR_APP_ID.amplifyapp.com
```

Replace with your actual Amplify URL from CDK output.

#### 18. Test in Browser

Open the Amplify URL in your browser and verify:
- "Ideas" heading displays
- No console errors
- Page title is "Ideas"

#### 19. Run Integration Tests Against Production

**Command:**
```bash
cd app
export TEST_URL=https://main.YOUR_APP_ID.amplifyapp.com
npm run test:production
```

**Expected:**
```
Running 2 tests using 1 worker

  ✓  [chromium] › tests/ideas.spec.ts:4:3 › Ideas Page › should display Ideas heading
  ✓  [chromium] › tests/ideas.spec.ts:11:3 › Ideas Page › should have correct page title

  2 passed
```

#### 20. Verify Continuous Deployment

**Test auto-deployment:**
1. Make a small change to CLAUDE.MD
2. Commit and push to main
3. Check Amplify Console or run:
   ```bash
   aws amplify list-jobs --app-id YOUR_APP_ID --branch-name main --max-results 1
   ```
4. Verify new deployment starts automatically

#### 21. Commit Infrastructure Code

```bash
git add infra/
git commit -m "Add CDK infrastructure for AWS Amplify deployment"
git push
```

#### 22. Update Deployment Documentation

**File:** `spec/deployment.md`

Update with actual URLs and deployment information.

## Project Structure After Completion

```
studio-model/
├── app/
│   ├── amplify.yml
│   ├── .env (gitignored)
│   ├── .env.example
│   ├── package.json (updated)
│   ├── playwright.config.ts (updated)
│   ├── svelte.config.js (updated)
│   └── ...
├── infra/
│   ├── bin/
│   │   └── infra.ts
│   ├── lib/
│   │   └── infra-stack.ts
│   ├── cdk.json
│   ├── package.json
│   └── tsconfig.json
└── spec/
    ├── deployment.md
    └── ...
```

## Acceptance Criteria

### Frontend Configuration
- [x] amplify-adapter installed
- [x] svelte.config.js updated to use amplify-adapter
- [x] amplify.yml build configuration created
- [x] Playwright config supports TEST_URL environment variable
- [x] test:production script added
- [x] .env.example created
- [x] Local build succeeds
- [x] Changes committed and pushed

### Infrastructure Deployment
- [ ] CDK project initialized
- [ ] CDK Amplify constructs installed
- [ ] GitHub token stored in Secrets Manager
- [ ] Amplify stack created
- [ ] CDK bootstrap completed (if first time)
- [ ] Infrastructure deployed successfully
- [ ] Amplify app URL received from CDK outputs

### Testing & Verification
- [ ] Application accessible at Amplify URL
- [ ] Integration tests pass against local environment
- [ ] Integration tests pass against production environment
- [ ] Continuous deployment verified (push triggers auto-deploy)
- [ ] Deployment documentation updated
- [ ] Infrastructure code committed to git

## CDK Commands Reference

```bash
# Preview changes before deploying
npx cdk diff

# Deploy infrastructure
npx cdk deploy

# Destroy infrastructure (careful!)
npx cdk destroy

# List all stacks
npx cdk ls

# Synthesize CloudFormation template
npx cdk synth
```

## Testing Checklist

### Local Environment
```bash
cd app
npm run test
```
Expected: All tests pass

### Production Environment
```bash
cd app
export TEST_URL=https://main.YOUR_APP_ID.amplifyapp.com
npm run test:production
```
Expected: All tests pass

### Continuous Deployment
1. Make trivial change
2. Push to main
3. Check Amplify Console or AWS CLI
Expected: Auto-deployment triggered and succeeds

## Troubleshooting

### CDK Deployment Issues

**"Could not assume role":**
- Verify AWS credentials are configured: `aws sts get-caller-identity`
- Ensure you have permissions to create CloudFormation stacks
- Run `aws configure` if needed

**"Secret not found":**
- Verify GitHub token secret exists: `aws secretsmanager get-secret-value --secret-id github-token`
- Check secret name matches in stack code

**"Repository not found":**
- Verify GitHub repository exists and is accessible
- Check owner and repository names in stack code
- Ensure GitHub token has correct permissions

### Build Failures

**Build fails on Amplify:**
- Check build logs in Amplify Console
- Verify amplify.yml syntax
- Ensure all dependencies in package.json
- Check buildSpec in CDK stack matches amplify.yml

**Tests fail on production:**
- Verify TEST_URL is correct
- Check application loads in browser
- Review Amplify deployment logs
- Ensure SSR is enabled (Platform.WEB_COMPUTE)

### SSR Issues

**SSR not working:**
- Verify amplify-adapter is installed
- Check svelte.config.js uses amplify-adapter
- Ensure `platform: amplify.Platform.WEB_COMPUTE` in CDK stack

## Cost Considerations

AWS Amplify Free Tier includes:
- Build & deploy minutes: 1,000 minutes/month
- Data storage: 5 GB stored
- Data served: 15 GB served/month

AWS CDK has no additional costs (uses CloudFormation).

Current app should stay within free tier limits.

## Benefits of CDK Approach

✅ **Infrastructure as Code** - All infrastructure version controlled
✅ **Reproducible** - Easy to recreate in different accounts/regions
✅ **Automated** - No manual console clicking
✅ **Type Safety** - TypeScript catches errors before deployment
✅ **Easy Updates** - Change code, run `cdk deploy`
✅ **Multiple Environments** - Easy to add staging/dev stacks

## Next Steps

After deployment is complete:
1. Add staging environment (new CDK stack)
2. Configure custom domain via CDK
3. Add environment variables for API keys
4. Set up CloudWatch alarms
5. Add deployment notifications
6. Configure WAF rules (if needed)
