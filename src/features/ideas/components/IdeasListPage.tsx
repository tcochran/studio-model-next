import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import Link from "next/link";
import IdeasList from "./IdeasList";
import { PageHeader } from "@/shared/components/PageHeader";
import { PageTitle } from "@/shared/components/PageTitle";
import type { SortField, FilterField, Idea } from "../types";
import { sortIdeas } from "../utils";

export const dynamic = "force-dynamic";

type Product = {
  code: string;
  name: string;
};

export default async function IdeasListPage({
  params,
  searchParams,
}: {
  params: Promise<{ portfolioCode: string; productCode: string }>;
  searchParams: Promise<{ sort?: string; filter?: string }>;
}) {
  const { portfolioCode, productCode } = await params;
  const search = await searchParams;
  const sortBy = (search.sort as SortField) || "age";
  const filterBy = (search.filter as FilterField) || "all";

  let ideas: NonNullable<Awaited<ReturnType<typeof cookiesClient.models.Idea.list>>["data"]> = [];
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
    // Fetch ideas filtered by productCode using GSI
    const result = await cookiesClient.models.Idea.listIdeaByProductCode({
      productCode,
    });

    // Further filter by portfolioCode in memory
    ideas = (result.data ?? []).filter(
      (idea) => idea && idea.name && idea.portfolioCode === portfolioCode
    );

    // Apply validation status filter if needed
    if (filterBy !== "all") {
      ideas = ideas.filter((idea) => idea.validationStatus === filterBy);
    }

    // Sort ideas
    ideas = sortIdeas(ideas as Idea[], sortBy) as typeof ideas;
  } catch (e) {
    console.error("Error fetching ideas:", e);
    fetchError = e instanceof Error ? e.message : "Unknown error fetching ideas";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <PageHeader
        portfolioCode={portfolioCode}
        portfolioName={portfolioName}
        productCode={productCode}
        productName={productName}
        activeTab="ideas"
      />

      <PageTitle
        title="Idea Backlog"
        maxWidth="7xl"
        actions={
          <>
            <Link
              href={`/${portfolioCode}/${productCode}/ideas/funnel`}
              data-testid="funnel-view-link"
              className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-sm font-medium"
            >
              Funnel View
            </Link>
            <Link
              href={`/${portfolioCode}/${productCode}/ideas/new`}
              className="px-4 py-2 bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white rounded-lg text-sm font-medium"
            >
              + New Idea
            </Link>
          </>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8">

        {fetchError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading ideas: {fetchError}
          </div>
        )}

        {!fetchError ? (
          <IdeasList
            ideas={ideas as Idea[]}
            currentSort={sortBy}
            currentFilter={filterBy}
            portfolioCode={portfolioCode}
            productCode={productCode}
          />
        ) : null}
      </main>
    </div>
  );
}
