import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const portfolioSeeds = [
  {
    code: "routeburn",
    organizationName: "Routeburn",
    name: "All Products",
    owners: ["timothy.cochran@gmail.com"],
    products: [{ code: "product-flow", name: "Product Flow" }],
  },
  {
    code: "test",
    organizationName: "E2E Tests",
    name: "Test Portfolio",
    owners: ["test@test.io"],
    products: [
      { code: "test-web-app", name: "Test Web App" },
      { code: "test-mobile-app", name: "Test Mobile App" },
    ],
  },
];

// Ideas derived from spec files for Product Flow
const specIdeas = [
  {
    name: "Frontend Initialization",
    hypothesis:
      "If we initialize a modern frontend with TypeScript and Tailwind CSS, then we will have a solid foundation for rapid UI development with type safety and utility-first styling.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "AWS Amplify Deployment",
    hypothesis:
      "If we deploy to AWS Amplify with CI/CD, then we will have automated deployments on every push, reducing manual deployment overhead and enabling faster iteration.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "CI/CD Integration Tests",
    hypothesis:
      "If we integrate Cypress E2E tests into our CI/CD pipeline, then we will catch regressions early and maintain confidence in our deployments.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "DynamoDB Ideas List",
    hypothesis:
      "If we store ideas in DynamoDB via Amplify Gen 2, then we will have a scalable, serverless data store that integrates seamlessly with our frontend.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Amplify Gen 2 Migration",
    hypothesis:
      "If we migrate to Amplify Gen 2 with TypeScript-first configuration, then we will have better type safety and a more maintainable infrastructure-as-code setup.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Ideas Form",
    hypothesis:
      "If we provide a form for users to submit new ideas with validation, then we will ensure data quality and make idea capture frictionless.",
    validationStatus: "scaling" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Ideas List Sorting",
    hypothesis:
      "If we allow users to sort ideas by name, status, age, and votes, then they can quickly find and prioritize the most relevant ideas.",
    validationStatus: "scaling" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Ideas List Filtering",
    hypothesis:
      "If we allow users to filter ideas by validation status, then they can focus on ideas at specific stages of the validation funnel.",
    validationStatus: "secondLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Idea Detail View",
    hypothesis:
      "If we provide a detailed view for each idea, then users can see all information about an idea in one place and make informed decisions.",
    validationStatus: "secondLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Idea Upvoting",
    hypothesis:
      "If team members can upvote ideas, then we can gauge collective interest and prioritize ideas that resonate with the team.",
    validationStatus: "scaling" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Idea Age Column",
    hypothesis:
      "If we display how long an idea has been in the backlog, then teams can identify stale ideas and ensure nothing gets forgotten.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Idea Source Field",
    hypothesis:
      "If we track where each idea originated (customer feedback, brainstorm, etc.), then we can analyze which sources produce the best ideas.",
    validationStatus: "scaling" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Lightweight Knowledge Base",
    hypothesis:
      "If we provide a simple knowledge base for storing markdown documents, then teams can centralize product documentation alongside their idea backlog.",
    validationStatus: "scaling" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Team Management",
    hypothesis:
      "If we allow defining team members and roles, then we can enable collaboration features like assignment and notifications.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Expected Completion Date (ECD)",
    hypothesis:
      "If we track expected completion dates for ideas, then teams can better plan and communicate timelines to stakeholders.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Public API",
    hypothesis:
      "If we expose a public API, then teams can integrate Product Flow with their existing tools and automate workflows.",
    validationStatus: "firstLevel" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "MCP Integration",
    hypothesis:
      "If we implement Model Context Protocol (MCP) support, then AI assistants can interact with Product Flow data directly.",
    validationStatus: "firstLevel" as const,
    source: "marketTrend" as const,
  },
  {
    name: "Roadmap View",
    hypothesis:
      "If we provide a timeline/roadmap visualization, then stakeholders can see planned work and dependencies at a glance.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Funnel View",
    hypothesis:
      "If we visualize ideas as a validation funnel, then teams can see the flow of ideas through different stages and identify bottlenecks.",
    validationStatus: "firstLevel" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "GitHub Integration",
    hypothesis:
      "If we integrate with GitHub, then teams can link ideas to issues/PRs and track implementation progress automatically.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Jira Integration",
    hypothesis:
      "If we integrate with Jira, then enterprise teams can sync ideas with their existing project management workflow.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Spec Generation",
    hypothesis:
      "If we can generate specification documents from ideas, then we reduce the overhead of moving from ideation to implementation.",
    validationStatus: "firstLevel" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Task Generation",
    hypothesis:
      "If we can break down ideas into actionable tasks, then teams can move more quickly from concept to execution.",
    validationStatus: "firstLevel" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Multi-tenancy",
    hypothesis:
      "If we support multiple portfolios and products, then organizations can manage multiple product lines from a single instance.",
    validationStatus: "scaling" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Customer Portal",
    hypothesis:
      "If we provide a public-facing view for customers to submit and vote on ideas, then we can capture direct customer feedback at scale.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
];

async function deleteAllData() {
  console.log("Deleting all existing data...\n");

  // Delete all Ideas
  try {
    const ideasResult = await client.models.Idea.list();
    const ideas = ideasResult.data ?? [];
    console.log(`Found ${ideas.length} ideas to delete`);
    for (const idea of ideas) {
      await client.models.Idea.delete({ id: idea.id });
    }
    console.log("Deleted all ideas");
  } catch (error) {
    console.error("Error deleting ideas:", error);
  }

  // Delete all KB Documents
  try {
    const docsResult = await client.models.KBDocument.list();
    const docs = docsResult.data ?? [];
    console.log(`Found ${docs.length} KB documents to delete`);
    for (const doc of docs) {
      await client.models.KBDocument.delete({ id: doc.id });
    }
    console.log("Deleted all KB documents");
  } catch (error) {
    console.error("Error deleting KB documents:", error);
  }

  // Delete all Portfolios
  try {
    const portfoliosResult = await client.models.Portfolio.list();
    const portfolios = portfoliosResult.data ?? [];
    console.log(`Found ${portfolios.length} portfolios to delete`);
    for (const portfolio of portfolios) {
      await client.models.Portfolio.delete({ code: portfolio.code });
    }
    console.log("Deleted all portfolios");
  } catch (error) {
    console.error("Error deleting portfolios:", error);
  }

  console.log("\nAll existing data deleted.\n");
}

async function seedPortfolios() {
  console.log("Seeding portfolios...\n");

  for (const portfolio of portfolioSeeds) {
    try {
      const result = await client.models.Portfolio.create({
        code: portfolio.code,
        organizationName: portfolio.organizationName,
        name: portfolio.name,
        owners: portfolio.owners,
        products: JSON.stringify(portfolio.products) as unknown as null,
      });

      if (result.data) {
        console.log(`Created portfolio: ${portfolio.name} (${portfolio.code})`);
        console.log(`  - Organization: ${portfolio.organizationName}`);
        console.log(`  - Owners: ${portfolio.owners.join(", ")}`);
        console.log(`  - Products: ${portfolio.products.map((p) => p.name).join(", ")}`);
        console.log();
      } else {
        console.error(`Failed to create portfolio: ${portfolio.code}`, result.errors);
      }
    } catch (error) {
      console.error(`Error creating portfolio ${portfolio.code}:`, error);
    }
  }
}

async function seedIdeas() {
  console.log("Seeding ideas for Routeburn / Product Flow...\n");

  const portfolioCode = "routeburn";
  const productCode = "product-flow";

  let ideaNumber = 1;
  for (const idea of specIdeas) {
    try {
      const result = await client.models.Idea.create({
        ideaNumber,
        name: idea.name,
        hypothesis: idea.hypothesis,
        validationStatus: idea.validationStatus,
        source: idea.source,
        portfolioCode,
        productCode,
        upvotes: Math.floor(Math.random() * 10), // Random upvotes 0-9
      });

      if (result.data) {
        console.log(`Created idea #${ideaNumber}: ${idea.name}`);
        ideaNumber++;
      } else {
        console.error(`Failed to create idea: ${idea.name}`, result.errors);
      }
    } catch (error) {
      console.error(`Error creating idea ${idea.name}:`, error);
    }
  }

  console.log(`\nCreated ${ideaNumber - 1} ideas for Product Flow.`);
}

// Test ideas for test portfolio
const testIdeas = [
  {
    name: "Test Feature One",
    hypothesis: "If we implement test feature one, then we can verify sorting works correctly.",
    validationStatus: "firstLevel" as const,
    source: "customerFeedback" as const,
  },
  {
    name: "Test Feature Two",
    hypothesis: "If we implement test feature two, then we can verify filtering works correctly.",
    validationStatus: "secondLevel" as const,
    source: "teamBrainstorm" as const,
  },
  {
    name: "Alpha Feature",
    hypothesis: "If we implement alpha feature, then it will sort first alphabetically.",
    validationStatus: "scaling" as const,
    source: "userResearch" as const,
  },
  {
    name: "Zebra Feature",
    hypothesis: "If we implement zebra feature, then it will sort last alphabetically.",
    validationStatus: "firstLevel" as const,
    source: "marketTrend" as const,
  },
  {
    name: "Beta Feature",
    hypothesis: "If we implement beta feature, then upvoting can be tested.",
    validationStatus: "firstLevel" as const,
    source: "competitorAnalysis" as const,
  },
];

async function seedTestData() {
  console.log("Seeding test data for Test Portfolio / Test Web App...\n");

  const portfolioCode = "test";
  const productCode = "test-web-app";

  // Seed test ideas
  let ideaNumber = 1;
  for (const idea of testIdeas) {
    try {
      const result = await client.models.Idea.create({
        ideaNumber,
        name: idea.name,
        hypothesis: idea.hypothesis,
        validationStatus: idea.validationStatus,
        source: idea.source,
        portfolioCode,
        productCode,
        upvotes: ideaNumber, // Use idea number as upvotes for predictable sort testing
      });

      if (result.data) {
        console.log(`Created test idea #${ideaNumber}: ${idea.name}`);
        ideaNumber++;
      } else {
        console.error(`Failed to create test idea: ${idea.name}`, result.errors);
      }
    } catch (error) {
      console.error(`Error creating test idea ${idea.name}:`, error);
    }
  }

  // Seed test KB document
  try {
    const result = await client.models.KBDocument.create({
      title: "Test Document",
      content: "# Test Document\n\nThis is test content for E2E testing.",
      portfolioCode,
      productCode,
    });

    if (result.data) {
      console.log("Created test KB document");
    } else {
      console.error("Failed to create test KB document", result.errors);
    }
  } catch (error) {
    console.error("Error creating test KB document:", error);
  }

  console.log(`\nCreated ${testIdeas.length} test ideas and 1 KB document.`);
}

async function main() {
  await deleteAllData();
  await seedPortfolios();
  await seedIdeas();
  await seedTestData();
  console.log("\nSeeding complete!");
}

main();
