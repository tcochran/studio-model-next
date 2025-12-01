import { TEST_IDEAS_PATH } from "../support/test-paths";

describe("Ideas Form Page", () => {
  beforeEach(() => {
    cy.visit(`${TEST_IDEAS_PATH}/new`);
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
    cy.get('select[name="validationStatus"]').select("secondLevel");
    cy.get('input[name="name"]').should("have.value", "My Test Idea");
    cy.get('textarea[name="hypothesis"]').should("have.value", "This is my hypothesis");
    cy.get('select[name="validationStatus"]').should("have.value", "secondLevel");
  });

  it("redirects to ideas page after successful submission", () => {
    cy.get('input[name="name"]').type("New Idea Name");
    cy.get('textarea[name="hypothesis"]').type("New hypothesis text");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", TEST_IDEAS_PATH);
  });

  it("shows the new idea in the ideas list after submission", () => {
    const uniqueName = `Test Idea ${Date.now()}`;
    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="hypothesis"]').type("Test hypothesis");
    cy.get('button[type="submit"]').click();
    // Wait for redirect to complete
    cy.url().should("include", TEST_IDEAS_PATH);
    cy.url().should("not.include", "/new");
    // Wait for the page to load and display the list
    cy.get("h1").contains("Idea Backlog").should("be.visible");
    cy.get('[data-testid="ideas-list"]', { timeout: 15000 }).should("exist");
    cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
  });
});
