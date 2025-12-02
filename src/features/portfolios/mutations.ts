import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

export async function createPortfolio(data: {
  code: string;
  organizationName: string;
  name: string;
}) {
  return await client.models.Portfolio.create({
    code: data.code.trim(),
    organizationName: data.organizationName.trim(),
    name: data.name.trim(),
    owners: [],
    products: JSON.stringify([]) as unknown as null,
  });
}

export async function addProductToPortfolio(
  portfolioCode: string,
  product: { code: string; name: string }
) {
  // Note: This requires fetching the current products first
  // The calling component should handle this logic
  const productsJson = JSON.stringify([product]) as unknown as null;

  return await client.models.Portfolio.update({
    code: portfolioCode,
    products: productsJson,
  });
}

export async function addOwnerToPortfolio(
  portfolioCode: string,
  owners: string[]
) {
  return await client.models.Portfolio.update({
    code: portfolioCode,
    owners,
  });
}
