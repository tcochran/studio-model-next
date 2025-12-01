import { TEST_IDEAS_PATH } from "../support/test-paths";

describe("Idea Age Column", () => {
  it("displays Age column header", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.contains("th", "Age").should("be.visible");
  });

  it("displays age for each idea", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-age"]').should("exist");
    });
  });

  it("shows age in human-readable format", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="idea-age"]').first().invoke("text").then((text) => {
      expect(text).to.match(/(just now|\d+ (min|hour|day|week|month)s?)/);
    });
  });
});
