// Test portfolio paths - used across all Cypress tests
export const TEST_PORTFOLIO_CODE = "test";
export const TEST_PRODUCT_CODE = "test-web-app";
export const TEST_BASE_PATH = `/${TEST_PORTFOLIO_CODE}/${TEST_PRODUCT_CODE}`;
export const TEST_IDEAS_PATH = `${TEST_BASE_PATH}/ideas`;
export const TEST_KB_PATH = `${TEST_BASE_PATH}/kb`;

// Test studio users - matches scripts/seed-test-data.ts
export const TEST_USERS = {
  PRODUCT_MANAGER: "pm@test.com",
  ENGINEER: "engineer@test.com",
  DESIGNER: "designer@test.com",
  NON_MEMBER: "nonmember@test.com",
};

// Test seed data constants - matches scripts/seed-portfolios.ts
export const TEST_IDEAS = {
  IDEA_1: {
    number: 1,
    name: "Test Feature One",
    hypothesis: "If we implement test feature one, then we can verify sorting works correctly.",
    status: "First Level",
    statusValue: "firstLevel",
    source: "customerFeedback",
    upvotes: 1,
  },
  IDEA_2: {
    number: 2,
    name: "Test Feature Two",
    hypothesis: "If we implement test feature two, then we can verify filtering works correctly.",
    status: "Second Level",
    statusValue: "secondLevel",
    source: "teamBrainstorm",
    upvotes: 2,
  },
  IDEA_3: {
    number: 3,
    name: "Alpha Feature",
    hypothesis: "If we implement alpha feature, then it will sort first alphabetically.",
    status: "Scaling",
    statusValue: "scaling",
    source: "userResearch",
    upvotes: 3,
  },
  IDEA_4: {
    number: 4,
    name: "Zebra Feature",
    hypothesis: "If we implement zebra feature, then it will sort last alphabetically.",
    status: "First Level",
    statusValue: "firstLevel",
    source: "marketTrend",
    upvotes: 4,
  },
  IDEA_5: {
    number: 5,
    name: "Beta Feature",
    hypothesis: "If we implement beta feature, then upvoting can be tested.",
    status: "First Level",
    statusValue: "firstLevel",
    source: "competitorAnalysis",
    upvotes: 5,
  },
} as const;
