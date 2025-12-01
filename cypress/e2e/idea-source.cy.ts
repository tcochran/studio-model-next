import { TEST_IDEAS_PATH } from "../support/test-paths";

describe("Idea Source Field", () => {
  describe("Form", () => {
    it("displays source dropdown in new idea form", () => {
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      cy.get('[data-testid="source-select"]').should("exist");
    });

    it("has all source options", () => {
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      cy.get('[data-testid="source-select"]').select("customerFeedback");
      cy.get('[data-testid="source-select"]').should("have.value", "customerFeedback");
      cy.get('[data-testid="source-select"]').select("teamBrainstorm");
      cy.get('[data-testid="source-select"]').should("have.value", "teamBrainstorm");
      cy.get('[data-testid="source-select"]').select("competitorAnalysis");
      cy.get('[data-testid="source-select"]').should("have.value", "competitorAnalysis");
    });

    it("allows creating idea without source (optional)", () => {
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      cy.get('[name="name"]').type("Test Idea Without Source");
      cy.get('[name="hypothesis"]').type("Testing that source is optional");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", TEST_IDEAS_PATH);
    });
  });

  describe("List", () => {
    it("displays Source column header", () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('[data-testid="ideas-list"]').should("exist");
      cy.contains("th", "Source").should("be.visible");
    });

    it("displays source for ideas that have one", () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('[data-testid="idea-source"]').should("exist");
    });
  });

  describe("Detail Page", () => {
    it("displays source on detail page", () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('[data-testid="idea-item"]').first().within(() => {
        cy.get('[data-testid="idea-name"] a').click();
      });
      cy.get('[data-testid="idea-detail-source"]').should("exist");
    });
  });
});
