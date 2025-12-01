# Spec 06: Ideas Form Page

## Status: In Progress

## Goal

Create a form page that allows users to enter new ideas into the system. The form should capture the idea title and description, then save it to the database.

## Problem

Users can view ideas in the backlog but have no way to add new ideas. We need:
- A dedicated page for entering new ideas
- A form with title and description fields
- Validation to ensure required fields are filled
- Integration with Amplify Data to persist ideas

## Solution

Create a new `/ideas/new` route with a form component. The form will use client-side validation and submit to the Amplify Data API using the existing schema.

## Implementation

### 1. Cypress Tests (Write First - TDD)

**File:** `cypress/e2e/ideas-form.cy.ts`

```typescript
describe("Ideas Form Page", () => {
  beforeEach(() => {
    cy.visit("/ideas/new");
  });

  it("displays the form heading", () => {
    cy.contains("h1", "Add New Idea").should("be.visible");
  });

  it("displays title and description input fields", () => {
    cy.get('input[name="title"]').should("be.visible");
    cy.get('textarea[name="description"]').should("be.visible");
  });

  it("displays a submit button", () => {
    cy.get('button[type="submit"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain", "Add Idea");
  });

  it("shows validation error when submitting empty form", () => {
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="title-error"]').should("be.visible");
  });

  it("allows entering idea details", () => {
    cy.get('input[name="title"]').type("My Test Idea");
    cy.get('textarea[name="description"]').type("This is a test description");
    cy.get('input[name="title"]').should("have.value", "My Test Idea");
    cy.get('textarea[name="description"]').should(
      "have.value",
      "This is a test description"
    );
  });

  it("redirects to home page after successful submission", () => {
    cy.get('input[name="title"]').type("New Idea Title");
    cy.get('textarea[name="description"]').type("New idea description text");
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("shows the new idea in the ideas list after submission", () => {
    const uniqueTitle = `Test Idea ${Date.now()}`;
    cy.get('input[name="title"]').type(uniqueTitle);
    cy.get('textarea[name="description"]').type("Test description");
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains(uniqueTitle).should("be.visible");
  });
});
```

### 2. Page Component

**File:** `src/app/ideas/new/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

const client = generateClient<Schema>();

export default function NewIdeaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await client.models.Idea.create({
        title: title.trim(),
        description: description.trim(),
      });
      router.push("/");
    } catch (error) {
      console.error("Error creating idea:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Add New Idea
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your idea title"
            />
            {titleError && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                data-testid="title-error"
              >
                {titleError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your idea"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Idea"}
          </button>
        </form>
      </main>
    </div>
  );
}
```

### 3. Add Link from Home Page (Optional Enhancement)

Add a link to the new idea form from the home page for easy navigation.

## Project Structure After Completion

```
studio-model-next/
├── src/
│   └── app/
│       ├── page.tsx
│       └── ideas/
│           └── new/
│               └── page.tsx
├── cypress/
│   └── e2e/
│       ├── ideas.cy.ts
│       └── ideas-form.cy.ts
└── spec/
    └── 06-ideas-form.md
```

## Acceptance Criteria

- [ ] Cypress tests written for ideas form
- [ ] Form page accessible at `/ideas/new`
- [ ] Form displays title input field
- [ ] Form displays description textarea
- [ ] Form displays submit button
- [ ] Validation shows error for empty title
- [ ] Successful submission creates new idea
- [ ] Redirects to home page after submission
- [ ] New idea appears in the ideas list
- [ ] All Cypress tests pass

## Running Tests

**Important:** Always unset `ELECTRON_RUN_AS_NODE` before running Cypress tests (required when running from VSCode):

```bash
# Start dev server
npm run dev

# In another terminal, run Cypress
unset ELECTRON_RUN_AS_NODE && npm run cy:run

# Or open Cypress interactive mode
unset ELECTRON_RUN_AS_NODE && npm run cy:open
```

## Future Enhancements

- Add description validation
- Add character limits
- Integrate with AI agent for idea refinement (per vision.md)
- Add cancel button to return to home
- Add loading state with spinner

---

*Created: 2025-11-30*
