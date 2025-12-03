# Studio Feature - Part 3: Navigation & Header

## Overview

Add header navigation showing user email, studio name, and portfolio switcher. Add footer with logout button.

## Header Design

### Layout

```
+------------------------------------------------------------------+
| Studio Model          [Portfolio v]  Studio Name  user@email.com |
+------------------------------------------------------------------+
```

**Components from left to right:**
1. Logo/Brand: "Studio Model" (links to `/portfolios`)
2. Portfolio Switcher: Dropdown showing current portfolio
3. Studio Name: Display only (not clickable)
4. User Email: Display only (not clickable)

### Header Component Structure

```tsx
// components/Header.tsx
<header className="border-b bg-white">
  <div className="container mx-auto px-4 py-3 flex items-center justify-between">
    {/* Left: Logo */}
    <Link href="/portfolios" className="text-xl font-bold">
      Studio Model
    </Link>

    {/* Right: Portfolio, Studio, User */}
    <div className="flex items-center gap-6">
      <PortfolioSwitcher currentPortfolioCode={portfolioCode} />
      <span className="text-gray-600">{studioName}</span>
      <span className="text-gray-600">{userEmail}</span>
    </div>
  </div>
</header>
```

## Portfolio Switcher

### Behavior

**Dropdown showing:**
- Current portfolio (selected/highlighted)
- All portfolios user has access to (alphabetically sorted)

**On select:**
- Navigate to the selected portfolio's first product's ideas page
- Same logic as login redirect: `/{portfolioCode}/{firstProductCode}/ideas`

### Portfolio Switcher Component

```tsx
// components/PortfolioSwitcher.tsx
<div className="relative">
  <button onClick={toggleDropdown} className="flex items-center gap-2">
    <span>{currentPortfolio.name}</span>
    <ChevronDownIcon className="w-4 h-4" />
  </button>

  {isOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
      {portfolios.map((portfolio) => (
        <button
          key={portfolio.id}
          onClick={() => handleSelect(portfolio.code)}
          className={cn(
            'block w-full text-left px-4 py-2 hover:bg-gray-100',
            portfolio.code === currentPortfolioCode && 'bg-gray-50 font-medium'
          )}
        >
          {portfolio.name}
        </button>
      ))}
    </div>
  )}
</div>
```

### Data Fetching

Server component fetches:
1. Current user's email from session
2. User's studio from StudioUser table
3. Portfolio linked to studio
4. All portfolios user has access to (for now, just the one linked to their studio)

**Note:** In Phase 1, users only have access to one portfolio (their studio's portfolio). The dropdown is designed for future expansion when users might belong to multiple studios.

## Studio Name Display

Simple text display of the studio name:
- Read from Studio table via user's studioId
- Static display (not clickable)
- Gray text color to indicate it's informational

## User Email Display

Simple text display of user's email:
- Read from session
- Static display (not clickable)
- Gray text color

## Footer Design

### Layout

```
+------------------------------------------------------------------+
|                                                         [Logout]  |
+------------------------------------------------------------------+
```

**Components:**
- Right-aligned logout button
- Simple, minimal design
- Appears on all pages

### Footer Component

```tsx
// components/Footer.tsx
<footer className="border-t bg-white mt-auto">
  <div className="container mx-auto px-4 py-3 flex justify-end">
    <form action={handleLogout}>
      <button
        type="submit"
        className="text-gray-600 hover:text-gray-900 underline"
      >
        Logout
      </button>
    </form>
  </div>
</footer>
```

## Global Layout

Update root layout to include header and footer:

```tsx
// app/layout.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function RootLayout({ children }) {
  const session = await getSession();

  // Don't show header/footer on login page
  const isLoginPage = /* check pathname */;

  return (
    <html>
      <body className="flex flex-col min-h-screen">
        {!isLoginPage && session && <Header />}
        <main className="flex-1">{children}</main>
        {!isLoginPage && session && <Footer />}
      </body>
    </html>
  );
}
```

## Portfolio Switcher Logic

### Current Portfolio Detection

Determine current portfolio from URL:
- Extract portfolio code from pathname
- Example: `/ routeburn/web-app/ideas` → `routeburn`

```typescript
// utils/navigation.ts
export function getCurrentPortfolioCode(pathname: string): string | null {
  const match = pathname.match(/^\/([^\/]+)/);
  return match ? match[1] : null;
}
```

### Portfolio Switch Handler

```typescript
// Server action in components/PortfolioSwitcher.tsx
async function handlePortfolioSwitch(portfolioCode: string) {
  // 1. Get portfolio by code
  const portfolio = await getPortfolioByCode(portfolioCode);

  if (!portfolio) {
    throw new Error('Portfolio not found');
  }

  // 2. Get first product (alphabetically)
  const products = portfolio.products.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (products.length === 0) {
    // No products - redirect to portfolio detail
    redirect(`/portfolios/${portfolio.code}`);
  }

  // 3. Redirect to first product's ideas page
  redirect(`/${portfolio.code}/${products[0].code}/ideas`);
}
```

## Responsive Design

### Desktop (≥768px)
- Full header with all elements visible
- Portfolio switcher dropdown
- Studio name and email visible

### Mobile (<768px)
- Simplified header:
  - Logo on left
  - Hamburger menu on right
- Menu shows:
  - Portfolio switcher
  - Studio name
  - User email
  - Logout button (move from footer)

## Implementation Files

```
components/
  Header.tsx              # Main header component
  Footer.tsx              # Footer with logout
  PortfolioSwitcher.tsx   # Portfolio dropdown
  navigation/
    UserInfo.tsx          # Studio name + email display
utils/
  navigation.ts           # Navigation helpers
app/
  layout.tsx             # Root layout with header/footer
```

## Styling Guidelines

- Use Tailwind CSS for all styling
- Follow existing design system
- Colors:
  - Header background: white
  - Border: gray-200
  - Text: gray-900 (primary), gray-600 (secondary)
  - Hover states: gray-100

## Testing

### E2E Tests (Cypress)

**File:** `cypress/e2e/navigation/header.cy.ts`

Test cases:
- [ ] Header displays user email correctly
- [ ] Header displays studio name correctly
- [ ] Portfolio switcher shows current portfolio
- [ ] Portfolio switcher lists all accessible portfolios
- [ ] Clicking portfolio switches to that portfolio's first product
- [ ] Logo links to `/portfolios`
- [ ] Logout button appears in footer
- [ ] Footer is visible on all authenticated pages
- [ ] Header/footer not visible on login page

### Unit Tests

- Test `getCurrentPortfolioCode()` helper
- Test portfolio switch redirect logic

## Related Specs

- [studio.md](./studio.md) - Main studio specification
- [studio-02-authentication.md](./studio-02-authentication.md) - Session management
- [studio-04-logout.md](./studio-04-logout.md) - Logout functionality

## Implementation Checklist

- [ ] Create Header component
- [ ] Create Footer component
- [ ] Create PortfolioSwitcher component
- [ ] Add header/footer to root layout
- [ ] Implement portfolio switch logic
- [ ] Style components with Tailwind
- [ ] Add responsive mobile menu
- [ ] Test portfolio switching
- [ ] Write Cypress E2E tests
- [ ] Handle edge cases (no products, no portfolio)
