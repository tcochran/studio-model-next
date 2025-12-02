---
name: check-build
description: Check AWS Amplify build status and diagnose failures. Use when asked about build status, build failures, or deployment issues (e.g., "did the last build fail?", "why did build 43 fail?").
---

# Check Build Status

## Overview

This skill helps you check the status of AWS Amplify builds, identify failures, and diagnose the root cause of build errors.

## Prerequisites

- AWS CLI configured with access to the Amplify app
- App ID: `dok8rg7vk45b7`
- Region: `us-east-1`
- Branch: `main`

## Usage Examples

User might ask:
- "Did the last build fail?"
- "Why did build 43 fail?"
- "What's the status of the current build?"
- "Check the latest deployment"
- "Is the build passing?"

## Step-by-Step Process

### Step 1: List Recent Builds

Get the 3 most recent builds to see overall status:

```bash
aws amplify list-jobs \
  --app-id dok8rg7vk45b7 \
  --branch-name main \
  --max-results 3 \
  --region us-east-1 \
  --query 'jobSummaries[*].[jobId,status,commitMessage]' \
  --output table
```

**Status values:**
- `RUNNING`: Build in progress
- `SUCCEED`: Build completed successfully
- `FAILED`: Build failed
- `CANCELLED`: Build was cancelled

### Step 2: Identify Failed Builds

From the list, identify any builds with `FAILED` status and note their job IDs.

### Step 3: Get Detailed Build Information

For failed builds, get full job details:

```bash
aws amplify get-job \
  --app-id dok8rg7vk45b7 \
  --branch-name main \
  --job-id <JOB_ID> \
  --region us-east-1
```

This returns:
- Build steps (BUILD, DEPLOY, VERIFY)
- Status of each step
- URLs to log files
- Commit information

### Step 4: Fetch Build Logs

Extract the `logUrl` from the failed step (usually the BUILD step) and fetch the logs:

```bash
curl -s "<LOG_URL>" | tail -100
```

**Note:** Log URLs contain temporary AWS credentials and expire after 1 hour.

### Step 5: Analyze the Failure

Common failure patterns:

**TypeScript Compilation Errors:**
```
[ERROR] TypeScript validation check failed
amplify/data/resolvers/file.ts:X:Y - error TS2307: Cannot find module
```
**Solution:** Check for missing dependencies in `amplify/package.json` or root `package.json`

**Build Command Failures:**
```
[ERROR] !!! Build failed
[ERROR] !!! Error: Command failed with exit code 1
```
**Solution:** Look at the logs just before the error for the specific failure (npm install, next build, etc.)

**Test Failures (if tests run during build):**
```
X tests failing
```
**Solution:** Review test output and fix failing tests

**Backend Deployment Errors:**
```
[ERROR] npx ampx pipeline-deploy failed
```
**Solution:** Check GraphQL schema, resolver code, or Amplify backend configuration

### Step 6: Report Findings to User

Provide a clear summary:

1. **Build Status**: Which build(s) failed
2. **Failure Point**: Which step failed (BUILD, TEST, DEPLOY)
3. **Root Cause**: Specific error message from logs
4. **Fix Applied** (if you fixed it): What you changed
5. **Next Steps**: What build is running now with the fix

## Example Interactions

### Example 1: Checking last build status

```
User: "Did the last build fail?"
Assistant: Checks build 45 (RUNNING), build 44 (FAILED)
Assistant: Fetches build 44 logs, finds missing AWS SDK dependencies
Assistant: "Build 44 failed due to missing dependencies. Fixed and pushed."
```

### Example 2: Diagnosing specific build

```
User: "Why did build 43 fail?"
Assistant: Fetches build 43 logs
Assistant: Reports specific error and explains root cause
```

## Important Notes

- Always check 2-3 recent builds for context
- Log URLs expire after 1 hour
- Most failures are in BUILD step
- If you can fix the issue, do so and report what you changed
- After pushing fixes, check that new build is triggered

## Common Fixes

1. **Missing Dependencies**: Add to `amplify/package.json` or root `package.json`
2. **TypeScript Errors**: Fix type issues, add missing imports
3. **Test Failures**: Fix failing tests or update test data
4. **Build Configuration**: Check `amplify.yml` or build settings
