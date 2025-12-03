# Studio Feature - Part 1: Data Schema

## Overview

Define the database schema for Studios and StudioUsers with a simplified 1:1 relationship between Studio and Portfolio.

## Data Model Changes

### Simplified Studio Schema

Since we have a 1:1 relationship between Studio and Portfolio, we simplify the data model:

```typescript
type Studio = {
  id: string;
  name: string;
  portfolioId: string; // Single portfolio ID (not array)
  createdAt: string;
  updatedAt: string;
}

type StudioUser = {
  id: string;
  studioId: string;
  email: string; // Unique identifier (primary way to identify users)
  role: UserRole;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

enum UserRole {
  ENGINEER = "engineer",
  PRODUCT_MANAGER = "product_manager",
  DESIGNER = "designer",
  PROJECT_MANAGER = "project_manager",
  RESEARCHER = "researcher"
}
```

### Specialization Options by Role

See main [studio.md](./studio.md) for complete list of specializations per role.

## DynamoDB Schema

### Studio Table

```typescript
Table: Studio
Primary Key: id (String)
GSI: PortfolioIndex
  - PK: portfolioId (String)

Attributes:
  - id: String (UUID)
  - name: String
  - portfolioId: String (references Portfolio.id)
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)
```

**Note:** The GSI on `portfolioId` allows us to quickly look up which studio belongs to a portfolio.

### StudioUser Table

```typescript
Table: StudioUser
Primary Key: id (String)
GSI: EmailIndex
  - PK: email (String)
GSI: StudioIndex
  - PK: studioId (String)

Attributes:
  - id: String (UUID)
  - studioId: String (references Studio.id)
  - email: String (lowercase, unique per studio)
  - role: String (UserRole enum value)
  - specialization: String
  - createdAt: String (ISO 8601 timestamp)
  - updatedAt: String (ISO 8601 timestamp)
```

**Indexes Explanation:**
- **EmailIndex:** Allows looking up a user by email address (for login)
- **StudioIndex:** Allows listing all users in a studio

## AWS Amplify Gen 2 Schema

Add to `amplify/data/resource.ts`:

```typescript
const schema = a.schema({
  // ... existing models ...

  Studio: a.model({
    id: a.id().required(),
    name: a.string().required(),
    portfolioId: a.string().required(),
    users: a.hasMany('StudioUser', 'studioId'),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
    .authorization((allow) => [allow.publicApiKey()]),

  StudioUser: a.model({
    id: a.id().required(),
    studioId: a.string().required(),
    studio: a.belongsTo('Studio', 'studioId'),
    email: a.string().required(),
    role: a.enum([
      'engineer',
      'product_manager',
      'designer',
      'project_manager',
      'researcher'
    ]),
    specialization: a.string().required(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
    .authorization((allow) => [allow.publicApiKey()]),
});
```

## Data Constraints & Validation

### Business Rules

1. **Studio-Portfolio Relationship:**
   - One Studio → One Portfolio
   - One Portfolio → One Studio (enforced at application level)
   - portfolioId must reference a valid Portfolio

2. **Studio User Requirements:**
   - email is required and should be lowercase
   - role is required (must be one of enum values)
   - specialization is required
   - email should be unique within a studio (enforced at application level)

3. **Portfolio Owner Constraint:**
   - All Portfolio owners (Portfolio.owners array) MUST be members of the portfolio's studio
   - This is enforced at the application level when adding owners
   - Seed script will ensure existing owners are added to studios

## Migration Strategy

### Phase 1: Schema Deployment

1. Add Studio and StudioUser models to amplify schema
2. Deploy schema changes via `npx ampx sandbox` (local) or CI/CD pipeline (production)
3. Verify tables and GSIs are created

### Phase 2: Data Migration (Seed Script)

Create migration seed script that:

1. For each existing Portfolio:
   - Create a Studio with name: `{Portfolio.name} Studio`
   - Link Studio to Portfolio via `portfolioId`

2. For each Portfolio owner in `Portfolio.owners` array:
   - Create a StudioUser record
   - Set email from owner string
   - Set role to `product_manager` (default)
   - Set specialization to `Product Strategy` (default)
   - Link to the portfolio's studio

3. Log all migrations for verification

## Testing

### Unit Tests

Test data validation:
- Email format validation
- Required field checks
- Enum value validation

### Integration Tests

- Create studio and verify it links to portfolio
- Create studio user and verify it links to studio
- Query studio by portfolioId
- Query studio users by email
- Query studio users by studioId

### E2E Tests (Cypress)

See [studio-06-testing.md](./studio-06-testing.md) for E2E test specifications.

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-02-authentication.md](./studio-02-authentication.md) - Login flow
- [studio-05-seed-script.md](./studio-05-seed-script.md) - Migration script

## Implementation Checklist

- [ ] Add Studio model to amplify/data/resource.ts
- [ ] Add StudioUser model with indexes
- [ ] Add UserRole enum
- [ ] Deploy schema changes locally
- [ ] Test schema with sample data
- [ ] Deploy schema to production
- [ ] Create migration seed script (see Part 5)
- [ ] Run migration on existing data
- [ ] Verify all portfolio owners are in studios
