# Studio Model Next

Product innovation management platform built with Next.js 15, React 19, and AWS Amplify Gen 2.

## Overview

Studio Model helps teams manage portfolios, track innovation ideas through validation stages, and maintain product knowledge bases. Built with a modular architecture for independent feature development and testing.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

### Modular Architecture

The codebase is organized into three core feature modules:

```
src/
├── features/               # Feature modules (all implementation)
│   ├── portfolios/        # Portfolio management
│   ├── ideas/             # Innovation tracking
│   └── knowledge-base/    # Documentation repository
├── shared/                # Shared components and utilities
│   ├── components/        # PageHeader, PageTitle, PageContent
│   └── utils/             # Amplify server utils, formatRelativeTime
└── app/                   # Next.js routes (thin wiring layer)
    ├── (admin)/          # Admin routes (portfolios)
    └── (product)/        # Product routes (ideas, kb)
```

### Features

#### [Portfolios](src/features/portfolios/README.md)
- Manage team organizations and products
- Add/remove product owners
- Navigate to product ideas
- **Tests**: 16 tests | **Command**: `npm run test:portfolios`

#### [Ideas](src/features/ideas/README.md)
- Track innovation through validation stages
- Sort, filter, and upvote ideas
- Visualize validation funnel
- Status history tracking
- **Tests**: 82 tests | **Command**: `npm run test:ideas`

#### [Knowledge Base](src/features/knowledge-base/README.md)
- Store and manage documentation
- Markdown support
- Download documents as .md files
- **Tests**: 18 tests | **Command**: `npm run test:kb`

## Backend

### AWS Amplify Gen 2

```
amplify/
├── data/
│   ├── resource.ts          # Combines all schemas
│   ├── schemas/
│   │   ├── portfolio-schema.ts
│   │   ├── idea-schema.ts
│   │   └── kb-schema.ts
│   └── resolvers/
│       └── ideas/
│           └── getIdeaByNumber.ts
└── package.json            # Backend dependencies
```

### Local Development

```bash
# Start Amplify sandbox (local backend)
npx ampx sandbox

# Regenerate outputs after schema changes
npx ampx sandbox --once
```

## Testing

### E2E Tests (Cypress)

Tests are organized by feature for fast feedback loops:

```bash
# Run all tests
npm run test:e2e

# Run specific feature tests
npm run test:portfolios
npm run test:ideas
npm run test:kb
npm run test:api

# Interactive mode
npm run test:e2e:ui

# Seed test data
npm run seed:test
```

### Test Structure

```
cypress/e2e/
├── portfolios/           # 16 tests
├── ideas/               # 82 tests (3 specs)
├── knowledge-base/      # 18 tests
└── api/                 # 15 tests
```

**Total**: 131 tests

## Deployment

### AWS Amplify Hosting

- **Production URL**: https://main.dok8rg7vk45b7.amplifyapp.com
- **Auto-deploys**: Every push to main branch
- **Build**: Tests run automatically in Amplify test phase

### Build Configuration

See [amplify.yml](amplify.yml) for build settings.

### Troubleshooting Builds

Use the `check-build` skill to diagnose failures:

```bash
# Check if last build failed
"Did the last build fail?"

# Investigate specific build
"Why did build 43 fail?"
```

## Development Workflow

### Adding a New Feature

1. **Create feature directory**: `src/features/{feature-name}/`
2. **Add components**: Page components and UI components
3. **Create queries/mutations**: Server and client data access
4. **Add routes**: Thin wiring in `src/app/`
5. **Write tests**: E2E tests in `cypress/e2e/{feature}/`
6. **Document**: Create feature README.md

### Making Changes

1. Read existing code before modifying
2. Run feature-specific tests during development
3. Run full test suite before committing
4. Update documentation if needed

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Backend**: AWS Amplify Gen 2 (AppSync GraphQL, DynamoDB)
- **Testing**: Cypress with mochawesome reporter
- **Hosting**: AWS Amplify Hosting
- **CI/CD**: Automated via Amplify build process

## Scripts

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run start               # Start production server
npm run lint                # Run ESLint

# Testing
npm run test:e2e            # Full E2E test suite
npm run test:portfolios     # Portfolio tests only
npm run test:ideas          # Ideas tests only
npm run test:kb             # KB tests only
npm run test:api            # API tests only
npm run test:e2e:ui         # Interactive Cypress UI

# Data Seeding
npm run seed:test           # Seed test data (fast ~2s)
npm run seed:portfolios     # Seed full portfolio data (~10s)
```

## Documentation

- [CLAUDE.md](CLAUDE.md) - Project context for AI assistants
- [spec/](spec/) - Technical specifications
- [Spec 32: Modular Architecture](spec/32-modular-architecture.md) - Architecture overview

### Feature Documentation

- [Portfolios Feature](src/features/portfolios/README.md)
- [Ideas Feature](src/features/ideas/README.md)
- [Knowledge Base Feature](src/features/knowledge-base/README.md)

## Contributing

1. Follow TDD - write tests first
2. Keep changes minimal and focused
3. Use feature-specific test commands during development
4. Run full test suite before pushing
5. Update documentation when adding features

## Architecture Principles

- **Modular design**: Features are independent and testable in isolation
- **Thin routing layer**: Routes in `src/app/` just import from features
- **Clear boundaries**: Shared code in `src/shared/`, features in `src/features/`
- **Test organization**: Tests organized by feature for fast feedback
- **Documentation**: Each feature has comprehensive README

## License

Private project.

---

**Last updated**: 2025-12-02
