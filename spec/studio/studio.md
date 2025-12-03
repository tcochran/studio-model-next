# Studio Feature Specification

## Overview

A Studio represents a team of users who collaborate together on one or more portfolios. This feature introduces user management, simple session-based authentication, and portfolio access control.

## Data Model

### Studio Schema

```typescript
type Studio = {
  id: string;
  name: string;
  portfolioIds: string[]; // Links to one or more portfolios
  createdAt: string;
  updatedAt: string;
}

type StudioUser = {
  id: string;
  studioId: string;
  email: string; // Unique identifier for the user
  role: UserRole;
  specialization: string; // Role-specific specialization options
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

**Engineer:**
- Frontend
- Backend
- Full Stack
- Mobile
- DevOps
- Data Engineering
- Machine Learning
- QA/Test Automation

**Product Manager:**
- Product Strategy
- Technical Product
- Growth Product
- Platform Product
- Analytics Product

**Designer:**
- UX Design
- UI Design
- Product Design
- Visual Design
- Interaction Design
- Design Systems

**Project Manager:**
- Agile/Scrum
- Waterfall
- Technical Program Manager
- Delivery Manager

**Researcher:**
- User Research
- Market Research
- Data Analysis
- UX Research
- Quantitative Research
- Qualitative Research

## Database Schema (DynamoDB)

### Studio Table
```
Table: Studio
Primary Key: id (String)
Attributes:
  - id: String
  - name: String
  - portfolioIds: List<String>
  - createdAt: String (ISO timestamp)
  - updatedAt: String (ISO timestamp)
```

### StudioUser Table
```
Table: StudioUser
Primary Key: id (String)
GSI: EmailIndex
  - PK: email (String)
  - SK: studioId (String)
Attributes:
  - id: String
  - studioId: String
  - email: String
  - role: String (enum)
  - specialization: String
  - createdAt: String (ISO timestamp)
  - updatedAt: String (ISO timestamp)
```

## Authentication Flow

### Phase 1: Simple Email-Based Sessions (No Password)

1. **Login Screen** (`/login`)
   - Single input field for email address
   - "Sign In" button
   - No password required
   - Simple, clean design

2. **Session Management**
   - Store email in Next.js session/cookie
   - Session persists across page refreshes
   - No server-side validation (Phase 1)

3. **Logout**
   - "Logout" button in header/navigation
   - Clears session and redirects to login

### Login Screen UI

```tsx
// /app/login/page.tsx
- Email input field (type="email", required)
- "Sign In" button
- Simple centered layout
- No registration or password recovery
```

## Access Control & Navigation

### On Login

1. **Check if user exists** (by email in StudioUser table)
2. **Determine portfolio access:**
   - If user is an **owner** on any portfolio → Redirect to first owned portfolio's products page
   - If user is part of a **studio** linked to portfolios → Show portfolio selection or default to first portfolio
   - If user has no access → Show "No Access" message

### Portfolio Access Rules

- **Portfolio Owner:** Direct access via Portfolio.owners field
- **Studio Member:** Access via Studio.portfolioIds linkage

### Navigation After Login

```
User Login → Check Access → Route User:

1. Portfolio Owner?
   YES → /{portfolioCode}/{firstProductCode}/ideas
   NO  → Check Studio Membership

2. Studio Member?
   YES → /{firstPortfolioCode}/{firstProductCode}/ideas
   NO  → /no-access (message: "You don't have access to any portfolios")
```

## UI Components

### Login Page

**Location:** `/app/login/page.tsx`

**Layout:**
- Centered card design
- Studio Model logo/title at top
- Email input field
- "Sign In" button
- Footer text: "Simple session-based login - no password required"

**Validation:**
- Email format validation
- Required field

### Logout Button

**Location:** Global navigation header

**Behavior:**
- Click → Clear session → Redirect to `/login`
- Show confirmation dialog optional (keep it simple)

### Protected Routes

All existing routes should check for authenticated session:
- If no session → Redirect to `/login`
- If session exists → Check portfolio access
- If no access → Show error or redirect to `/no-access`

## Implementation Steps

### Step 1: Database Schema
- [ ] Add Studio model to amplify/data/resource.ts
- [ ] Add StudioUser model with email GSI
- [ ] Update Portfolio model to link with Studio (if not already linked)
- [ ] Run amplify deployment

### Step 2: Authentication Middleware
- [ ] Create session management utility (Next.js middleware or server utils)
- [ ] Store/retrieve email in session
- [ ] Create protected route wrapper

### Step 3: Login Page
- [ ] Create `/app/login/page.tsx`
- [ ] Email input + Sign In button
- [ ] Session creation on submit
- [ ] Redirect logic based on portfolio access

### Step 4: Logout Functionality
- [ ] Add Logout button to navigation
- [ ] Clear session handler
- [ ] Redirect to login

### Step 5: Access Control
- [ ] Check portfolio ownership (Portfolio.owners)
- [ ] Check studio membership (Studio.portfolioIds + StudioUser.studioId)
- [ ] Implement routing logic based on access

### Step 6: Studio Management UI (Future)
- [ ] Create studio management pages
- [ ] Add/remove users to studio
- [ ] Assign roles and specializations
- [ ] Link studios to portfolios

## API Endpoints

### Authentication
- `POST /api/auth/login` - Create session with email
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/session` - Check current session

### Studio Management
- `GET /api/studios` - List all studios
- `POST /api/studios` - Create studio
- `GET /api/studios/:id` - Get studio details
- `PUT /api/studios/:id` - Update studio
- `DELETE /api/studios/:id` - Delete studio

### Studio Users
- `GET /api/studios/:id/users` - List users in studio
- `POST /api/studios/:id/users` - Add user to studio
- `GET /api/users/:email` - Get user by email
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Remove user from studio

## Testing

### E2E Tests (Cypress)

**File:** `cypress/e2e/auth/login.cy.ts`

- [ ] Login with valid email
- [ ] Login redirects to correct portfolio
- [ ] Logout clears session and redirects to login
- [ ] Protected routes redirect to login when not authenticated
- [ ] User with owner access sees owned portfolio
- [ ] User with studio access sees studio portfolio
- [ ] User with no access sees "No Access" message

**File:** `cypress/e2e/studio/studio-management.cy.ts`

- [ ] Create studio
- [ ] Add users to studio
- [ ] Assign roles and specializations
- [ ] Link studio to portfolio
- [ ] Remove user from studio
- [ ] Delete studio

## Future Enhancements

### Phase 2: Real Authentication
- Password-based auth
- OAuth integration (Google, GitHub)
- AWS Cognito integration
- Password reset flow

### Phase 3: Permissions & Roles
- Role-based permissions (read/write/admin)
- Portfolio-level permissions
- Idea-level permissions

### Phase 4: Studio Features
- Studio analytics
- Team activity feed
- User profiles
- Invitation system (email invites)

## Notes

- This is Phase 1: Simple email-based sessions with no password
- No encryption or security validation in Phase 1
- Focus on establishing data model and basic access control
- Security hardening will come in Phase 2
- Session storage: Next.js session cookies (iron-session or similar)

## Related Specs

- [24-multi-tenancy.md](../24-multi-tenancy.md) - Portfolio ownership model
- [16-api.md](../16-api.md) - API design patterns
- [32-modular-architecture.md](../32-modular-architecture.md) - Code organization

## Questions to Resolve

1. Should we allow one user to be in multiple studios?
   - **Answer:** Yes - users can be in multiple studios (join multiple teams)

2. What happens if a user is both an owner AND a studio member?
   - **Answer:** Owner access takes precedence (show owned portfolio first)

3. Should we show portfolio selection if user has access to multiple portfolios?
   - **Answer:** Phase 1 - default to first portfolio. Phase 2 - add portfolio switcher

4. How do we handle user removal from studio while they're logged in?
   - **Answer:** Phase 1 - next request will check access. Phase 2 - add real-time session validation
