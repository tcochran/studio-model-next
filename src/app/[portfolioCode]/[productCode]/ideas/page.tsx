import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import Link from "next/link";
import IdeasList from "../../../IdeasList";
import { PageHeader } from "../../../../components/PageHeader";
import { PageTitle } from "../../../../components/PageTitle";

export const dynamic = "force-dynamic";

type SortField = "name" | "validationStatus" | "age" | "ageOldest" | "upvotes" | "ideaNumber";
type FilterField = "all" | "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed";

const statusOrder: Record<string, number> = {
  backlog: 0,
  firstLevel: 1,
  secondLevel: 2,
  scaling: 3,
  failed: 4,
};

type Product = {
  code: string;
  name: string;
};

export default async function ScopedIdeasPage({
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

    // Sort in-memory
    if (sortBy === "name") {
      ideas.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "validationStatus") {
      ideas.sort((a, b) => {
        const orderA = statusOrder[a.validationStatus || ""] || 99;
        const orderB = statusOrder[b.validationStatus || ""] || 99;
        return orderA - orderB;
      });
    } else if (sortBy === "upvotes") {
      ideas.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    } else if (sortBy === "age") {
      ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "ageOldest") {
      ideas.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "ideaNumber") {
      ideas.sort((a, b) => (b.ideaNumber || 0) - (a.ideaNumber || 0));
    }
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
            ideas={ideas.map((idea) => ({
              id: idea.id,
              ideaNumber: idea.ideaNumber,
              name: idea.name,
              hypothesis: idea.hypothesis,
              validationStatus: idea.validationStatus,
              createdAt: idea.createdAt,
              upvotes: idea.upvotes ?? 0,
              source: idea.source ?? null,
            }))}
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
