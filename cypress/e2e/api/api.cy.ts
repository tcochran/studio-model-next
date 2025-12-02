import { TEST_PORTFOLIO_CODE, TEST_PRODUCT_CODE } from "../../support/test-paths";

describe("Public API", () => {
  // Load API config from amplify_outputs.json
  let apiUrl: string;
  let apiKey: string;

  before(() => {
    cy.readFile("amplify_outputs.json").then((outputs) => {
      apiUrl = outputs.data.url;
      apiKey = outputs.data.api_key;
    });
  });

  const graphqlRequest = (query: string, variables?: Record<string, unknown>) => {
    return cy.request({
      method: "POST",
      url: apiUrl,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: {
        query,
        variables,
      },
    });
  };

  describe("Ideas API", () => {
    describe("List Ideas", () => {
      it("lists all ideas", () => {
        const query = `
          query ListIdeas {
            listIdeas {
              items {
                id
                ideaNumber
                name
                hypothesis
                validationStatus
                upvotes
                source
                portfolioCode
                productCode
                createdAt
              }
            }
          }
        `;

        graphqlRequest(query).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.listIdeas.items).to.be.an("array");
          expect(response.body.data.listIdeas.items.length).to.be.greaterThan(0);
        });
      });

      it("lists ideas by product code", () => {
        const query = `
          query ListIdeasByProductCode($productCode: String!) {
            listIdeaByProductCode(productCode: $productCode) {
              items {
                id
                ideaNumber
                name
                portfolioCode
                productCode
              }
            }
          }
        `;

        graphqlRequest(query, { productCode: TEST_PRODUCT_CODE }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.listIdeaByProductCode.items).to.be.an("array");
          response.body.data.listIdeaByProductCode.items.forEach((idea: { productCode: string }) => {
            expect(idea.productCode).to.eq(TEST_PRODUCT_CODE);
          });
        });
      });

      it("lists ideas by portfolio code", () => {
        const query = `
          query ListIdeasByPortfolioCode($portfolioCode: String!) {
            listIdeaByPortfolioCode(portfolioCode: $portfolioCode) {
              items {
                id
                ideaNumber
                name
                portfolioCode
                productCode
              }
            }
          }
        `;

        graphqlRequest(query, { portfolioCode: TEST_PORTFOLIO_CODE }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.listIdeaByPortfolioCode.items).to.be.an("array");
          response.body.data.listIdeaByPortfolioCode.items.forEach((idea: { portfolioCode: string }) => {
            expect(idea.portfolioCode).to.eq(TEST_PORTFOLIO_CODE);
          });
        });
      });

      it.skip("lists ideas by validation status", () => {
        const query = `
          query ListIdeasByStatus($validationStatus: String!) {
            listIdeaByValidationStatus(validationStatus: $validationStatus) {
              items {
                id
                ideaNumber
                name
                validationStatus
              }
            }
          }
        `;

        graphqlRequest(query, { validationStatus: "firstLevel" }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.listIdeaByValidationStatus.items).to.be.an("array");
          response.body.data.listIdeaByValidationStatus.items.forEach((idea: { validationStatus: string }) => {
            expect(idea.validationStatus).to.eq("firstLevel");
          });
        });
      });
    });

    describe("Get Idea", () => {
      let testIdeaId: string;

      before(() => {
        // Get an existing idea ID for testing
        const query = `
          query ListIdeas {
            listIdeaByProductCode(productCode: "${TEST_PRODUCT_CODE}") {
              items {
                id
                ideaNumber
              }
            }
          }
        `;

        graphqlRequest(query).then((response) => {
          const ideas = response.body.data.listIdeaByProductCode.items;
          if (ideas.length > 0) {
            testIdeaId = ideas[0].id;
          }
        });
      });

      it("gets an idea by ID", () => {
        const query = `
          query GetIdea($id: ID!) {
            getIdea(id: $id) {
              id
              ideaNumber
              name
              hypothesis
              validationStatus
              upvotes
              source
              portfolioCode
              productCode
              createdAt
            }
          }
        `;

        cy.wrap(null).then(() => {
          if (!testIdeaId) {
            cy.log("No test idea found, skipping test");
            return;
          }

          graphqlRequest(query, { id: testIdeaId }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.data.getIdea).to.not.be.null;
            expect(response.body.data.getIdea.id).to.eq(testIdeaId);
          });
        });
      });

      it("returns null for non-existent idea ID", () => {
        const query = `
          query GetIdea($id: ID!) {
            getIdea(id: $id) {
              id
              name
            }
          }
        `;

        graphqlRequest(query, { id: "non-existent-id-12345" }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.getIdea).to.be.null;
        });
      });
    });

    describe("Create and Update Idea", () => {
      let createdIdeaId: string;
      const uniqueIdeaNumber = Math.floor(Date.now() / 1000);

      it("creates a new idea via API", () => {
        const mutation = `
          mutation CreateIdea($input: CreateIdeaInput!) {
            createIdea(input: $input) {
              id
              ideaNumber
              name
              hypothesis
              validationStatus
              upvotes
              source
              portfolioCode
              productCode
              createdAt
            }
          }
        `;

        const input = {
          ideaNumber: uniqueIdeaNumber,
          name: `API Test Idea ${uniqueIdeaNumber}`,
          hypothesis: "This idea was created via the public API for testing purposes",
          validationStatus: "firstLevel",
          upvotes: 0,
          source: "teamBrainstorm",
          portfolioCode: TEST_PORTFOLIO_CODE,
          productCode: TEST_PRODUCT_CODE,
        };

        graphqlRequest(mutation, { input }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.createIdea).to.not.be.null;
          expect(response.body.data.createIdea.name).to.eq(input.name);
          expect(response.body.data.createIdea.hypothesis).to.eq(input.hypothesis);
          expect(response.body.data.createIdea.ideaNumber).to.eq(uniqueIdeaNumber);
          createdIdeaId = response.body.data.createIdea.id;
        });
      });

      it("updates an existing idea via API", () => {
        const mutation = `
          mutation UpdateIdea($input: UpdateIdeaInput!) {
            updateIdea(input: $input) {
              id
              ideaNumber
              name
              hypothesis
              upvotes
            }
          }
        `;

        cy.wrap(null).then(() => {
          if (!createdIdeaId) {
            cy.log("No created idea, skipping test");
            return;
          }

          const input = {
            id: createdIdeaId,
            hypothesis: "Updated hypothesis via API",
            upvotes: 5,
          };

          graphqlRequest(mutation, { input }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.data.updateIdea.hypothesis).to.eq("Updated hypothesis via API");
            expect(response.body.data.updateIdea.upvotes).to.eq(5);
          });
        });
      });

      it("deletes an idea via API", () => {
        const mutation = `
          mutation DeleteIdea($input: DeleteIdeaInput!) {
            deleteIdea(input: $input) {
              id
            }
          }
        `;

        cy.wrap(null).then(() => {
          if (!createdIdeaId) {
            cy.log("No created idea, skipping test");
            return;
          }

          graphqlRequest(mutation, { input: { id: createdIdeaId } }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.data.deleteIdea.id).to.eq(createdIdeaId);
          });
        });
      });
    });
  });

  describe("Portfolios API", () => {
    it("lists all portfolios", () => {
      const query = `
        query ListPortfolios {
          listPortfolios {
            items {
              code
              name
              organizationName
              owners
              products
            }
          }
        }
      `;

      graphqlRequest(query).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.listPortfolios.items).to.be.an("array");
      });
    });

    it("gets a portfolio by code", () => {
      const query = `
        query GetPortfolio($code: String!) {
          getPortfolio(code: $code) {
            code
            name
            organizationName
            owners
            products
          }
        }
      `;

      graphqlRequest(query, { code: TEST_PORTFOLIO_CODE }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.getPortfolio).to.not.be.null;
        expect(response.body.data.getPortfolio.code).to.eq(TEST_PORTFOLIO_CODE);
      });
    });

    it("returns null for non-existent portfolio code", () => {
      const query = `
        query GetPortfolio($code: String!) {
          getPortfolio(code: $code) {
            code
            name
          }
        }
      `;

      graphqlRequest(query, { code: "non-existent-portfolio-xyz" }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.getPortfolio).to.be.null;
      });
    });
  });

  describe("Knowledge Base API", () => {
    it("lists all KB documents", () => {
      const query = `
        query ListKBDocuments {
          listKBDocuments {
            items {
              id
              title
              content
              portfolioCode
              productCode
            }
          }
        }
      `;

      graphqlRequest(query).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.listKBDocuments.items).to.be.an("array");
      });
    });

    it("lists KB documents by product code", () => {
      const query = `
        query ListKBByProductCode($productCode: String!) {
          listKBDocumentByProductCode(productCode: $productCode) {
            items {
              id
              title
              productCode
            }
          }
        }
      `;

      graphqlRequest(query, { productCode: TEST_PRODUCT_CODE }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.listKBDocumentByProductCode.items).to.be.an("array");
      });
    });
  });

  describe("Authentication", () => {
    it("rejects requests without API key", () => {
      cy.request({
        method: "POST",
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          query: "query { listIdeas { items { id } } }",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });

    it("rejects requests with invalid API key", () => {
      cy.request({
        method: "POST",
        url: apiUrl,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "invalid-api-key-12345",
        },
        body: {
          query: "query { listIdeas { items { id } } }",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("Custom Queries (Phase 1)", () => {
    describe("getIdeaByNumber", () => {
      it.skip("gets an idea by portfolio, product, and idea number", () => {
        const query = `
          query GetIdeaByNumber($portfolioCode: String!, $productCode: String!, $ideaNumber: Int!) {
            getIdeaByNumber(
              portfolioCode: $portfolioCode
              productCode: $productCode
              ideaNumber: $ideaNumber
            ) {
              id
              ideaNumber
              name
              hypothesis
              validationStatus
              upvotes
              source
              portfolioCode
              productCode
            }
          }
        `;

        graphqlRequest(query, {
          portfolioCode: TEST_PORTFOLIO_CODE,
          productCode: TEST_PRODUCT_CODE,
          ideaNumber: 1,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.getIdeaByNumber).to.not.be.null;
          expect(response.body.data.getIdeaByNumber.ideaNumber).to.eq(1);
          expect(response.body.data.getIdeaByNumber.portfolioCode).to.eq(TEST_PORTFOLIO_CODE);
          expect(response.body.data.getIdeaByNumber.productCode).to.eq(TEST_PRODUCT_CODE);
        });
      });

      it.skip("returns null for non-existent idea number", () => {
        const query = `
          query GetIdeaByNumber($portfolioCode: String!, $productCode: String!, $ideaNumber: Int!) {
            getIdeaByNumber(
              portfolioCode: $portfolioCode
              productCode: $productCode
              ideaNumber: $ideaNumber
            ) {
              id
              ideaNumber
              name
            }
          }
        `;

        graphqlRequest(query, {
          portfolioCode: TEST_PORTFOLIO_CODE,
          productCode: TEST_PRODUCT_CODE,
          ideaNumber: 99999,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.data.getIdeaByNumber).to.be.null;
        });
      });
    });
  });
});
