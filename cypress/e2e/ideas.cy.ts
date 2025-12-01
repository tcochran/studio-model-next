describe("Ideas Page", () => {
  it("displays the heading", () => {
    cy.visit("/");
    cy.contains("h1", "Idea Backlog").should("be.visible");
  });

  it("displays ideas table with correct columns", () => {
    cy.visit("/");
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.contains("th", "Name").should("be.visible");
    cy.contains("th", "Hypothesis").should("be.visible");
    cy.contains("th", "Validation Status").should("be.visible");
  });

  it("displays ideas from the database", () => {
    cy.visit("/");
    cy.get('[data-testid="ideas-list"]').should("exist");
    cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
  });

  it("shows idea hypothesis, name and status", () => {
    cy.visit("/");
    cy.get('[data-testid="idea-item"]').first().within(() => {
      cy.get('[data-testid="idea-hypothesis"]').should("not.be.empty");
      cy.get('[data-testid="idea-name"]').should("not.be.empty");
    });
  });

  it("has a link to add new idea", () => {
    cy.visit("/");
    cy.contains("a", "+ New Idea").should("be.visible");
    cy.contains("a", "+ New Idea").click();
    cy.url().should("include", "/ideas/new");
  });

  it("displays a sort dropdown with options", () => {
    cy.visit("/");
    cy.get('[data-testid="sort-dropdown"]').should("be.visible");
    cy.get('[data-testid="sort-dropdown"]').select("name");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
    cy.get('[data-testid="sort-dropdown"]').select("validationStatus");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "validationStatus");
    cy.get('[data-testid="sort-dropdown"]').select("age");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "age");
    cy.get('[data-testid="sort-dropdown"]').select("ageOldest");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "ageOldest");
  });

  it("updates URL when sort option changes", () => {
    cy.visit("/");
    cy.get('[data-testid="sort-dropdown"]').select("name");
    cy.url().should("include", "?sort=name");
    cy.get('[data-testid="sort-dropdown"]').select("validationStatus");
    cy.url().should("include", "?sort=validationStatus");
  });

  it("persists sort option on page refresh", () => {
    cy.visit("/?sort=name");
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
    cy.reload();
    cy.get('[data-testid="sort-dropdown"]').should("have.value", "name");
  });

  it("sorts ideas by name alphabetically", () => {
    cy.visit("/?sort=name");
    cy.get('[data-testid="idea-name"]').then(($names) => {
      const names = [...$names].map((el) => el.textContent || "");
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).to.deep.equal(sortedNames);
    });
  });

  it("displays a filter dropdown with options", () => {
    cy.visit("/");
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
    cy.visit("/");
    cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
    cy.url().should("include", "?filter=firstLevel");
    cy.get('[data-testid="filter-dropdown"]').select("secondLevel");
    cy.url().should("include", "?filter=secondLevel");
  });

  it("persists filter option on page refresh", () => {
    cy.visit("/?filter=firstLevel");
    cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
    cy.reload();
    cy.get('[data-testid="filter-dropdown"]').should("have.value", "firstLevel");
  });

  it("filters ideas by validation status", () => {
    cy.visit("/?filter=firstLevel");
    cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
    cy.get('[data-testid="idea-item"]').each(($item) => {
      cy.wrap($item).find('[data-testid="idea-status"]').should("contain", "First Level");
    });
  });

  it("preserves sort when changing filter", () => {
    cy.visit("/?sort=name");
    cy.get('[data-testid="filter-dropdown"]').select("firstLevel");
    cy.url().should("include", "sort=name");
    cy.url().should("include", "filter=firstLevel");
  });

  it("preserves filter when changing sort", () => {
    cy.visit("/?filter=firstLevel");
    cy.get('[data-testid="sort-dropdown"]').select("name");
    cy.url().should("include", "filter=firstLevel");
    cy.url().should("include", "sort=name");
  });

  it("updates displayed ideas when sort dropdown changes without refresh", () => {
    cy.visit("/");

    // Change to sort by name
    cy.get('[data-testid="sort-dropdown"]').select("name");

    // Wait for URL to update
    cy.url().should("include", "sort=name");

    // Wait for content to update and verify it's sorted alphabetically
    cy.get('[data-testid="idea-name"]').should("have.length.at.least", 1).then(($sortedNames) => {
      const sortedNames = [...$sortedNames].map((el) => el.textContent || "");
      const expectedOrder = [...sortedNames].sort((a, b) => a.localeCompare(b));
      expect(sortedNames).to.deep.equal(expectedOrder);
    });
  });

  it("updates displayed ideas when filter dropdown changes without refresh", () => {
    cy.visit("/");

    // Change to filter by firstLevel
    cy.get('[data-testid="filter-dropdown"]').select("firstLevel");

    // Wait for URL to update
    cy.url().should("include", "filter=firstLevel");

    // Wait for and verify all displayed items have First Level status
    cy.get('[data-testid="idea-item"]').should("have.length.at.least", 1);
    cy.get('[data-testid="idea-status"]').each(($status) => {
      cy.wrap($status).should("contain", "First Level");
    });
  });
});
