---
name: implement-idea
description: Implement a feature from the product backlog following TDD practices. Use when asked to build, create, or develop a new feature with proper tests, documentation, and git workflow for studio-model-next.
---

# Implement Idea

## Instructions

### 1. Understand the Requirement
- Get the idea number from the user or MCP server using `mcp__product-flow__get_idea`
- Read the corresponding spec from `spec/` directory (e.g., `spec/25-feature-name.md`)
- Review existing code patterns in `src/` to understand the architecture
- Check similar features to maintain consistency

### 2. Follow TDD (Test-Driven Development)
- **CRITICAL**: Write Cypress E2E tests FIRST in `cypress/e2e/` before implementing
- Review existing test patterns in the codebase
- Tests must pass before the feature is considered complete
- Always run: `unset ELECTRON_RUN_AS_NODE && npx cypress run`
- Use mochawesome reporter (already configured)

### 3. Implement the Feature
- Follow Next.js 15 + React 19 conventions
- Use Tailwind CSS for styling (no custom CSS unless necessary)
- Keep code simple and focused - avoid over-engineering
- Write self-documenting code with clear variable names
- Only add comments where logic is complex or non-obvious
- Match existing patterns in the codebase

### 4. Backend Changes (if needed)
- Update GraphQL schema in `amplify/data/resource.ts`
- Add custom queries/mutations/subscriptions as needed
- Run `npx ampx sandbox --once` to regenerate local outputs
- Test with local sandbox before pushing to production
- Safe to regenerate `amplify_outputs.json` locally

### 5. Testing & Validation
- Run all tests: `unset ELECTRON_RUN_AS_NODE && npx cypress run`
- Fix any test failures immediately
- Test manually in browser (http://localhost:3000)
- Verify both light and dark modes work
- Check responsive design on different screen sizes

### 6. Documentation
- Update spec file status to "Complete" with completion date
- Add "Completed" date field to spec frontmatter
- Update CLAUDE.md if project structure or conventions change
- No need for additional documentation files unless explicitly requested

### 7. Commit & Push
- **CRITICAL**: Commit ALL changed files with clear, descriptive message
- Git status must be completely clean (no unstaged or untracked files)
- Follow commit message format: "Verb noun with details"
- Include spec number in commit if applicable
- Push to main branch (auto-deploys to AWS Amplify)
- Production URL: https://main.dok8rg7vk45b7.amplifyapp.com

## Examples

**Usage examples:**
- "Implement idea #31 from the backlog"
- "Build the search feature from spec 25"
- "Create the analytics dashboard with tests"
- "Add user profile editing functionality"

**What this skill does:**
- Fetches idea details from MCP server
- Reads specification files
- Writes tests first (TDD)
- Implements the feature
- Runs all tests to verify
- Updates documentation
- Commits and pushes changes

## Project Context

### Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: AWS Amplify Gen 2 (AppSync GraphQL, DynamoDB)
- **Testing**: Cypress E2E tests with mochawesome reporter
- **Deployment**: AWS Amplify Hosting (auto-deploy on push to main)

### Development Workflow
1. Test-Driven Development (TDD) is mandatory
2. Write tests before implementation
3. All tests must pass before committing
4. Clean git status before pushing
5. Auto-deployment triggers on push

### Important Notes
- Never write code without tests first
- Always use `unset ELECTRON_RUN_AS_NODE` before Cypress (required in VSCode)
- Custom button color: RGB(247, 71, 64) - use `bg-[rgb(247,71,64)]`
- Validation status colors: First Level = blue, Second Level = purple, Scaling = green
- Max content width: `max-w-7xl` for idea pages, `max-w-5xl` for portfolio pages
- Never use emdashes in writing
- Commit ALL files or clean them up - git status should be empty after commit

### File Structure
```
studio-model-next/
├── amplify/              # AWS Amplify Gen 2 backend
│   └── data/
│       └── resource.ts   # GraphQL schema
├── src/
│   ├── app/              # Next.js App Router pages
│   └── utils/            # Utility functions
├── cypress/
│   └── e2e/              # E2E test specs
├── spec/                 # Technical specifications
└── .claude/
    └── skills/           # Claude Code skills
```

### Commands Reference
- **Dev server**: `npm run dev`
- **Amplify sandbox**: `npx ampx sandbox`
- **Regenerate outputs**: `npx ampx sandbox --once`
- **Tests (headless)**: `unset ELECTRON_RUN_AS_NODE && npx cypress run`
- **Tests (interactive)**: `unset ELECTRON_RUN_AS_NODE && npx cypress open`
