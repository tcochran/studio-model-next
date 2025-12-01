describe("Portfolio List Page", () => {
  it("displays the portfolio list heading", () => {
    cy.visit("/portfolios");
    cy.contains("h1", "Portfolios").should("be.visible");
  });

  it("shows portfolio list or empty state", () => {
    cy.visit("/portfolios");
    // Wait for page to load and check for either state
    cy.get('[data-testid="portfolio-list"], [data-testid="portfolio-empty-state"]', { timeout: 10000 }).should("exist");
  });

  it("has a link to create new portfolio", () => {
    cy.visit("/portfolios");
    cy.contains("a", "+ New Portfolio").click();
    cy.url().should("include", "/portfolios/new");
  });
});

describe("Portfolio Form", () => {
  it("displays portfolio form fields", () => {
    cy.visit("/portfolios/new");
    cy.get('[name="organizationName"]').should("exist");
    cy.get('[name="code"]').should("exist");
    cy.get('[name="name"]').should("exist");
  });

  it("shows error when required fields are empty", () => {
    cy.visit("/portfolios/new");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="form-error"]').should("exist");
  });

  it("creates portfolio and redirects to portfolio list", () => {
    const uniqueCode = `test-org-${Date.now()}`;
    cy.visit("/portfolios/new");
    cy.get('[name="organizationName"]').type("Test Org");
    cy.get('[name="code"]').type(uniqueCode);
    cy.get('[name="name"]').type("Test Portfolio");
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should("eq", Cypress.config().baseUrl + "/portfolios");
  });
});

describe("Portfolio Detail Page", () => {
  const ensurePortfolioExists = () => {
    cy.visit("/portfolios");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="portfolio-card"]').length === 0) {
        // Create a portfolio if none exist
        cy.visit("/portfolios/new");
        cy.get('[name="organizationName"]').type("Test Org");
        cy.get('[name="code"]').type(`test-portfolio-${Date.now()}`);
        cy.get('[name="name"]').type("Test Portfolio");
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should("eq", Cypress.config().baseUrl + "/portfolios");
      }
    });
  };

  it("displays portfolio details", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-list"]', { timeout: 10000 }).should("exist");
    cy.get('[data-testid="portfolio-card"]').first().click();
    cy.get('[data-testid="portfolio-detail"]').should("exist");
  });

  it("shows organization name", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="organization-name"]').should("exist");
  });

  it("shows portfolio code", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="portfolio-code"]').should("exist");
  });

  it("has back link to portfolio list", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.contains("a", "Back").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/portfolios");
  });

  it("has add product button", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="add-product-button"]').should("exist");
  });
});

describe("Product Management", () => {
  const ensurePortfolioExists = () => {
    cy.visit("/portfolios");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="portfolio-card"]').length === 0) {
        cy.visit("/portfolios/new");
        cy.get('[name="organizationName"]').type("Test Org");
        cy.get('[name="code"]').type(`test-portfolio-${Date.now()}`);
        cy.get('[name="name"]').type("Test Portfolio");
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should("eq", Cypress.config().baseUrl + "/portfolios");
      }
    });
  };

  it("can add a product to portfolio", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="add-product-button"]').click();
    cy.get('[name="productCode"]').type(`test-product-${Date.now()}`);
    cy.get('[name="productName"]').type("Test Product");
    cy.get('[data-testid="save-product-button"]').click();
    cy.get('[data-testid="products-list"]', { timeout: 10000 }).should("contain", "Test Product");
  });

  it("shows products list in portfolio detail", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="products-list"]').should("exist");
  });

  it("has link to view ideas for product", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    // First ensure a product exists
    cy.get('[data-testid="products-list"]').then(($list) => {
      if ($list.find('[data-testid="product-ideas-link"]').length === 0) {
        cy.get('[data-testid="add-product-button"]').click();
        cy.get('[name="productCode"]').type(`test-product-${Date.now()}`);
        cy.get('[name="productName"]').type("Test Product");
        cy.get('[data-testid="save-product-button"]').click();
      }
    });
    cy.get('[data-testid="product-ideas-link"]', { timeout: 10000 }).first().should("exist");
  });
});

describe("Owner Management", () => {
  const ensurePortfolioExists = () => {
    cy.visit("/portfolios");
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="portfolio-card"]').length === 0) {
        cy.visit("/portfolios/new");
        cy.get('[name="organizationName"]').type("Test Org");
        cy.get('[name="code"]').type(`test-portfolio-${Date.now()}`);
        cy.get('[name="name"]').type("Test Portfolio");
        cy.get('button[type="submit"]').click();
        cy.url({ timeout: 10000 }).should("eq", Cypress.config().baseUrl + "/portfolios");
      }
    });
  };

  it("can add an owner to portfolio", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="add-owner-button"]').click();
    cy.get('[name="ownerEmail"]').type(`test-${Date.now()}@example.com`);
    cy.get('[data-testid="save-owner-button"]').click();
    cy.get('[data-testid="owners-list"]', { timeout: 10000 }).should("contain", "@example.com");
  });

  it("shows owners list in portfolio detail", () => {
    ensurePortfolioExists();
    cy.visit("/portfolios");
    cy.get('[data-testid="portfolio-card"]', { timeout: 10000 }).first().click();
    cy.get('[data-testid="owners-list"]').should("exist");
  });
});
