# Studio Feature - Part 5: Seed Script & Data Migration

## Overview

Create a seed script to migrate existing portfolios to the Studio model and populate test data for development.

## Migration Strategy

### Phase 1: Add Studio Data to Existing Portfolios

1. Query all existing portfolios
2. For each portfolio:
   - Create a new Studio with name "{Portfolio Name} Studio"
   - Link the studio to the portfolio (1:1 relationship)
   - Find the portfolio owner (via `owner` field)
   - Create a StudioUser record for the owner with role "product_manager"

### Phase 2: Enforce Database Constraints

After migration is complete:
- Add database-level validation that every portfolio must have a studio
- Add validation that portfolio owner must be a studio member

## Seed Script Implementation

### Main Seed Script

```typescript
// scripts/seed-studios.ts
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { portfolios } from '@/seed-data/portfolios';

const client = generateClient<Schema>();

async function seedStudios() {
  console.log('Starting studio migration...');

  for (const portfolio of portfolios) {
    console.log(`Processing portfolio: ${portfolio.name}`);

    // Create studio
    const studio = await client.models.Studio.create({
      name: `${portfolio.name} Studio`,
      portfolioId: portfolio.id,
    });

    if (!studio.data) {
      console.error(`Failed to create studio for ${portfolio.name}`);
      continue;
    }

    // Create studio user for portfolio owner
    const studioUser = await client.models.StudioUser.create({
      studioId: studio.data.id,
      email: portfolio.owner.toLowerCase(),
      role: 'product_manager',
      specialization: 'Product Management',
    });

    if (!studioUser.data) {
      console.error(`Failed to create studio user for ${portfolio.owner}`);
      continue;
    }

    console.log(`✓ Created studio "${studio.data.name}" with owner ${portfolio.owner}`);
  }

  console.log('Studio migration complete!');
}

seedStudios().catch(console.error);
```

### Test Data Seed Script

For development and testing, create additional studio users with various roles:

```typescript
// scripts/seed-test-studios.ts
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

async function seedTestStudios() {
  // Get the "test" portfolio
  const portfolios = await client.models.Portfolio.list({
    filter: { name: { eq: 'test' } }
  });

  if (!portfolios.data?.[0]) {
    console.error('Test portfolio not found');
    return;
  }

  const testPortfolio = portfolios.data[0];

  // Create test studio
  const studio = await client.models.Studio.create({
    name: 'Test Studio',
    portfolioId: testPortfolio.id,
  });

  if (!studio.data) {
    console.error('Failed to create test studio');
    return;
  }

  // Create multiple test users with different roles
  const testUsers = [
    { email: 'pm@test.com', role: 'product_manager', specialization: 'Product Strategy' },
    { email: 'engineer@test.com', role: 'engineer', specialization: 'Full-Stack Development' },
    { email: 'designer@test.com', role: 'designer', specialization: 'UI/UX Design' },
    { email: 'pm2@test.com', role: 'project_manager', specialization: 'Agile Project Management' },
    { email: 'researcher@test.com', role: 'researcher', specialization: 'User Research' },
  ];

  for (const user of testUsers) {
    await client.models.StudioUser.create({
      studioId: studio.data.id,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
    });
    console.log(`✓ Created test user: ${user.email} (${user.role})`);
  }

  console.log('Test studio seeding complete!');
}

seedTestStudios().catch(console.error);
```

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "seed:studios": "tsx scripts/seed-studios.ts",
    "seed:test-studios": "tsx scripts/seed-test-studios.ts"
  }
}
```

## Usage

### Production Migration

Run once to migrate existing portfolios:

```bash
npm run seed:studios
```

### Test Data Setup

For development and testing:

```bash
npm run seed:test-studios
```

This creates the "Test Studio" with 5 users in different roles.

## Rollback Strategy

If migration fails or needs to be reverted:

```typescript
// scripts/rollback-studios.ts
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

async function rollbackStudios() {
  console.log('Rolling back studios...');

  // Delete all studio users
  const users = await client.models.StudioUser.list();
  for (const user of users.data) {
    await client.models.StudioUser.delete({ id: user.id });
  }

  // Delete all studios
  const studios = await client.models.Studio.list();
  for (const studio of studios.data) {
    await client.models.Studio.delete({ id: studio.id });
  }

  console.log('Rollback complete!');
}

rollbackStudios().catch(console.error);
```

## Verification

After running seed scripts, verify:

```typescript
// Verify all portfolios have studios
const portfolios = await client.models.Portfolio.list();
const studios = await client.models.Studio.list();

console.log(`Portfolios: ${portfolios.data.length}`);
console.log(`Studios: ${studios.data.length}`);

// Should match
if (portfolios.data.length === studios.data.length) {
  console.log('✓ All portfolios have studios');
}

// Verify all studios have at least one user
for (const studio of studios.data) {
  const users = await client.models.StudioUser.list({
    filter: { studioId: { eq: studio.id } }
  });

  if (users.data.length === 0) {
    console.error(`✗ Studio ${studio.name} has no users!`);
  }
}
```

## Migration Checklist

- [ ] Create `scripts/seed-studios.ts`
- [ ] Create `scripts/seed-test-studios.ts`
- [ ] Create `scripts/rollback-studios.ts`
- [ ] Add npm scripts to package.json
- [ ] Test migration on sandbox environment
- [ ] Verify all portfolios have studios
- [ ] Verify all studio owners are studio members
- [ ] Run verification queries
- [ ] Document rollback procedure

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-01-data-schema.md](./studio-01-data-schema.md) - Database schema
- [studio-02-authentication.md](./studio-02-authentication.md) - Authentication flow

## Future Enhancements

- Add ability to add/remove studio members via UI
- Studio invitation flow (email invites)
- Bulk user import from CSV
- Studio templates with pre-configured roles
