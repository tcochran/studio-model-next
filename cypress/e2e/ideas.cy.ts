describe("Ideas Page", () => {
  it("displays the heading", () => {
    cy.visit("/");
    cy.contains("h1", "Idea Backlog").should("be.visible");
  });

  it("displays ideas table with correct columns", () => {
    cy.visit("/");
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.contains("th", "Name").should("be.visible");
    cy.contains("th", "Hypothesis").should("be.visible");
    cy.contains("th", "Validation Status").should("be.visible");
  });

  it("displays ideas from the database", () => {
    cy.visit("/");
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
  });

  it("shows idea hypothesis, name and status", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-hypothesis"]').should("not.be.empty");
      cy.get('[data-testid="idea-name"]').should("not.be.empty");
    });
  });

  it("has a link to add new idea", () => {
    cy.visit("/");
    cy.contains("a", "+ New Idea").should("be.visible");
    cy.contains("a", "+ New Idea").click();
    cy.url().should("include", "/ideas/new");
  });
});
