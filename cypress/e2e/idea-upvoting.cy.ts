describe("Idea Upvoting", () => {
  it("displays upvote button for each idea", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="upvote-button"]').should("exist");
    });
  });

  it("displays upvote count", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="upvote-count"]').should("exist");
    });
  });

  it("increments upvote count when clicked", () => {
    cy.visit("/");
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
    cy.visit("/");
    cy.get('[data-testid="sort-dropdown"]').select("upvotes");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "upvotes");
  });

  it("updates URL when sorting by upvotes", () => {
    cy.visit("/");
    cy.get('[data-testid="sort-dropdown"]').select("upvotes");
    cy.url().should("include", "sort=upvotes");
  });

  it("sorts ideas by upvotes descending", () => {
    cy.visit("/?sort=upvotes");
    cy.get('[data-testid="upvote-count"]').then(($counts) => {
      const counts = [...$counts].map((el) => parseInt(el.textContent || "0", 10));
      const sortedCounts = [...counts].sort((a, b) => b - a);
      expect(counts).to.deep.equal(sortedCounts);
    });
  });
});
