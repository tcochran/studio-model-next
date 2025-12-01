describe("Ideas Page", () => {
  it("displays the heading", () => {
    cy.visit("/");
    cy.contains("h1", "Idea Backlog").should("be.visible");
  });

  it("displays ideas from the database", () => {
    cy.visit("/");
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
  });

  it("shows idea title and description", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get("h2").should("not.be.empty");
      cy.get("p").should("not.be.empty");
    });
  });
});
