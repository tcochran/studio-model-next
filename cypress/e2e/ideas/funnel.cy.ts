import { TEST_IDEAS_PATH } from "../../support/test-paths";

describe("Funnel View", () => {
  beforeEach(() => {
    cy.visit(`${TEST_IDEAS_PATH}/funnel`);
  });

  it("displays the funnel view heading", () => {
    cy.contains("h1", "Idea Funnel").should("be.visible");
  });

  it("displays three funnel layers", () => {
    cy.get('[data-testid="funnel-layer-firstLevel"]').should("exist");
    cy.get('[data-testid="funnel-layer-secondLevel"]').should("exist");
    cy.get('[data-testid="funnel-layer-scaling"]').should("exist");
  });

  it("displays layer labels with counts", () => {
    cy.get('[data-testid="funnel-layer-firstLevel"]').within(() => {
      cy.contains("Unvalidated").should("be.visible");
    });
    cy.get('[data-testid="funnel-layer-secondLevel"]').within(() => {
      cy.contains("Partially Validated").should("be.visible");
    });
    cy.get('[data-testid="funnel-layer-scaling"]').within(() => {
      cy.contains("Fully Validated").should("be.visible");
    });
  });

  it("displays idea cards with number and name", () => {
    cy.get('[data-testid="idea-card"]').should("have.length.at.least", 1);
    cy.get('[data-testid="idea-card"]').first().within(() => {
      cy.get('[data-testid="idea-card-number"]').should("be.visible");
      cy.get('[data-testid="idea-card-name"]').should("be.visible");
    });
  });

  it("groups ideas correctly by validation status", () => {
    // First level should have ideas
    cy.get('[data-testid="funnel-layer-firstLevel"]')
      .find('[data-testid="idea-card"]')
      .should("have.length.at.least", 1);
  });

  it("navigates to idea detail when clicking card", () => {
    cy.get('[data-testid="idea-card"]').first().within(() => {
      cy.get('[data-testid="idea-card-number"]').invoke("text");
    });
    cy.get('[data-testid="idea-card"]').first().click();
    cy.url().should("include", `${TEST_IDEAS_PATH}/`);
    cy.url().should("not.include", "/funnel");
  });

  it("has funnel shape with narrowing layers", () => {
    // Check that layers have different max-widths (funnel shape)
    cy.get('[data-testid="funnel-layer-firstLevel"]')
      .should("have.css", "max-width");
    cy.get('[data-testid="funnel-layer-secondLevel"]')
      .should("have.css", "max-width");
    cy.get('[data-testid="funnel-layer-scaling"]')
      .should("have.css", "max-width");
  });

  it("has link back to list view", () => {
    cy.get('[data-testid="list-view-link"]').should("exist");
    cy.get('[data-testid="list-view-link"]').click();
    cy.url().should("equal", Cypress.config().baseUrl + TEST_IDEAS_PATH);
  });
});

describe("Funnel View Navigation", () => {
  it("navigates to funnel view from ideas list", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.get('[data-testid="funnel-view-link"]').should("exist");
    cy.get('[data-testid="funnel-view-link"]').click();
    cy.url().should("include", "/funnel");
  });

  it("navigates back to funnel view when coming from funnel", () => {
    cy.visit(`${TEST_IDEAS_PATH}/funnel`);

    // Click first idea card in funnel
    cy.get('[data-testid="idea-card"]').first().click();

    // Should be on detail page with from=funnel parameter
    cy.url().should("include", `${TEST_IDEAS_PATH}/`);
    cy.url().should("not.include", "/funnel");
    cy.url().should("include", "from=funnel");

    // Click back button
    cy.get('[data-testid="back-to-ideas"]').click();

    // Should return to funnel view
    cy.url().should("include", "/funnel");
    cy.contains("Idea Funnel").should("be.visible");
  });

  it("navigates back to list view when coming from list", () => {
    cy.visit(TEST_IDEAS_PATH);

    // Click first idea in list
    cy.get('[data-testid="idea-name"] a').first().click();

    // Should be on detail page
    cy.url().should("include", `${TEST_IDEAS_PATH}/`);
    cy.url().should("not.include", "/funnel");

    // Click back button
    cy.get('[data-testid="back-to-ideas"]').click();

    // Should return to list view (not funnel)
    cy.url().should("not.include", "/funnel");
    cy.url().should("equal", Cypress.config().baseUrl + TEST_IDEAS_PATH);
    cy.contains("Idea Backlog").should("be.visible");
    cy.get('[data-testid="ideas-list"]').should("exist");
  });

  it("browser back button returns to funnel view", () => {
    cy.visit(`${TEST_IDEAS_PATH}/funnel`);

    // Click idea card
    cy.get('[data-testid="idea-card"]').first().click();
    cy.url().should("include", "from=funnel");

    // Use browser back
    cy.go("back");

    // Should be back at funnel
    cy.url().should("include", "/funnel");
    cy.contains("Idea Funnel").should("be.visible");
  });
});
