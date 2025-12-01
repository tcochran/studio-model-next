describe("Ideas Form Page", () => {
  beforeEach(() => {
    cy.visit("/ideas/new");
  });

  it("displays the form heading", () => {
    cy.contains("h1", "Add New Idea").should("be.visible");
  });

  it("displays title and description input fields", () => {
    cy.get('input[name="title"]').should("be.visible");
    cy.get('textarea[name="description"]').should("be.visible");
  });

  it("displays a submit button", () => {
    cy.get('button[type="submit"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain", "Add Idea");
  });

  it("shows validation error when submitting empty form", () => {
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="title-error"]').should("be.visible");
  });

  it("allows entering idea details", () => {
    cy.get('input[name="title"]').type("My Test Idea");
    cy.get('textarea[name="description"]').type("This is a test description");
    cy.get('input[name="title"]').should("have.value", "My Test Idea");
    cy.get('textarea[name="description"]').should(
      "have.value",
      "This is a test description"
    );
  });

  it("redirects to home page after successful submission", () => {
    cy.get('input[name="title"]').type("New Idea Title");
    cy.get('textarea[name="description"]').type("New idea description text");
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("shows the new idea in the ideas list after submission", () => {
    const uniqueTitle = `Test Idea ${Date.now()}`;
    cy.get('input[name="title"]').type(uniqueTitle);
    cy.get('textarea[name="description"]').type("Test description");
    cy.get('button[type="submit"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains(uniqueTitle).should("be.visible");
  });
});
