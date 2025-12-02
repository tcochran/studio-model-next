export const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  firstLevel: "First Level",
  secondLevel: "Second Level",
  scaling: "Scaling",
  failed: "Failed",
};

export const statusColors: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  firstLevel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secondLevel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export const sourceLabels: Record<string, string> = {
  customerFeedback: "Customer Feedback",
  teamBrainstorm: "Team Brainstorm",
  competitorAnalysis: "Competitor Analysis",
  userResearch: "User Research",
  marketTrend: "Market Trend",
  internalRequest: "Internal Request",
  other: "Other",
};

export const sourceColor = "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";

export const sortOptions = [
  { value: "name", label: "Name (A-Z)" },
  { value: "validationStatus", label: "Validation Status" },
  { value: "age", label: "Age (Newest)" },
  { value: "ageOldest", label: "Age (Oldest)" },
  { value: "upvotes", label: "Upvotes (Most)" },
  { value: "ideaNumber", label: "Idea Number" },
];

export const filterOptions = [
  { value: "all", label: "All Ideas" },
  { value: "backlog", label: "Backlog" },
  { value: "firstLevel", label: "First Level" },
  { value: "secondLevel", label: "Second Level" },
  { value: "scaling", label: "Scaling" },
  { value: "failed", label: "Failed" },
];
