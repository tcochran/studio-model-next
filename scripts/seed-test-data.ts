import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import outputs from "../amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const testPortfolio = {
  code: "test",
  organizationName: "E2E Tests",
  name: "Test Portfolio",
  owners: ["test@test.io"],
  products: [{ code: "test-web-app", name: "Test Web App" }],
};

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

async function deleteTestData() {
  console.log("Deleting test data...\n");

  // Delete test ideas in parallel
  try {
    const ideasResult = await client.models.Idea.list({
      filter: { portfolioCode: { eq: "test" } },
    });
    const ideas = ideasResult.data ?? [];
    console.log(`Found ${ideas.length} test ideas to delete`);

    await Promise.all(ideas.map((idea) => client.models.Idea.delete({ id: idea.id })));
    console.log(`Deleted test ideas`);
  } catch (error) {
    console.error("Error deleting test ideas:", error);
  }

  // Delete test KB documents in parallel
  try {
    const docsResult = await client.models.KBDocument.list({
      filter: { portfolioCode: { eq: "test" } },
    });
    const docs = docsResult.data ?? [];
    console.log(`Found ${docs.length} test KB documents to delete`);

    await Promise.all(docs.map((doc) => client.models.KBDocument.delete({ id: doc.id })));
    console.log(`Deleted test KB documents`);
  } catch (error) {
    console.error("Error deleting test KB documents:", error);
  }

  // Delete test portfolio
  try {
    await client.models.Portfolio.delete({ code: "test" });
    console.log(`Deleted test portfolio\n`);
  } catch (error) {
    // Portfolio might not exist, that's ok
  }
}

async function seedTestPortfolio() {
  console.log("Seeding test portfolio...\n");

  try {
    const result = await client.models.Portfolio.create({
      code: testPortfolio.code,
      organizationName: testPortfolio.organizationName,
      name: testPortfolio.name,
      owners: testPortfolio.owners,
      products: JSON.stringify(testPortfolio.products) as unknown as null,
    });

    if (result.data) {
      console.log(`Created test portfolio\n`);
    } else {
      console.error("Failed to create test portfolio", result.errors);
    }
  } catch (error) {
    console.error("Error creating test portfolio:", error);
  }
}

async function seedTestIdeas() {
  console.log("Seeding test ideas...\n");

  const portfolioCode = "test";
  const productCode = "test-web-app";

  // Create all test ideas in parallel
  try {
    const ideaPromises = testIdeas.map((idea, index) => {
      const ideaNumber = index + 1;
      return client.models.Idea.create({
        ideaNumber,
        name: idea.name,
        hypothesis: idea.hypothesis,
        validationStatus: idea.validationStatus,
        source: idea.source,
        portfolioCode,
        productCode,
        upvotes: ideaNumber, // Use idea number as upvotes for predictable sort testing
      });
    });

    const results = await Promise.all(ideaPromises);
    const successCount = results.filter((r) => r.data).length;
    console.log(`Created ${successCount} test ideas`);

    // Log each created idea
    results.forEach((result, index) => {
      if (result.data) {
        console.log(`  - Idea #${index + 1}: ${testIdeas[index].name}`);
      } else {
        console.error(`  - Failed: ${testIdeas[index].name}`, result.errors);
      }
    });
  } catch (error) {
    console.error("Error creating test ideas:", error);
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
      console.log("Created test KB document\n");
    } else {
      console.error("Failed to create test KB document", result.errors);
    }
  } catch (error) {
    console.error("Error creating test KB document:", error);
  }
}

async function main() {
  console.log("=== Starting test data seed ===\n");

  await deleteTestData();
  await seedTestPortfolio();
  await seedTestIdeas();

  console.log("=== Test data seeding complete! ===");
}

main();
