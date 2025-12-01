describe("Idea Detail Page", () => {
  it("makes idea names clickable links", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-name"] a').should("exist");
    });
  });

  it("navigates to detail page when clicking idea name", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-name"] a').click();
    });
    cy.url().should("include", "/ideas/");
  });

  it("displays idea details on detail page", () => {
    cy.visit("/");
    let ideaName: string;

    cy.get('[data-testid="idea-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="idea-name"]')
          .invoke("text")
          .then((text) => {
            ideaName = text;
          });
        cy.get('[data-testid="idea-name"] a').click();
      });

    cy.get('[data-testid="idea-detail-name"]').should(($el) => {
      expect($el.text()).to.include(ideaName);
    });
    cy.get('[data-testid="idea-detail-hypothesis"]').should("exist");
    cy.get('[data-testid="idea-detail-status"]').should("exist");
    cy.get('[data-testid="idea-detail-created"]').should("exist");
  });

  it("preserves line breaks in hypothesis on detail page", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-name"] a').click();
    });

    cy.get('[data-testid="idea-detail-hypothesis"]').should(
      "have.css",
      "white-space",
      "pre-wrap"
    );
  });

  it("navigates back to ideas list", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-name"] a').click();
    });

    cy.get('[data-testid="back-to-ideas"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("shows error for invalid idea ID", () => {
    cy.visit("/ideas/invalid-id-123");
    cy.contains("Idea not found").should("be.visible");
    cy.get('[data-testid="back-to-ideas"]').should("exist");
  });
});
