---
name: implement-idea
description: Guide implementation of backlog ideas through a collaborative workflow. Start by fetching idea details from MCP, create specification, write tests, get user approval at each step, then implement. Use when asked to implement, build, or develop a feature from the product backlog.
---

# Implement Idea

## Workflow Overview

This skill guides you through a **collaborative, approval-based workflow** for implementing features from the product backlog. The user must approve key decisions before proceeding to implementation.

## Step-by-Step Process

### Step 1: Fetch Idea from MCP
- Use `mcp__product-flow__get_idea` to fetch the idea details
- Parameters: portfolioCode (e.g., "routeburn"), productCode (e.g., "product-flow"), ideaNumber
- Review the idea name, hypothesis, and any existing context

### Step 2: Create Specification Document
- Create a new spec file in `spec/` directory (e.g., `spec/31-feature-name.md`)
- Use the spec number from the idea number
- Include these sections:
  - **Status**: Draft (will be updated to Complete later)
  - **Created**: Current date
  - **Overview**: What the feature does
  - **Requirements**: Functional and technical requirements
  - **Implementation Plan**: Files to create/modify, approach
  - **Test Plan**: What needs to be tested
  - **ASK USER**: If there are unclear things in the requirements ask the user for clarifications, don't guess

### Step 3: Write Tests (TDD)
- Based on approved spec, write Cypress E2E tests in `cypress/e2e/`
- Review existing test patterns in the codebase for consistency
- Test file naming: `feature-name.cy.ts`
- Include:
  - Setup/teardown
  - Happy path scenarios
  - Edge cases
  - Error handling
- **ASK USER**: Show the test plan and him to review:
- **WAIT**: Do not proceed until user approves the tests

### Step 4: Implement the Feature
**ONLY PROCEED AFTER USER APPROVAL OF STEPS 2, AND 3**

- Follow Next.js 15 + React 19 conventions
- Use Tailwind CSS for styling (custom button color: `bg-[rgb(247,71,64)]`)
- Keep code simple and focused - avoid over-engineering
- Write self-documenting code with clear variable names
- Only add comments where logic is complex or non-obvious
- Match existing patterns in the codebase

**Backend Changes (if needed):**
- Update GraphQL schema in `amplify/data/resource.ts`
- Add custom queries/mutations/subscriptions as needed
- Run `npx ampx sandbox --once` to regenerate local outputs
- Test with local sandbox before pushing

### Step 5: Run Tests
- Run all tests: `unset ELECTRON_RUN_AS_NODE && npx cypress run`
- **If tests fail**: Fix the implementation and re-run tests
- **If tests pass**: Show results to user and proceed

### Step 6: Update Documentation
- Update spec file:
  - Change status from "Draft" to "Complete"
  - Add "Completed" date field
- Update CLAUDE.md if project structure or conventions changed
- No additional documentation files unless explicitly requested

### Step 7: Commit & Push
**ONLY AFTER USER APPROVAL**

- **ASK USER**: "Ready to commit and push? This will auto-deploy to production."
- **WAIT**: Do not commit until user confirms
- Commit ALL changed files with clear, descriptive message
- Git status must be completely clean (no unstaged or untracked files)
- Include spec number in commit message
- Push to main branch (auto-deploys to AWS Amplify)
- Production URL: https://main.dok8rg7vk45b7.amplifyapp.com

## Critical Rules

1. **Never skip approval gates** - wait for user confirmation at each step
2. **Ask clarifying questions** - don't make assumptions about requirements
3. **Show your work** - present specs, tests, and code for review before proceeding
4. **Test-Driven Development** - write tests before implementation
5. **Clean git state** - commit all files or clean them up completely

## Example Interaction

```
User: "Implement idea #31"