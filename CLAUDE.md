# CLAUDE.MD

## Project Overview

**Project Name:** studio-model-next

This file provides context and guidelines for AI assistants working in this codebase.

## Project Structure

```
studio-model-next/
├── amplify/              # AWS Amplify Gen 2 backend (data schema, auth)
├── src/
│   ├── app/              # Next.js App Router pages
│   └── utils/            # Utility functions (Amplify server utils)
├── cypress/              # Cypress E2E tests
│   └── e2e/              # Test specs
├── spec/                 # Technical specifications and documentation
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
- **Important:** Always unset `ELECTRON_RUN_AS_NODE` before running Cypress tests (required when running from VSCode)
- Run headless: `unset ELECTRON_RUN_AS_NODE && npx cypress run`
- Interactive mode: `unset ELECTRON_RUN_AS_NODE && npx cypress open`
- CI/CD runs tests automatically on every deployment via Amplify test phase

### Local Development
- Run dev server: `npm run dev`
- Run Amplify sandbox for local backend: `npx ampx sandbox`
- Local development uses the sandbox schema (separate from production)
- After schema changes, regenerate local outputs: `npx ampx sandbox --once`
- Safe to regenerate `amplify_outputs.json` locally without affecting production

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

### Git Workflow
- When committing, always commit all changed files or clean them up
- Git status should be empty after a commit (no unstaged or untracked files related to the work)
- Never leave partial changes uncommitted

---

*Last updated: 2025-12-01*
