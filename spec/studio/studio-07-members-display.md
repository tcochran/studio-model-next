# Studio Feature - Part 7: Display Studio Members

## Overview

Display a list of all members in the current studio, showing their role, specialization, and contact information.

## Location

**Path:** `/studio/members` (or accessible via studio settings/info page)

## Page Design

### Header
- Title: "Studio Members"
- Subtitle: Shows studio name
- Optional: "Add Member" button (Phase 2)

### Members List

Display members in a card-based layout:

```
┌─────────────────────────────────────────┐
│ Product Managers                        │
├─────────────────────────────────────────┤
│ ✉ pm@test.com                          │
│ Specialization: Product Strategy        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Engineers                               │
├─────────────────────────────────────────┤
│ ✉ engineer@test.com                    │
│ Specialization: Full Stack              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Designers                               │
├─────────────────────────────────────────┤
│ ✉ designer@test.com                    │
│ Specialization: UI/UX Design            │
└─────────────────────────────────────────┘
```

## Component Structure

### Page Component

```tsx
// src/app/(authenticated)/studio/members/page.tsx
import StudioMembersPage from '@/studio/components/StudioMembersPage';

export default StudioMembersPage;
```

### Members Page Component

```tsx
// src/studio/components/StudioMembersPage.tsx
import { getSession } from '@/studio/utils/session';
import { cookiesClient } from '@/shared/utils/amplify-server-utils';

export default async function StudioMembersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Get current user's studio
  const studioUser = await cookiesClient.models.StudioUser.list({
    filter: { email: { eq: session.email } },
  });

  if (!studioUser.data?.[0]) {
    return <div>No studio found</div>;
  }

  // Get studio details
  const studio = await cookiesClient.models.Studio.get({
    id: studioUser.data[0].studioId
  });

  // Get all studio members
  const members = await cookiesClient.models.StudioUser.list({
    filter: { studioId: { eq: studioUser.data[0].studioId } },
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <PageHeader studioName={studio.data?.name} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Studio Members</h1>
        <p className="text-gray-600 mb-8">{studio.data?.name}</p>

        <MembersList members={members.data || []} />
      </main>
    </div>
  );
}
```

### Members List Component

```tsx
// src/studio/components/MembersList.tsx
'use client';

type Member = {
  email: string;
  role: string;
  specialization?: string;
};

type MembersListProps = {
  members: Member[];
};

const ROLE_LABELS = {
  product_manager: 'Product Managers',
  engineer: 'Engineers',
  designer: 'Designers',
  project_manager: 'Project Managers',
  researcher: 'Researchers',
};

export default function MembersList({ members }: MembersListProps) {
  // Group members by role
  const membersByRole = members.reduce((acc, member) => {
    const role = member.role || 'unknown';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  return (
    <div className="space-y-8">
      {Object.entries(membersByRole).map(([role, roleMembers]) => (
        <div key={role}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roleMembers.map((member) => (
              <div
                key={member.email}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">✉</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.email}</p>
                    {member.specialization && (
                      <p className="text-sm text-gray-600 mt-1">
                        {member.specialization}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Styling

- Use card-based layout for clean separation
- Group by role with clear section headers
- Show email as primary identifier
- Display specialization as secondary info
- Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

## Data Flow

1. Get current user's session
2. Look up user's studio via StudioUser table
3. Fetch all StudioUser records for that studio
4. Group by role
5. Display in organized layout

## Navigation Access

Add link to studio members from:
- Navigation menu/header (Phase 2)
- Studio settings dropdown (Phase 2)
- For now: Direct URL access

## Future Enhancements (Phase 2)

- Add "Add Member" button with email invite flow
- Show member status (active, pending invite)
- Allow role/specialization editing
- Remove member functionality
- Show member activity/last seen
- Filter/search members
- Member profile pages

## Testing

### E2E Tests

**File:** `cypress/e2e/studio/members.cy.ts`

Test cases:
- [ ] Members page displays studio name
- [ ] All studio members are shown
- [ ] Members are grouped by role
- [ ] Email addresses are displayed
- [ ] Specializations are shown
- [ ] Non-members cannot access the page
- [ ] Page is accessible from authenticated routes

### Test Example

```typescript
describe('Studio Members', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('pm@test.com');
    cy.get('button[type="submit"]').click();
  });

  it('displays studio members grouped by role', () => {
    cy.visit('/studio/members');

    // Check studio name
    cy.contains('Test Studio').should('be.visible');

    // Check role sections
    cy.contains('Product Managers').should('be.visible');
    cy.contains('Engineers').should('be.visible');
    cy.contains('Designers').should('be.visible');

    // Check member emails
    cy.contains('pm@test.com').should('be.visible');
    cy.contains('engineer@test.com').should('be.visible');
    cy.contains('designer@test.com').should('be.visible');
  });

  it('shows member specializations', () => {
    cy.visit('/studio/members');

    cy.contains('Product Strategy').should('be.visible');
    cy.contains('Full Stack').should('be.visible');
    cy.contains('UI/UX Design').should('be.visible');
  });
});
```

## Implementation Files

```
src/
  app/
    (authenticated)/
      studio/
        members/
          page.tsx           # Route for studio members page
  studio/
    components/
      StudioMembersPage.tsx  # Main page component
      MembersList.tsx        # Members list with grouping
cypress/
  e2e/
    studio/
      members.cy.ts          # E2E tests
```

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-01-data-schema.md](./studio-01-data-schema.md) - StudioUser schema
- [studio-02-authentication.md](./studio-02-authentication.md) - Session management
- [studio-03-navigation.md](./studio-03-navigation.md) - Navigation integration

## Implementation Checklist

- [ ] Create `/studio/members` route
- [ ] Create StudioMembersPage component
- [ ] Create MembersList component with role grouping
- [ ] Add role labels mapping
- [ ] Style member cards
- [ ] Add session validation
- [ ] Write E2E tests
- [ ] Add navigation link (Phase 2)
