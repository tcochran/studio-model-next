export type ValidationStatus = "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed";

export type Source =
  | "customerFeedback"
  | "teamBrainstorm"
  | "competitorAnalysis"
  | "userResearch"
  | "marketTrend"
  | "internalRequest"
  | "other";

export type StatusHistoryEntry = {
  status: ValidationStatus;
  timestamp: string;
  notes?: string;
};

export type Idea = {
  id: string;
  ideaNumber: number;
  name: string | null;
  hypothesis: string | null;
  validationStatus: ValidationStatus | null;
  statusHistory: string[] | null;
  upvotes: number | null;
  source: Source | null;
  portfolioCode: string;
  productCode: string;
  createdAt: string;
  updatedAt: string;
};

export type SortField = "name" | "validationStatus" | "age" | "ageOldest" | "upvotes" | "ideaNumber";
export type FilterField = "all" | "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed";
