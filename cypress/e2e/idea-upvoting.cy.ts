import { TEST_IDEAS_PATH } from "../support/test-paths";

describe("Idea Upvoting", () => {
  it("displays upvote button for each idea", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="upvote-button"]').should("exist");
    });
  });

  it("displays upvote count", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="upvote-count"]').should("exist");
    });
  });

  it("increments upvote count when clicked", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="idea-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="upvote-count"]')
          .invoke("text")
          .then((initialCount) => {
            const initial = parseInt(initialCount, 10) || 0;
            cy.get('[data-testid="upvote-button"]').click();
            cy.get('[data-testid="upvote-count"]').should(
              "contain",
              String(initial + 1)
            );
          });
      });
  });

  it("has sort by upvotes option", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="sort-dropdown"]').select("upvotes");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "upvotes");
  });

  it("updates URL when sorting by upvotes", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="sort-dropdown"]').select("upvotes");
    cy.url().should("include", "sort=upvotes");
  });

  it("sorts ideas by upvotes descending", () => {
    cy.visit(`${TEST_IDEAS_PATH}?sort=upvotes`);
    cy.get('[data-testid="upvote-count"]').then(($counts) => {
      const counts = [...$counts].map((el) => parseInt(el.textContent || "0", 10));
      const sortedCounts = [...counts].sort((a, b) => b - a);
      expect(counts).to.deep.equal(sortedCounts);
    });
  });

  it("persists upvote count after page refresh", () => {
    cy.visit(TEST_IDEAS_PATH);

    cy.get('[data-testid="idea-item"]').first().as("firstIdea");
    cy.get("@firstIdea").find('[data-testid="idea-name"]').invoke("text").as("ideaName");
    cy.get("@firstIdea").find('[data-testid="upvote-count"]').invoke("text").then((initialCountText) => {
      const initialCount = parseInt(initialCountText, 10) || 0;
      const expectedCount = initialCount + 1;

      cy.get("@firstIdea").find('[data-testid="upvote-button"]').click();
      cy.get("@firstIdea").find('[data-testid="upvote-count"]').should("contain", String(expectedCount));

      // Wait for database update
      cy.wait(2000);
      cy.reload();

      // After refresh, find the idea by name and verify count persisted
      cy.get("@ideaName").then((ideaName) => {
        cy.contains('[data-testid="idea-name"]', ideaName as unknown as string)
          .closest('[data-testid="idea-item"]')
          .find('[data-testid="upvote-count"]')
          .invoke("text")
          .then((countText) => {
            const persistedCount = parseInt(countText, 10) || 0;
            expect(persistedCount).to.be.at.least(expectedCount);
          });
      });
    });
  });
});
