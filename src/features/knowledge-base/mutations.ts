import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

export async function createKBDocument(
  title: string,
  content: string,
  portfolioCode: string,
  productCode: string
) {
  const result = await client.models.KBDocument.create({
    title: title.trim(),
    content: content.trim(),
    portfolioCode,
    productCode,
  });
  return result.data;
}

export async function updateKBDocument(
  id: string,
  title: string,
  content: string
) {
  const result = await client.models.KBDocument.update({
    id,
    title: title.trim(),
    content: content.trim(),
  });
  return result.data;
}

export async function deleteKBDocument(id: string) {
  const result = await client.models.KBDocument.delete({ id });
  return result.data;
}
