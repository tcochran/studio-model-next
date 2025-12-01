# Spec 01: Frontend Initialization

## Goal

Initialize the SvelteKit frontend application with TypeScript and Tailwind CSS. Display a simple Ideas page with a title.

## Scope

This is the minimal setup to get the project running. No data fetching, no components, just the basic infrastructure.

## Tasks

### 1. Initialize SvelteKit Project

**Command:**
```bash
npm create svelte@latest app
```

**Configuration selections:**
- Template: Skeleton project
- TypeScript: Yes, using TypeScript syntax
- ESLint: Yes
- Prettier: Yes
- Playwright: No (add later)
- Vitest: No (add later)

### 2. Install Dependencies

```bash
cd app
npm install
```

### 3. Install and Configure Tailwind CSS

**Install Tailwind:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configure `tailwind.config.js`:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Create `src/app.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Update `src/routes/+layout.svelte`:**
```svelte
<script lang="ts">
  import '../app.css';
</script>

<slot />
```

### 4. Create Ideas Page

**File:** `src/routes/+page.svelte`

```svelte
<script lang="ts">
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold">Ideas</h1>
</div>
```

### 5. Verify Setup

**Start dev server:**
```bash
npm run dev
```

**Expected result:**
- Navigate to `http://localhost:5173`
- See "Ideas" heading displayed on the page
- Tailwind styles should be working (check font-bold and text sizing)

## Project Structure After Completion

```
app/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── app.css
├── static/
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Acceptance Criteria

- [ ] SvelteKit project initialized with TypeScript
- [ ] Tailwind CSS configured and working
- [ ] Dev server runs without errors
- [ ] Browser displays "Ideas" heading
- [ ] No console errors in browser

## Next Steps

After this spec is complete, we will:
1. Set up project folder structure
2. Create UI components
3. Add type definitions
4. Build the ideas list view
