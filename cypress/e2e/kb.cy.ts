import { TEST_KB_PATH, TEST_IDEAS_PATH } from "../support/test-paths";

describe("Knowledge Base Page", () => {
  it("displays the KB page heading", () => {
    cy.visit(TEST_KB_PATH);
    cy.contains("h1", "Knowledge Base").should("be.visible");
  });

  it("shows empty state or document list", () => {
    // With shared test database, we check that either empty state OR documents are shown
    cy.visit(TEST_KB_PATH);
    cy.get("body").then(($body) => {
      const hasEmptyState = $body.find('[data-testid="kb-empty-state"]').length > 0;
      const hasDocuments = $body.find('[data-testid="kb-document-list"]').length > 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(hasEmptyState || hasDocuments).to.be.true;
    });
  });

  it("has navigation link to KB page from Ideas", () => {
    cy.visit(TEST_IDEAS_PATH);
    cy.contains("a", "Knowledge Base").click();
    cy.url().should("include", "/kb");
  });

  it("has navigation link back to Ideas from KB", () => {
    cy.visit(TEST_KB_PATH);
    cy.contains("a", "Idea Backlog").click();
    cy.url().should("include", TEST_IDEAS_PATH);
  });

  it("has a link to create new document", () => {
    cy.visit(TEST_KB_PATH);
    cy.contains("a", "+ New Document").click();
    cy.url().should("include", `${TEST_KB_PATH}/new`);
  });
});

describe("KB Document Form", () => {
  it("displays title and content fields", () => {
    cy.visit(`${TEST_KB_PATH}/new`);
    cy.get('[name="title"]').should("exist");
    cy.get('[name="content"]').should("exist");
  });

  it("shows error when title is empty", () => {
    cy.visit(`${TEST_KB_PATH}/new`);
    cy.get('[name="content"]').type("Some content");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="title-error"]').should("exist");
  });

  it("shows error when content is empty", () => {
    cy.visit(`${TEST_KB_PATH}/new`);
    cy.get('[name="title"]').type("Test Title");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="content-error"]').should("exist");
  });

  it("creates document and redirects to KB list", () => {
    cy.visit(`${TEST_KB_PATH}/new`);
    cy.get('[name="title"]').type("Test Document");
    cy.get('[name="content"]').type("# Test Markdown\n\nThis is content.");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", TEST_KB_PATH);
  });
});

describe("KB Document List", () => {
  it("displays document titles as clickable links", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"]').within(() => {
      cy.get("a").should("exist");
    });
  });

  it("displays creation date for documents", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"]').within(() => {
      cy.get('[data-testid="document-date"]').should("exist");
    });
  });

  it("shows documents in list format", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"] li').should("have.length.at.least", 1);
  });
});

describe("KB Document Detail", () => {
  it("navigates to document detail when clicking title", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"] a').first().click();
    cy.url().should("match", /\/kb\/[a-zA-Z0-9-]+/);
  });

  it("displays document title on detail page", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"] a').first().click();
    cy.get("h1").should("exist");
  });

  it("renders markdown content", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"] a').first().click();
    cy.get('[data-testid="document-content"]').should("exist");
  });

  it("has back link to KB list", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"] a').first().click();
    cy.contains("a", "Back").click();
    cy.url().should("include", TEST_KB_PATH);
  });

  it("has download button", () => {
    cy.visit(TEST_KB_PATH);
    cy.get('[data-testid="kb-document-list"] a').first().click();
    cy.get('[data-testid="download-button"]').should("exist");
  });

  it("shows error for invalid document ID", () => {
    cy.visit(`${TEST_KB_PATH}/invalid-id-12345`);
    cy.get('[data-testid="document-error"]').should("exist");
  });
});
