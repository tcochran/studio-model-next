describe("Ideas Form Page", () => {
  beforeEach(() => {
    cy.visit("/ideas/new");
  });

  it("displays the form heading", () => {
    cy.contains("h1", "Add New Idea").should("be.visible");
  });

  it("displays name, hypothesis and validation status fields", () => {
    cy.get('input[name="name"]').should("be.visible");
    cy.get('textarea[name="hypothesis"]').should("be.visible");
    cy.get('select[name="validationStatus"]').should("be.visible");
  });

  it("displays a submit button", () => {
    cy.get('button[type="submit"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain", "Add Idea");
  });

  it("shows validation error when submitting empty form", () => {
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="name-error"]').should("be.visible");
    cy.get('[data-testid="hypothesis-error"]').should("be.visible");
  });

  it("allows entering idea details", () => {
    cy.get('input[name="name"]').type("My Test Idea");
    cy.get('textarea[name="hypothesis"]').type("This is my hypothesis");
    cy.get('select[name="validationStatus"]').select("second-level");
    cy.get('input[name="name"]').should("have.value", "My Test Idea");
    cy.get('textarea[name="hypothesis"]').should("have.value", "This is my hypothesis");
    cy.get('select[name="validationStatus"]').should("have.value", "second-level");
  });

  it("redirects to home page after successful submission", () => {
    cy.get('input[name="name"]').type("New Idea Name");
    cy.get('textarea[name="hypothesis"]').type("New hypothesis text");
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("shows the new idea in the ideas list after submission", () => {
    const uniqueName = `Test Idea ${Date.now()}`;
    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="hypothesis"]').type("Test hypothesis");
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains(uniqueName).should("be.visible");
  });
});
