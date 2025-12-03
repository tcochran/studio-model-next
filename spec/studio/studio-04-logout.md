# Studio Feature - Part 4: Logout

## Overview

Implement logout functionality in the footer that clears the session and redirects to the login page.

## Logout Button Location

**Location:** Footer (appears on all authenticated pages)

**Design:**
- Simple text link styled as underlined text
- Right-aligned in footer
- Gray color with hover state

## Logout Flow

### Step 1: User Clicks Logout

User clicks the "Logout" button in the footer.

### Step 2: Server Action

```typescript
// app/actions/auth.ts
'use server';

import { redirect } from 'next/navigation';
import { destroySession } from '@/utils/session';

export async function handleLogout() {
  // Clear session cookie
  await destroySession();

  // Redirect to login page
  redirect('/login');
}
```

### Step 3: Session Destruction

```typescript
// src/utils/session.ts
import { cookies } from 'next/headers';

export async function destroySession() {
  cookies().delete('studio_session');
}
```

### Step 4: Redirect to Login

After session is cleared, user is redirected to `/login`.

## Footer Component

```tsx
// components/Footer.tsx
import { handleLogout } from '@/app/actions/auth';

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-3 flex justify-end">
        <form action={handleLogout}>
          <button
            type="submit"
            className="text-gray-600 hover:text-gray-900 underline text-sm"
          >
            Logout
          </button>
        </form>
      </div>
    </footer>
  );
}
```

## Implementation Notes

- Use Server Action for logout (no client-side JavaScript required for basic functionality)
- Form submission triggers server action
- No confirmation dialog (keep it simple for Phase 1)
- Session cookie is httpOnly, so client JavaScript cannot access it directly

## Future Enhancements (Phase 2)

- Add confirmation dialog: "Are you sure you want to log out?"
- Add keyboard shortcut (e.g., Cmd+Shift+L)
- Add logout to mobile hamburger menu
- Track last activity time and auto-logout after inactivity

## Implementation Files

```
components/
  Footer.tsx           # Footer component with logout button
app/
  actions/
    auth.ts            # Server actions for auth (including logout)
src/
  utils/
    session.ts         # Session management (destroySession)
```

## Testing

### E2E Tests (Cypress)

**File:** `cypress/e2e/studio/logout.cy.ts`

Test cases:
- [ ] Logout button is visible in footer on all pages
- [ ] Clicking logout redirects to login page
- [ ] Session is cleared after logout
- [ ] Accessing protected route after logout redirects to login
- [ ] Cannot access protected routes after logout

### Test Example

```typescript
describe('Logout', () => {
  beforeEach(() => {
    // Login first
    cy.visit('/login');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
  });

  it('logs out and redirects to login', () => {
    // Click logout
    cy.contains('Logout').click();

    // Should redirect to login
    cy.url().should('include', '/login');

    // Try to access protected route
    cy.visit('/routeburn/web-app/ideas');

    // Should redirect back to login
    cy.url().should('include', '/login');
  });
});
```

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-02-authentication.md](./studio-02-authentication.md) - Login & session management
- [studio-03-navigation.md](./studio-03-navigation.md) - Footer placement

## Implementation Checklist

- [ ] Create logout server action in `app/actions/auth.ts`
- [ ] Update `Footer.tsx` with logout button
- [ ] Test logout clears session cookie
- [ ] Test redirect to login after logout
- [ ] Test protected routes inaccessible after logout
- [ ] Write Cypress E2E tests
- [ ] Add logout styling and hover states
