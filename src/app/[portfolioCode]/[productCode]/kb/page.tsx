import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import Link from "next/link";
import { PageHeader } from "../../../../components/PageHeader";
import { PageTitle } from "../../../../components/PageTitle";

export const dynamic = "force-dynamic";

type Product = {
  code: string;
  name: string;
};

export default async function ScopedKBPage({
  params,
}: {
  params: Promise<{ portfolioCode: string; productCode: string }>;
}) {
  const { portfolioCode, productCode } = await params;

  let documents: NonNullable<Awaited<ReturnType<typeof cookiesClient.models.KBDocument.list>>["data"]> = [];
  let fetchError: string | null = null;
  let portfolioName = portfolioCode;
  let productName = productCode;

  try {
    // Fetch portfolio to get names
    const portfolioResult = await cookiesClient.models.Portfolio.get({ code: portfolioCode });
    if (portfolioResult.data) {
      portfolioName = portfolioResult.data.name;
      const products: Product[] = portfolioResult.data.products
        ? typeof portfolioResult.data.products === "string"
          ? JSON.parse(portfolioResult.data.products)
          : portfolioResult.data.products
        : [];
      const product = products.find((p) => p.code === productCode);
      if (product) {
        productName = product.name;
      }
    }

    // Fetch documents filtered by productCode using GSI
    const result = await cookiesClient.models.KBDocument.listKBDocumentByProductCode({
      productCode,
    });

    // Further filter by portfolioCode in memory
    documents = (result.data ?? []).filter(
      (doc) => doc && doc.title && doc.portfolioCode === portfolioCode
    );

    // Sort by createdAt descending (newest first)
    documents.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (e) {
    console.error("Error fetching documents:", e);
    fetchError = e instanceof Error ? e.message : "Unknown error fetching documents";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <PageHeader
        portfolioCode={portfolioCode}
        portfolioName={portfolioName}
        productCode={productCode}
        productName={productName}
        activeTab="kb"
      />

      <PageTitle
        title="Knowledge Base"
        actions={
          <Link
            href={`/${portfolioCode}/${productCode}/kb/new`}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Document
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl px-4 py-8">

        {fetchError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading documents: {fetchError}
          </div>
        )}

        {!fetchError && documents.length === 0 && (
          <p
            className="text-zinc-600 dark:text-zinc-400 mt-4"
            data-testid="kb-empty-state"
          >
            No documents yet. Add your first document!
          </p>
        )}

        {!fetchError && documents.length > 0 && (
          <ul data-testid="kb-document-list" className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex justify-between items-center"
              >
                <Link
                  href={`/${portfolioCode}/${productCode}/kb/${doc.id}`}
                  className="text-black dark:text-white font-medium hover:text-orange-600 dark:hover:text-orange-400"
                >
                  {doc.title}
                </Link>
                <span
                  data-testid="document-date"
                  className="text-zinc-500 dark:text-zinc-400 text-sm"
                >
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
