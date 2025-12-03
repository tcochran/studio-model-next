# Studio Feature - Part 2: Authentication & Login

## Overview

Implement simple email-based session authentication (no password) using Next.js cookies.

## Session Management

### Technology Choice

Use simple cookie-based sessions with Next.js:
- Store email in encrypted cookie using Next.js built-in cookie support
- No external dependencies (no iron-session or next-auth for Phase 1)
- Session expires after 7 days of inactivity

### Session Storage

```typescript
// Session cookie structure
interface SessionData {
  email: string;
  createdAt: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
}
```

Cookie name: `studio_session`
- httpOnly: true
- secure: true (HTTPS only in production)
- sameSite: 'lax'
- maxAge: 7 days (604800 seconds)

## Login Page

### Route

`/login`

### UI Design

**Layout:**
- Centered card on page
- Clean, minimal design
- Studio Model branding at top

**Components:**
```tsx
<div className="centered-container">
  <div className="login-card">
    <h1>Studio Model</h1>
    <p className="subtitle">Sign in to your studio</p>

    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Enter your email"
        required
        autoComplete="email"
      />
      <button type="submit">Sign In</button>
    </form>

    <p className="footer-text">
      Simple session-based login - no password required
    </p>
  </div>
</div>
```

### Styling

- Card: white background, subtle shadow, rounded corners
- Input: full width, proper padding, focus state
- Button: primary color, full width
- Footer text: gray, smaller font
- Responsive: works on mobile and desktop

### Validation

**Client-side:**
- Email format validation (HTML5 email input)
- Required field (cannot submit empty)
- Show error message if submission fails

**Server-side:**
- Email format validation
- Check if user exists in StudioUser table
- If not found: return error "User not found - contact your administrator"

## Login Flow

### Step 1: User Enters Email

User types email and clicks "Sign In"

### Step 2: Server Validation

```typescript
// app/login/actions.ts (Server Action)
async function handleLogin(email: string) {
  // 1. Validate email format
  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' };
  }

  // 2. Look up user in StudioUser table by email
  const user = await getStudioUserByEmail(email.toLowerCase());

  // 3. Check if user exists
  if (!user) {
    return { error: 'User not found - contact your administrator' };
  }

  // 4. Create session
  await createSession(email);

  // 5. Determine redirect
  const redirectUrl = await determineRedirectUrl(user);

  return { success: true, redirectUrl };
}
```

### Step 3: Determine Redirect URL

Logic for redirect after successful login:

```typescript
async function determineRedirectUrl(user: StudioUser): Promise<string> {
  // 1. Get user's studio
  const studio = await getStudioById(user.studioId);

  // 2. Get portfolio linked to studio
  const portfolio = await getPortfolioById(studio.portfolioId);

  // 3. Get first product (alphabetically) in portfolio
  const products = portfolio.products.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (products.length === 0) {
    // No products - redirect to portfolio detail
    return `/portfolios/${portfolio.code}`;
  }

  // 4. Redirect to first product's ideas page
  return `/${portfolio.code}/${products[0].code}/ideas`;
}
```

### Step 4: Create Session

```typescript
// utils/session.ts
import { cookies } from 'next/headers';

export async function createSession(email: string) {
  const sessionData = {
    email: email.toLowerCase(),
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };

  // Encrypt session data (simple base64 for Phase 1)
  const encrypted = Buffer.from(JSON.stringify(sessionData)).toString('base64');

  cookies().set('studio_session', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<SessionData | null> {
  const sessionCookie = cookies().get('studio_session');

  if (!sessionCookie) {
    return null;
  }

  try {
    const decrypted = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(decrypted) as SessionData;

    // Check if expired
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function destroySession() {
  cookies().delete('studio_session');
}
```

## Protected Routes

### Middleware Approach

Check session on every page load using Next.js middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('studio_session');
  const pathname = request.nextUrl.pathname;

  // Allow login page without session
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Check if session exists
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify session is valid
  try {
    const decrypted = Buffer.from(sessionCookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(decrypted);

    if (Date.now() > session.expiresAt) {
      // Session expired - redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid session - redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

## Error Handling

### User Not Found

Show error message on login page:
```
"User not found - contact your administrator"
```

### No Portfolio Access

If user's studio has no linked portfolio:
```
"No portfolio access - contact your administrator"
```

### Session Expired

Redirect to `/login` with message:
```
"Your session has expired. Please sign in again."
```

## Implementation Files

```
app/
  login/
    page.tsx           # Login page UI
    actions.ts         # Server actions for login
  api/
    auth/
      route.ts         # API route handlers (if needed)
src/
  utils/
    session.ts         # Session management utilities
    auth.ts            # Authentication helpers
middleware.ts          # Route protection
```

## Testing

### E2E Tests (Cypress)

**File:** `cypress/e2e/auth/login.cy.ts`

Test cases:
- [ ] Login page displays correctly
- [ ] Email input validation (invalid format)
- [ ] Login with valid email (user exists)
- [ ] Login with invalid email (user not found)
- [ ] Successful login redirects to correct portfolio/product
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect to login when not authenticated
- [ ] Expired session redirects to login

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-01-data-schema.md](./studio-01-data-schema.md) - Data model
- [studio-03-navigation.md](./studio-03-navigation.md) - Navigation after login
- [studio-04-logout.md](./studio-04-logout.md) - Logout functionality

## Implementation Checklist

- [ ] Create `/app/login/page.tsx` with form UI
- [ ] Create `/app/login/actions.ts` with server actions
- [ ] Create `src/utils/session.ts` with session helpers
- [ ] Create `middleware.ts` for route protection
- [ ] Add login API route handler if needed
- [ ] Style login page with Tailwind
- [ ] Test session creation and validation
- [ ] Test redirect logic after login
- [ ] Write Cypress E2E tests
- [ ] Handle error states and messages
