import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import type { ValidationStatus, Source } from "./types";

const client = generateClient<Schema>();

export async function createIdea(data: {
  portfolioCode: string;
  productCode: string;
  ideaNumber: number;
  name: string;
  hypothesis: string;
  validationStatus: ValidationStatus;
  source?: Source;
}) {
  const statusHistoryEntry = JSON.stringify({
    status: data.validationStatus,
    timestamp: new Date().toISOString(),
  });

  return await client.models.Idea.create({
    portfolioCode: data.portfolioCode,
    productCode: data.productCode,
    ideaNumber: data.ideaNumber,
    name: data.name,
    hypothesis: data.hypothesis,
    validationStatus: data.validationStatus,
    statusHistory: [statusHistoryEntry],
    upvotes: 0,
    source: data.source || null,
  });
}

export async function updateIdea(data: {
  id: string;
  name?: string;
  hypothesis?: string;
  validationStatus?: ValidationStatus;
  source?: Source;
  statusHistory?: string[];
}) {
  return await client.models.Idea.update(data);
}

export async function upvoteIdea(ideaId: string, currentUpvotes: number) {
  return await client.models.Idea.update({
    id: ideaId,
    upvotes: currentUpvotes + 1,
  });
}
