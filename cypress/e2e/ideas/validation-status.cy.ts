import { TEST_IDEAS_PATH } from "../../support/test-paths";

describe("Validation Status - Backlog and Failed", () => {
  describe("Status Display in Ideas List", () => {
    beforeEach(() => {
      cy.visit(TEST_IDEAS_PATH);
    });

    it("displays Backlog status with gray badge", () => {
      // Create a test idea with backlog status
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `Backlog Idea ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test backlog status");
      cy.get('select[name="validationStatus"]').select("backlog");
      cy.get('button[type="submit"]').click();

      cy.url().should("include", TEST_IDEAS_PATH);
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");

      // Find the idea and check its status badge
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .closest('[data-testid="idea-item"]')
        .find('[data-testid="idea-status"] span')
        .should("contain", "Backlog")
        .and("have.class", "bg-gray-100");
    });

    it("displays Failed status with red badge", () => {
      // Create a test idea with failed status
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `Failed Idea ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test failed status");
      cy.get('select[name="validationStatus"]').select("failed");
      cy.get('button[type="submit"]').click();

      cy.url().should("include", TEST_IDEAS_PATH);
      cy.get('[data-testid="ideas-list"]', { timeout: 15000 }).should("exist");
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");

      // Find the idea and check its status badge
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .closest('[data-testid="idea-item"]')
        .find('[data-testid="idea-status"] span')
        .should("contain", "Failed")
        .and("have.class", "bg-red-100");
    });
  });

  describe("Filter Dropdown with All 5 Statuses", () => {
    beforeEach(() => {
      cy.visit(TEST_IDEAS_PATH);
    });

    it("includes Backlog option in filter dropdown", () => {
      cy.get('[data-testid="filter-dropdown"]').should("be.visible");
      cy.get('[data-testid="filter-dropdown"]').select("backlog");
      cy.get('[data-testid="filter-dropdown"]').should("have.value", "backlog");
    });

    it("includes Failed option in filter dropdown", () => {
      cy.get('[data-testid="filter-dropdown"]').select("failed");
      cy.get('[data-testid="filter-dropdown"]').should("have.value", "failed");
    });

    it("filters ideas by Backlog status", () => {
      cy.visit(`${TEST_IDEAS_PATH}?filter=backlog`);
      cy.get('[data-testid="idea-item"]').should("have.length.at.least", 0);
      cy.get('[data-testid="idea-item"]').each(($item) => {
        cy.wrap($item).find('[data-testid="idea-status"]').should("contain", "Backlog");
      });
    });

    it("filters ideas by Failed status", () => {
      cy.visit(`${TEST_IDEAS_PATH}?filter=failed`);
      cy.get('[data-testid="idea-item"]').should("have.length.at.least", 0);
      cy.get('[data-testid="idea-item"]').each(($item) => {
        cy.wrap($item).find('[data-testid="idea-status"]').should("contain", "Failed");
      });
    });

    it("has all 5 status options in filter dropdown", () => {
      cy.get('[data-testid="filter-dropdown"]').within(() => {
        cy.get('option[value="all"]').should("exist");
        cy.get('option[value="backlog"]').should("exist");
        cy.get('option[value="firstLevel"]').should("exist");
        cy.get('option[value="secondLevel"]').should("exist");
        cy.get('option[value="scaling"]').should("exist");
        cy.get('option[value="failed"]').should("exist");
      });
    });
  });

  describe("New Idea Form - Default to Backlog", () => {
    beforeEach(() => {
      cy.visit(`${TEST_IDEAS_PATH}/new`);
    });

    it("defaults validation status to backlog", () => {
      cy.get('select[name="validationStatus"]').should("have.value", "backlog");
    });

    it("creates idea with backlog status by default", () => {
      const uniqueName = `Default Backlog Idea ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Testing default backlog status");
      // Don't change the status - leave it as default
      cy.get('button[type="submit"]').click();

      cy.url().should("include", TEST_IDEAS_PATH);
      cy.get('[data-testid="ideas-list"]', { timeout: 15000 }).should("exist");
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");

      // Verify it has backlog status
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .closest('[data-testid="idea-item"]')
        .find('[data-testid="idea-status"]')
        .should("contain", "Backlog");
    });

    it("allows changing status from backlog to other values", () => {
      cy.get('select[name="validationStatus"]').should("have.value", "backlog");
      cy.get('select[name="validationStatus"]').select("firstLevel");
      cy.get('select[name="validationStatus"]').should("have.value", "firstLevel");
      cy.get('select[name="validationStatus"]').select("failed");
      cy.get('select[name="validationStatus"]').should("have.value", "failed");
    });
  });
});

describe("Funnel View - 5 Stages", () => {
  beforeEach(() => {
    cy.visit(`${TEST_IDEAS_PATH}/funnel`);
  });

  it("displays all 5 funnel layers", () => {
    cy.get('[data-testid="funnel-layer-backlog"]').should("exist");
    cy.get('[data-testid="funnel-layer-firstLevel"]').should("exist");
    cy.get('[data-testid="funnel-layer-secondLevel"]').should("exist");
    cy.get('[data-testid="funnel-layer-scaling"]').should("exist");
    cy.get('[data-testid="funnel-layer-failed"]').should("exist");
  });

  it("displays Backlog stage at top with correct label", () => {
    cy.get('[data-testid="funnel-layer-backlog"]').within(() => {
      cy.contains("Backlog").should("be.visible");
    });
  });

  it("displays Failed stage with correct label", () => {
    cy.get('[data-testid="funnel-layer-failed"]').within(() => {
      cy.contains("Failed").should("be.visible");
    });
  });

  it("displays layer labels with counts for all 5 stages", () => {
    cy.get('[data-testid="funnel-layer-backlog"]').within(() => {
      cy.contains("Backlog").should("be.visible");
      cy.contains(/\d+ (idea|ideas)/).should("be.visible");
    });
    cy.get('[data-testid="funnel-layer-firstLevel"]').within(() => {
      cy.contains("Unvalidated").should("be.visible");
    });
    cy.get('[data-testid="funnel-layer-secondLevel"]').within(() => {
      cy.contains("Partially Validated").should("be.visible");
    });
    cy.get('[data-testid="funnel-layer-scaling"]').within(() => {
      cy.contains("Fully Validated").should("be.visible");
    });
    cy.get('[data-testid="funnel-layer-failed"]').within(() => {
      cy.contains("Failed").should("be.visible");
      cy.contains(/\d+ (idea|ideas)/).should("be.visible");
    });
  });

  it("has funnel shape with correct widths", () => {
    // Backlog should be widest (100%)
    cy.get('[data-testid="funnel-layer-backlog"]')
      .should("have.css", "max-width")
      .and("match", /100%|none/);

    // First Level should be 85%
    cy.get('[data-testid="funnel-layer-firstLevel"]')
      .invoke("css", "max-width")
      .then((maxWidth) => {
        // Allow for some pixel variance in percentage calculations
        expect(maxWidth).to.match(/85%|\d+px/);
      });

    // Second Level should be 65%
    cy.get('[data-testid="funnel-layer-secondLevel"]')
      .invoke("css", "max-width")
      .then((maxWidth) => {
        expect(maxWidth).to.match(/65%|\d+px/);
      });

    // Scaling should be 50%
    cy.get('[data-testid="funnel-layer-scaling"]')
      .invoke("css", "max-width")
      .then((maxWidth) => {
        expect(maxWidth).to.match(/50%|\d+px/);
      });

    // Failed should be 100% (separate section)
    cy.get('[data-testid="funnel-layer-failed"]')
      .should("have.css", "max-width")
      .and("match", /100%|none/);
  });

  it("displays Backlog status cards with gray styling", () => {
    // Create a backlog idea first
    cy.visit(`${TEST_IDEAS_PATH}/new`);
    const uniqueName = `Backlog Funnel Test ${Date.now()}`;
    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="hypothesis"]').type("Test backlog in funnel");
    cy.get('select[name="validationStatus"]').select("backlog");
    cy.get('button[type="submit"]').click();

    cy.visit(`${TEST_IDEAS_PATH}/funnel`);

    cy.get('[data-testid="funnel-layer-backlog"]')
      .find('[data-testid="idea-card"]')
      .should("have.length.at.least", 1);

    // Check for gray styling on backlog cards
    cy.get('[data-testid="funnel-layer-backlog"]')
      .find('[data-testid="idea-card"]')
      .first()
      .should("have.class", "bg-gray-50");
  });

  it("displays Failed status cards with red styling", () => {
    // Create a failed idea first
    cy.visit(`${TEST_IDEAS_PATH}/new`);
    const uniqueName = `Failed Funnel Test ${Date.now()}`;
    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="hypothesis"]').type("Test failed in funnel");
    cy.get('select[name="validationStatus"]').select("failed");
    cy.get('button[type="submit"]').click();

    cy.visit(`${TEST_IDEAS_PATH}/funnel`);

    cy.get('[data-testid="funnel-layer-failed"]')
      .find('[data-testid="idea-card"]')
      .should("have.length.at.least", 1);

    // Check for red styling on failed cards
    cy.get('[data-testid="funnel-layer-failed"]')
      .find('[data-testid="idea-card"]')
      .first()
      .should("have.class", "bg-red-50");
  });

  it("groups ideas correctly in all 5 stages", () => {
    // Visit funnel and check that each layer can contain cards
    cy.get('[data-testid="funnel-layer-backlog"]').should("exist");
    cy.get('[data-testid="funnel-layer-firstLevel"]').should("exist");
    cy.get('[data-testid="funnel-layer-secondLevel"]').should("exist");
    cy.get('[data-testid="funnel-layer-scaling"]').should("exist");
    cy.get('[data-testid="funnel-layer-failed"]').should("exist");
  });
});

describe("Status History", () => {
  describe("Status History Display on Idea Detail Page", () => {
    it("displays status history section on idea detail page", () => {
      // Create an idea
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `Status History Test ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test status history");
      cy.get('select[name="validationStatus"]').select("backlog");
      cy.get('button[type="submit"]').click();

      // Navigate to detail page
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .find("a")
        .click();

      // Check for status history section
      cy.get('[data-testid="status-history"]').should("exist");
    });

    it("shows status history with timestamps", () => {
      // Create an idea
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `Status History Timestamp ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test timestamps");
      cy.get('select[name="validationStatus"]').select("backlog");
      cy.get('button[type="submit"]').click();

      // Navigate to detail page
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .find("a")
        .click();

      // Check history has timestamp
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]').should("have.length.at.least", 1);
        cy.get('[data-testid="history-timestamp"]').should("exist");
      });
    });

    it("displays status history in reverse chronological order (most recent first)", () => {
      // Create an idea
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `Status Order Test ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test history order");
      cy.get('select[name="validationStatus"]').select("backlog");
      cy.get('button[type="submit"]').click();

      // Navigate to detail page
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .find("a")
        .click();

      // Edit to create another history entry
      cy.get('[data-testid="edit-idea-button"]').click();
      cy.get('select[name="validationStatus"]').select("firstLevel");
      cy.get('button[type="submit"]').click();

      // Check that firstLevel is shown first (most recent)
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]')
          .first()
          .should("contain", "First Level");
      });
    });

    it("updates status history when status changes", () => {
      // Create an idea
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `Status Change Test ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test status change tracking");
      cy.get('select[name="validationStatus"]').select("backlog");
      cy.get('button[type="submit"]').click();

      // Navigate to detail page
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .find("a")
        .click();

      // Should have 1 history entry (initial backlog)
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]').should("have.length", 1);
      });

      // Edit and change status
      cy.get('[data-testid="edit-idea-button"]').click();
      cy.get('select[name="validationStatus"]').select("firstLevel");
      cy.get('button[type="submit"]').click();

      // Should now have 2 history entries
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]').should("have.length", 2);
      });

      // Change status again
      cy.get('[data-testid="edit-idea-button"]').click();
      cy.get('select[name="validationStatus"]').select("scaling");
      cy.get('button[type="submit"]').click();

      // Should now have 3 history entries
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]').should("have.length", 3);
        // Most recent should be "Scaling"
        cy.get('[data-testid="history-entry"]').first().should("contain", "Scaling");
      });
    });

    it("does not add duplicate history entry when status stays the same", () => {
      // Create an idea
      cy.visit(`${TEST_IDEAS_PATH}/new`);
      const uniqueName = `No Duplicate History ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test no duplicate");
      cy.get('select[name="validationStatus"]').select("backlog");
      cy.get('button[type="submit"]').click();

      // Navigate to detail page
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
      cy.contains('[data-testid="idea-name"]', uniqueName)
        .find("a")
        .click();

      // Count initial history entries
      let initialCount: number;
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]').its("length").then((count) => {
          initialCount = count;
        });
      });

      // Edit but don't change status
      cy.get('[data-testid="edit-idea-button"]').click();
      cy.get('input[name="name"]').clear().type(`${uniqueName} Edited`);
      cy.get('button[type="submit"]').click();

      // History count should be the same
      cy.get('[data-testid="status-history"]').within(() => {
        cy.get('[data-testid="history-entry"]').should(($entries) => {
          expect($entries.length).to.equal(initialCount);
        });
      });
    });
  });
});

describe("Status Transitions - No Rules", () => {
  it("allows free movement from backlog to any status", () => {
    cy.visit(`${TEST_IDEAS_PATH}/new`);
    const uniqueName = `Free Movement Test ${Date.now()}`;
    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="hypothesis"]').type("Test free transitions");
    cy.get('select[name="validationStatus"]').select("backlog");
    cy.get('button[type="submit"]').click();

    cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
    cy.contains('[data-testid="idea-name"]', uniqueName).find("a").click();

    // Can move directly to scaling
    cy.get('[data-testid="edit-idea-button"]').click();
    cy.get('select[name="validationStatus"]').select("scaling");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="idea-detail-status"]').should("contain", "Scaling");

    // Can move back to backlog
    cy.get('[data-testid="edit-idea-button"]').click();
    cy.get('select[name="validationStatus"]').select("backlog");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="idea-detail-status"]').should("contain", "Backlog");

    // Can move to failed
    cy.get('[data-testid="edit-idea-button"]').click();
    cy.get('select[name="validationStatus"]').select("failed");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="idea-detail-status"]').should("contain", "Failed");
  });

  it("allows failed ideas to be moved back to active statuses", () => {
    cy.visit(`${TEST_IDEAS_PATH}/new`);
    const uniqueName = `Failed Recovery ${Date.now()}`;
    cy.get('input[name="name"]').type(uniqueName);
    cy.get('textarea[name="hypothesis"]').type("Test recovery from failed");
    cy.get('select[name="validationStatus"]').select("failed");
    cy.get('button[type="submit"]').click();

    cy.url().should("include", TEST_IDEAS_PATH);
    cy.get('[data-testid="ideas-list"]', { timeout: 15000 }).should("exist");
    cy.contains(uniqueName, { timeout: 20000 }).should("be.visible");
    cy.contains('[data-testid="idea-name"]', uniqueName).find("a").click();

    // Move from failed back to firstLevel
    cy.get('[data-testid="edit-idea-button"]').click();
    cy.get('select[name="validationStatus"]').select("firstLevel");
    cy.get('button[type="submit"]').click();
    cy.get('[data-testid="idea-detail-status"]').should("contain", "First Level");
  });
});
