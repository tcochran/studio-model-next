# CLAUDE.MD

## Project Overview

**Project Name:** studio-model

This file provides context and guidelines for AI assistants working in this codebase.

## Project Structure

```
studio-model/
├── app/                  # SvelteKit frontend application
├── infra/                # AWS CDK infrastructure (Amplify deployment)
├── spec/                 # Technical specifications and documentation
├── docs/                 # Project documentation
└── CLAUDE.MD             # This file
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
- Run headless: `unset ELECTRON_RUN_AS_NODE && npm run cypress:run`
- Interactive mode: `unset ELECTRON_RUN_AS_NODE && npm run cypress`
- CI/CD runs tests automatically on every deployment via Amplify test phase

### Dependencies
- Frontend: SvelteKit, Svelte 5, Vite
- Testing: Cypress, mochawesome
- Infrastructure: AWS CDK, AWS Amplify

## Important Notes

- This project uses TDD (Test-Driven Development)
- Never write functionality without tests first
- AWS Amplify auto-deploys on every push to main branch
- Production URL: https://main.d24d3rnj7cl289.amplifyapp.com
- Update this file as the project structure and conventions evolve

## Contact & Resources

- (Add relevant links and contact information)

---

*Last updated: 2025-11-30*
- for writing never use emdashes
- memory this project is going to implement a TDD approach, we can't write functionality without a test