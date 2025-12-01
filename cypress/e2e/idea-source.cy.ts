describe("Idea Source Field", () => {
  describe("Form", () => {
    it("displays source dropdown in new idea form", () => {
      cy.visit("/ideas/new");
      cy.get('[data-testid="source-select"]').should("exist");
    });

    it("has all source options", () => {
      cy.visit("/ideas/new");
      cy.get('[data-testid="source-select"]').select("customerFeedback");
      cy.get('[data-testid="source-select"]').should("have.value", "customerFeedback");
      cy.get('[data-testid="source-select"]').select("teamBrainstorm");
      cy.get('[data-testid="source-select"]').should("have.value", "teamBrainstorm");
      cy.get('[data-testid="source-select"]').select("competitorAnalysis");
      cy.get('[data-testid="source-select"]').should("have.value", "competitorAnalysis");
    });

    it("allows creating idea without source (optional)", () => {
      cy.visit("/ideas/new");
      cy.get('[name="name"]').type("Test Idea Without Source");
      cy.get('[name="hypothesis"]').type("Testing that source is optional");
      cy.get('button[type="submit"]').click();
      cy.url().should("eq", Cypress.config().baseUrl + "/");
    });
  });

  describe("List", () => {
    it("displays Source column header", () => {
      cy.visit("/");
      cy.get('[data-testid="ideas-list"]').should("exist");
      cy.contains("th", "Source").should("be.visible");
    });

    it("displays source for ideas that have one", () => {
      cy.visit("/");
      cy.get('[data-testid="idea-source"]').should("exist");
    });
  });

  describe("Detail Page", () => {
    it("displays source on detail page", () => {
      cy.visit("/");
      cy.get('[data-testid="idea-item"]').first().within(() => {
        cy.get('[data-testid="idea-name"] a').click();
      });
      cy.get('[data-testid="idea-detail-source"]').should("exist");
    });
  });
});
