import { TEST_IDEAS_PATH } from "../support/test-paths";

describe("Ideas", () => {
  describe("List Page", () => {
    beforeEach(() => {
      cy.visit(TEST_IDEAS_PATH);
    });

    it("displays the heading", () => {
      cy.contains("h1", "Idea Backlog").should("be.visible");
    });

    it("displays ideas table with correct columns", () => {
      cy.get('[data-testid="ideas-list"]').should("exist");
      cy.contains("th", "#").should("be.visible");
      cy.contains("th", "Age").should("be.visible");
      cy.contains("th", "Name").should("be.visible");
      cy.contains("th", "Hypothesis").should("be.visible");
      cy.contains("th", "Validation Status").should("be.visible");
      cy.contains("th", "Source").should("be.visible");
      cy.contains("th", "Votes").should("be.visible");
    });

    it("displays ideas from the database", () => {
      cy.get('[data-testid="ideas-list"]').should("exist");
      cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
    });

    it("shows idea number, age, hypothesis, name, status and source for each idea", () => {
      cy.get('[data-testid="idea-item"]').first().within(() => {
        cy.get('[data-testid="idea-number"]').invoke("text").should("match", /^\d+$/);
        cy.get('[data-testid="idea-age"]').invoke("text").should("match", /(just now|\d+ (min|hour|day|week|month)s?)/);
        cy.get('[data-testid="idea-hypothesis"]').should("not.be.empty");
        cy.get('[data-testid="idea-name"]').should("not.be.empty");
        cy.get('[data-testid="idea-source"]').should("exist");
      });
    });

    it("has a link to add new idea", () => {
      cy.contains("a", "+ New Idea").should("be.visible");
      cy.contains("a", "+ New Idea").click();
      cy.url().should("include", `${TEST_IDEAS_PATH}/new`);
    });

    describe("Sorting", () => {
      it("displays sort dropdown with all options", () => {
        cy.get('[data-testid="sort-dropdown"]').should("be.visible");
        cy.get('[data-testid="sort-dropdown"]').select("ideaNumber");
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "ideaNumber");
        cy.get('[data-testid="sort-dropdown"]').select("age");
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "age");
        cy.get('[data-testid="sort-dropdown"]').select("ageOldest");
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "ageOldest");
        cy.get('[data-testid="sort-dropdown"]').select("name");
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
        cy.get('[data-testid="sort-dropdown"]').select("validationStatus");
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "validationStatus");
        cy.get('[data-testid="sort-dropdown"]').select("upvotes");
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "upvotes");
      });

      it("updates URL when sort option changes", () => {
        cy.get('[data-testid="sort-dropdown"]').select("name");
        cy.url().should("include", "?sort=name");
        cy.get('[data-testid="sort-dropdown"]').select("validationStatus");
        cy.url().should("include", "?sort=validationStatus");
      });

      it("persists sort option on page refresh", () => {
        cy.visit(`${TEST_IDEAS_PATH}?sort=name`);
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
        cy.reload();
        cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
      });

      it("sorts ideas by name alphabetically", () => {
        cy.visit(`${TEST_IDEAS_PATH}?sort=name`);
        cy.get('[data-testid="idea-name"]').then(($names) => {
          const names = [...$names].map((el) => el.textContent || "");
          const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
          expect(names).to.deep.equal(sortedNames);
        });
      });

      it("sorts ideas by upvotes descending", () => {
        cy.visit(`${TEST_IDEAS_PATH}?sort=upvotes`);
        cy.get('[data-testid="upvote-count"]').then(($counts) => {
          const counts = [...$counts].map((el) => parseInt(el.textContent || "0", 10));
          const sortedCounts = [...counts].sort((a, b) => b - a);
          expect(counts).to.deep.equal(sortedCounts);
        });
      });

      it("updates displayed ideas when sort dropdown changes without refresh", () => {
        cy.get('[data-testid="sort-dropdown"]').select("name");
        cy.url().should("include", "sort=name");
        cy.get('[data-testid="idea-name"]').should("have.length.at.least", 1).then(($sortedNames) => {
          const sortedNames = [...$sortedNames].map((el) => el.textContent || "");
          const expectedOrder = [...sortedNames].sort((a, b) => a.localeCompare(b));
          expect(sortedNames).to.deep.equal(expectedOrder);
        });
      });
    });

    describe("Filtering", () => {
      it("displays filter dropdown with all options", () => {
        cy.get('[data-testid="filter-dropdown"]').should("be.visible");
        cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
        cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
        cy.get('[data-testid="filter-dropdown"]').select("secondLevel");
        cy.get('[data-testid="filter-dropdown"]').should("have.value", "secondLevel");
        cy.get('[data-testid="filter-dropdown"]').select("scaling");
        cy.get('[data-testid="filter-dropdown"]').should("have.value", "scaling");
        cy.get('[data-testid="filter-dropdown"]').select("all");
        cy.get('[data-testid="filter-dropdown"]').should("have.value", "all");
      });

      it("updates URL when filter option changes", () => {
        cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
        cy.url().should("include", "?filter=firstLevel");
        cy.get('[data-testid="filter-dropdown"]').select("secondLevel");
        cy.url().should("include", "?filter=secondLevel");
      });

      it("persists filter option on page refresh", () => {
        cy.visit(`${TEST_IDEAS_PATH}?filter=firstLevel`);
        cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
        cy.reload();
        cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
      });

      it("filters ideas by validation status", () => {
        cy.visit(`${TEST_IDEAS_PATH}?filter=firstLevel`);
        cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
        cy.get('[data-testid="idea-item"]').each(($item) => {
          cy.wrap($item).find('[data-testid="idea-status"]').should("contain", "First Level");
        });
      });

      it("updates displayed ideas when filter dropdown changes without refresh", () => {
        cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
        cy.url().should("include", "filter=firstLevel");
        cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
        cy.get('[data-testid="idea-status"]').each(($status) => {
          cy.wrap($status).should("contain", "First Level");
        });
      });
    });

    describe("Sort and Filter Combination", () => {
      it("preserves sort when changing filter", () => {
        cy.visit(`${TEST_IDEAS_PATH}?sort=name`);
        cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
        cy.url().should("include", "sort=name");
        cy.url().should("include", "filter=firstLevel");
      });

      it("preserves filter when changing sort", () => {
        cy.visit(`${TEST_IDEAS_PATH}?filter=firstLevel`);
        cy.get('[data-testid="sort-dropdown"]').select("name");
        cy.url().should("include", "filter=firstLevel");
        cy.url().should("include", "sort=name");
      });
    });

    describe("Expandable Rows", () => {
      it("expands row when clicked", () => {
        cy.get('[data-testid="idea-item"]').first().click();
        cy.get('[data-testid="expanded-content"]').should("be.visible");
      });

      it("shows full hypothesis in expanded view", () => {
        cy.get('[data-testid="idea-item"]').first().click();
        cy.get('[data-testid="expanded-hypothesis"]').should("be.visible");
      });

      it("collapses row when clicked again", () => {
        cy.get('[data-testid="idea-item"]').first().click();
        cy.get('[data-testid="expanded-content"]').should("be.visible");
        cy.get('[data-testid="idea-item"]').first().click();
        cy.get('[data-testid="expanded-content"]').should("not.exist");
      });

      it("collapses previous row when expanding a new one", () => {
        cy.get('[data-testid="idea-item"]').should("have.length.at.least", 2);
        cy.get('[data-testid="idea-item"]').eq(0).click();
        cy.get('[data-testid="expanded-content"]').should("have.length", 1);
        cy.get('[data-testid="idea-item"]').eq(1).click();
        cy.get('[data-testid="expanded-content"]').should("have.length", 1);
      });

      it("does not expand when clicking name link", () => {
        cy.get('[data-testid="idea-name"]').first().find("a").click();
        cy.url().should("include", "/ideas/");
      });

      it("does not expand when clicking upvote button", () => {
        cy.get('[data-testid="upvote-button"]').first().click();
        cy.get('[data-testid="expanded-content"]').should("not.exist");
      });
    });

    describe("Upvoting", () => {
      it("displays upvote button and count for each idea", () => {
        cy.get('[data-testid="idea-item"]').first().within(() => {
          cy.get('[data-testid="upvote-button"]').should("exist");
          cy.get('[data-testid="upvote-count"]').should("exist");
        });
      });

      it("increments upvote count when clicked", () => {
        cy.get('[data-testid="idea-item"]')
          .first()
          .within(() => {
            cy.get('[data-testid="upvote-count"]')
              .invoke("text")
              .then((initialCount) => {
                const initial = parseInt(initialCount, 10) || 0;
                cy.get('[data-testid="upvote-button"]').click();
                cy.get('[data-testid="upvote-count"]').should("contain", String(initial + 1));
              });
          });
      });

      it("persists upvote count after page refresh", () => {
        cy.get('[data-testid="idea-item"]').first().as("firstIdea");
        cy.get("@firstIdea").find('[data-testid="idea-name"]').invoke("text").as("ideaName");
        cy.get("@firstIdea").find('[data-testid="upvote-count"]').invoke("text").then((initialCountText) => {
          const initialCount = parseInt(initialCountText, 10) || 0;
          const expectedCount = initialCount + 1;

          cy.get("@firstIdea").find('[data-testid="upvote-button"]').click();
          cy.get("@firstIdea").find('[data-testid="upvote-count"]').should("contain", String(expectedCount));

          cy.wait(2000);
          cy.reload();

          cy.get("@ideaName").then((ideaName) => {
            cy.contains('[data-testid="idea-name"]', ideaName as unknown as string)
              .closest('[data-testid="idea-item"]')
              .find('[data-testid="upvote-count"]')
              .invoke("text")
              .then((countText) => {
                const persistedCount = parseInt(countText, 10) || 0;
                expect(persistedCount).to.be.at.least(expectedCount);
              });
          });
        });
      });
    });
  });

  describe("Detail Page", () => {
    it("navigates to detail page when clicking idea name", () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('[data-testid="idea-item"]').first().within(() => {
        cy.get('[data-testid="idea-name"] a').should("exist");
        cy.get('[data-testid="idea-name"] a').click();
      });
      cy.url().should("include", `${TEST_IDEAS_PATH}/`);
    });

    it("displays idea details on detail page", () => {
      cy.visit(TEST_IDEAS_PATH);
      let ideaName: string;

      cy.get('[data-testid="idea-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="idea-name"]')
            .invoke("text")
            .then((text) => {
              ideaName = text;
            });
          cy.get('[data-testid="idea-name"] a').click();
        });

      cy.get('[data-testid="idea-detail-name"]').should(($el) => {
        expect($el.text()).to.include(ideaName);
      });
      cy.get('[data-testid="idea-detail-hypothesis"]').should("exist");
      cy.get('[data-testid="idea-detail-status"]').should("exist");
      cy.get('[data-testid="idea-detail-source"]').should("exist");
      cy.get('[data-testid="idea-detail-created"]').should("exist");
    });

    it("preserves line breaks in hypothesis on detail page", () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('[data-testid="idea-item"]').first().within(() => {
        cy.get('[data-testid="idea-name"] a').click();
      });

      cy.get('[data-testid="idea-detail-hypothesis"]').should("have.css", "white-space", "pre-wrap");
    });

    it("navigates back to ideas list", () => {
      cy.visit(TEST_IDEAS_PATH);
      cy.get('[data-testid="idea-item"]').first().within(() => {
        cy.get('[data-testid="idea-name"] a').click();
      });

      cy.get('[data-testid="back-to-ideas"]').click();
      cy.url().should("include", TEST_IDEAS_PATH);
    });

    it("shows error for invalid idea ID", () => {
      cy.visit(`${TEST_IDEAS_PATH}/invalid-id-123`);
      cy.contains("Idea not found").should("be.visible");
      cy.get('[data-testid="back-to-ideas"]').should("exist");
    });
  });

  describe("Form Page", () => {
    beforeEach(() => {
      cy.visit(`${TEST_IDEAS_PATH}/new`);
    });

    it("displays the form heading and all fields", () => {
      cy.contains("h1", "Add New Idea").should("be.visible");
      cy.get('input[name="name"]').should("be.visible");
      cy.get('textarea[name="hypothesis"]').should("be.visible");
      cy.get('select[name="validationStatus"]').should("be.visible");
      cy.get('[data-testid="source-select"]').should("exist");
      cy.get('button[type="submit"]').should("be.visible").and("contain", "Add Idea");
    });

    it("shows validation error when submitting empty form", () => {
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="name-error"]').should("be.visible");
      cy.get('[data-testid="hypothesis-error"]').should("be.visible");
    });

    it("allows entering and submitting idea details", () => {
      cy.get('input[name="name"]').type("My Test Idea");
      cy.get('textarea[name="hypothesis"]').type("This is my hypothesis");
      cy.get('select[name="validationStatus"]').select("secondLevel");
      cy.get('input[name="name"]').should("have.value", "My Test Idea");
      cy.get('textarea[name="hypothesis"]').should("have.value", "This is my hypothesis");
      cy.get('select[name="validationStatus"]').should("have.value", "secondLevel");
    });

    it("has all source options", () => {
      cy.get('[data-testid="source-select"]').select("customerFeedback");
      cy.get('[data-testid="source-select"]').should("have.value", "customerFeedback");
      cy.get('[data-testid="source-select"]').select("teamBrainstorm");
      cy.get('[data-testid="source-select"]').should("have.value", "teamBrainstorm");
      cy.get('[data-testid="source-select"]').select("competitorAnalysis");
      cy.get('[data-testid="source-select"]').should("have.value", "competitorAnalysis");
    });

    it("allows creating idea without source (optional)", () => {
      cy.get('[name="name"]').type("Test Idea Without Source");
      cy.get('[name="hypothesis"]').type("Testing that source is optional");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", TEST_IDEAS_PATH);
    });

    it("redirects to ideas page and shows new idea after submission", () => {
      const uniqueName = `Test Idea ${Date.now()}`;
      cy.get('input[name="name"]').type(uniqueName);
      cy.get('textarea[name="hypothesis"]').type("Test hypothesis");
      cy.get('button[type="submit"]').click();
      cy.url().should("include", TEST_IDEAS_PATH);
      cy.url().should("not.include", "/new");
      cy.get("h1").contains("Idea Backlog").should("be.visible");
      cy.get('[data-testid="ideas-list"]', { timeout: 15000 }).should("exist");
      cy.contains(uniqueName, { timeout: 10000 }).should("be.visible");
    });
  });
});
