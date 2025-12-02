import { cookiesClient } from "@/shared/utils/amplify-server-utils";

export async function getKBDocumentsByProduct(
  portfolioCode: string,
  productCode: string
) {
  const result = await cookiesClient.models.KBDocument.listKBDocumentByProductCode({
    productCode,
  });

  const documents = (result.data ?? []).filter(
    (doc) => doc && doc.title && doc.portfolioCode === portfolioCode
  );

  documents.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return documents;
}

export async function getKBDocumentById(id: string) {
  const result = await cookiesClient.models.KBDocument.get({ id });
  return result.data;
}
