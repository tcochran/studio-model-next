# CLAUDE.MD

## Project Overview

**Project Name:** studio-model-next

This file provides context and guidelines for AI assistants working in this codebase.

## Project Structure

```
studio-model-next/
├── .claude/              # Claude Code configuration
│   └── skills/           # Custom Claude Code skills
├── amplify/              # AWS Amplify Gen 2 backend (data schema, auth)
│   ├── data/
│   │   ├── resource.ts   # GraphQL schema definitions
│   │   └── resolvers/    # Custom Lambda resolvers
│   └── package.json      # Backend-specific dependencies (AWS SDK)
├── src/
│   ├── app/              # Next.js App Router pages
│   └── utils/            # Utility functions (Amplify server utils)
├── cypress/              # Cypress E2E tests
│   ├── e2e/              # Test specs
│   └── support/          # Test utilities and constants
├── scripts/              # Utility scripts (data seeding)
├── spec/                 # Technical specifications and documentation
├── amplify.yml           # Amplify build configuration
└── claude.md             # This file
```

## Development Guidelines

### Code Style
- Follow consistent naming conventions
- Write clear, self-documenting code
- Add comments only where logic isn't self-evident

### Best Practices
- Keep functions focused and single-purpose
- Avoid over-engineering solutions
- Only add error handling at system boundaries
- Delete unused code completely rather than commenting it out

## Working with This Project

### Before Making Changes
1. Read existing code before modifying
2. Understand current patterns and conventions
3. Make minimal changes to accomplish the task

### Testing
- Uses Cypress with mochawesome reporter for E2E tests
- Tests are in `cypress/e2e/`
- Test data constants are in `cypress/support/test-paths.ts`
- **Important:** Always unset `ELECTRON_RUN_AS_NODE` before running Cypress tests (required when running from VSCode)
- Run headless: `unset ELECTRON_RUN_AS_NODE && npx cypress run`
- Interactive mode: `unset ELECTRON_RUN_AS_NODE && npx cypress open`
- Full E2E test suite: `npm run test:e2e` (seeds test data, builds, and runs all tests)
- CI/CD runs tests automatically on every deployment via Amplify test phase

#### Seeding Test Data
- **For testing:** `npm run seed:test` - Fast (~2s), seeds only test portfolio data
- **For development:** `npm run seed:portfolios` - Full seed (~10s), includes routeburn portfolio with 25 ideas
- Test seed script only creates the "test" portfolio with 5 test ideas
- Tests use hard-coded constants from `cypress/support/test-paths.ts` that match the seed data
- The `test:e2e` script automatically runs `seed:test` before building and running tests

### Local Development
- Run dev server: `npm run dev`
- Run Amplify sandbox for local backend: `npx ampx sandbox`
- Local development uses the sandbox schema (separate from production)
- After schema changes, regenerate local outputs: `npx ampx sandbox --once`
- Safe to regenerate `amplify_outputs.json` locally without affecting production

### Backend Development
- Custom resolvers are in `amplify/data/resolvers/`
- Resolvers require AWS SDK dependencies in `amplify/package.json`
- Install amplify dependencies: `cd amplify && npm install`
- The `amplify.yml` build script installs these dependencies automatically during deployment

### Dependencies
- Frontend: Next.js 15, React 19, Tailwind CSS
- Backend: AWS Amplify Gen 2 (AppSync GraphQL, DynamoDB)
- Testing: Cypress, mochawesome
- Hosting: AWS Amplify Hosting

## Important Notes

- This project uses TDD (Test-Driven Development)
- Never write functionality without tests first
- AWS Amplify auto-deploys on every push to main branch
- Production URL: https://main.dok8rg7vk45b7.amplifyapp.com
- For writing, never use emdashes
- Update this file as the project structure and conventions evolve

### Build Troubleshooting
- Use the `check-build` skill to diagnose Amplify build failures
- Check build status: "Did the last build fail?"
- Investigate failures: "Why did build 43 fail?"
- The skill automatically fetches logs and provides root cause analysis

### Claude Code Skills
- **implement-idea**: Guide for implementing backlog ideas through a collaborative workflow
- **check-build**: Diagnose AWS Amplify build failures and identify root causes

### Git Workflow
- When committing, always commit all changed files or clean them up
- Git status should be empty after a commit (no unstaged or untracked files related to the work)
- Never leave partial changes uncommitted

---

*Last updated: 2025-12-02*
