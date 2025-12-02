import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Configuration from environment variables
const GRAPHQL_URL = process.env.GRAPHQL_URL || "";
const GRAPHQL_API_KEY = process.env.GRAPHQL_API_KEY || "";

if (!GRAPHQL_URL || !GRAPHQL_API_KEY) {
  console.error("Error: GRAPHQL_URL and GRAPHQL_API_KEY environment variables are required");
  process.exit(1);
}

// Helper function to make GraphQL requests
async function graphqlRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await axios.post(
    GRAPHQL_URL,
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": GRAPHQL_API_KEY,
      },
    }
  );
  return response.data;
}

// Create MCP server
const server = new Server(
  {
    name: "product-flow",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_idea",
        description: "Get an idea by its number within a portfolio and product",
        inputSchema: {
          type: "object" as const,
          properties: {
            portfolioCode: {
              type: "string",
              description: "The portfolio code (e.g., 'routeburn')",
            },
            productCode: {
              type: "string",
              description: "The product code (e.g., 'product-flow')",
            },
            ideaNumber: {
              type: "number",
              description: "The idea number",
            },
          },
          required: ["portfolioCode", "productCode", "ideaNumber"],
        },
      },
      {
        name: "list_ideas",
        description: "List ideas for a product with optional filtering by validation status",
        inputSchema: {
          type: "object" as const,
          properties: {
            portfolioCode: {
              type: "string",
              description: "The portfolio code",
            },
            productCode: {
              type: "string",
              description: "The product code",
            },
            validationStatus: {
              type: "string",
              enum: ["firstLevel", "secondLevel", "scaling"],
              description: "Filter by validation status (optional)",
            },
          },
          required: ["portfolioCode", "productCode"],
        },
      },
      {
        name: "list_portfolios",
        description: "List all portfolios with their products",
        inputSchema: {
          type: "object" as const,
          properties: {},
        },
      },
      {
        name: "get_kb_document",
        description: "Get a knowledge base document by its ID",
        inputSchema: {
          type: "object" as const,
          properties: {
            id: {
              type: "string",
              description: "The document ID",
            },
          },
          required: ["id"],
        },
      },
      {
        name: "list_kb_documents",
        description: "List knowledge base documents for a product",
        inputSchema: {
          type: "object" as const,
          properties: {
            portfolioCode: {
              type: "string",
              description: "The portfolio code",
            },
            productCode: {
              type: "string",
              description: "The product code",
            },
          },
          required: ["portfolioCode", "productCode"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_idea": {
        const { portfolioCode, productCode, ideaNumber } = args as {
          portfolioCode: string;
          productCode: string;
          ideaNumber: number;
        };

        const result = await graphqlRequest(
          `query GetIdeaByNumber($portfolioCode: String!, $productCode: String!, $ideaNumber: Int!) {
            getIdeaByNumber(portfolioCode: $portfolioCode, productCode: $productCode, ideaNumber: $ideaNumber) {
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
              updatedAt
            }
          }`,
          { portfolioCode, productCode, ideaNumber }
        );

        if (result.errors) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: result.errors }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const idea = result.data?.getIdeaByNumber;
        if (!idea) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Idea #${ideaNumber} not found in ${portfolioCode}/${productCode}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(idea, null, 2),
            },
          ],
        };
      }

      case "list_ideas": {
        const { portfolioCode, productCode, validationStatus } = args as {
          portfolioCode: string;
          productCode: string;
          validationStatus?: string;
        };

        // Use the GSI to list by product code
        const result = await graphqlRequest(
          `query ListIdeasByProductCode($productCode: String!) {
            listIdeaByProductCode(productCode: $productCode) {
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
          }`,
          { productCode }
        );

        if (result.errors) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: result.errors }, null, 2),
              },
            ],
            isError: true,
          };
        }

        let ideas = result.data?.listIdeaByProductCode?.items || [];

        // Filter by portfolioCode in memory
        ideas = ideas.filter(
          (idea: { portfolioCode: string }) => idea.portfolioCode === portfolioCode
        );

        // Filter by validationStatus if provided
        if (validationStatus) {
          ideas = ideas.filter(
            (idea: { validationStatus: string }) => idea.validationStatus === validationStatus
          );
        }

        // Sort by ideaNumber
        ideas.sort(
          (a: { ideaNumber: number }, b: { ideaNumber: number }) =>
            a.ideaNumber - b.ideaNumber
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  portfolioCode,
                  productCode,
                  count: ideas.length,
                  ideas: ideas.map(
                    (idea: {
                      ideaNumber: number;
                      name: string;
                      validationStatus: string;
                      upvotes: number;
                    }) => ({
                      ideaNumber: idea.ideaNumber,
                      name: idea.name,
                      validationStatus: idea.validationStatus,
                      upvotes: idea.upvotes,
                    })
                  ),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_portfolios": {
        const result = await graphqlRequest(
          `query ListPortfolios {
            listPortfolios {
              items {
                code
                name
                organizationName
                owners
                products
              }
            }
          }`
        );

        if (result.errors) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: result.errors }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const portfolios = result.data?.listPortfolios?.items || [];

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  count: portfolios.length,
                  portfolios: portfolios.map(
                    (p: {
                      code: string;
                      name: string;
                      organizationName: string;
                      products: string | object;
                    }) => ({
                      code: p.code,
                      name: p.name,
                      organizationName: p.organizationName,
                      products:
                        typeof p.products === "string"
                          ? JSON.parse(p.products)
                          : p.products,
                    })
                  ),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_kb_document": {
        const { id } = args as { id: string };

        const result = await graphqlRequest(
          `query GetKBDocument($id: ID!) {
            getKBDocument(id: $id) {
              id
              title
              content
              portfolioCode
              productCode
              createdAt
              updatedAt
            }
          }`,
          { id }
        );

        if (result.errors) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: result.errors }, null, 2),
              },
            ],
            isError: true,
          };
        }

        const doc = result.data?.getKBDocument;
        if (!doc) {
          return {
            content: [
              {
                type: "text" as const,
                text: `KB Document with ID ${id} not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(doc, null, 2),
            },
          ],
        };
      }

      case "list_kb_documents": {
        const { portfolioCode, productCode } = args as {
          portfolioCode: string;
          productCode: string;
        };

        const result = await graphqlRequest(
          `query ListKBDocumentsByProductCode($productCode: String!) {
            listKBDocumentByProductCode(productCode: $productCode) {
              items {
                id
                title
                portfolioCode
                productCode
                createdAt
              }
            }
          }`,
          { productCode }
        );

        if (result.errors) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({ error: result.errors }, null, 2),
              },
            ],
            isError: true,
          };
        }

        let docs = result.data?.listKBDocumentByProductCode?.items || [];

        // Filter by portfolioCode
        docs = docs.filter(
          (doc: { portfolioCode: string }) => doc.portfolioCode === portfolioCode
        );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  portfolioCode,
                  productCode,
                  count: docs.length,
                  documents: docs.map(
                    (doc: { id: string; title: string; createdAt: string }) => ({
                      id: doc.id,
                      title: doc.title,
                      createdAt: doc.createdAt,
                    })
                  ),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    console.error("Error executing tool:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              error: error instanceof Error ? error.message : "Unknown error",
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Product Flow MCP Server running");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
