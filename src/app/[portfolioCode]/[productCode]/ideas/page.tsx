import { cookiesClient } from "../../../../utils/amplify-server-utils";
import Link from "next/link";
import IdeasList from "../../../IdeasList";

export const dynamic = "force-dynamic";

type SortField = "name" | "validationStatus" | "age" | "ageOldest" | "upvotes" | "ideaNumber";
type FilterField = "all" | "firstLevel" | "secondLevel" | "scaling";

const statusOrder: Record<string, number> = {
  firstLevel: 1,
  secondLevel: 2,
  scaling: 3,
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
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center">
          <div className="flex gap-2">
            <Link
              href={`/portfolios/${portfolioCode}`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            >
              {portfolioName}
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span className="text-zinc-900 dark:text-white font-medium">{productName}</span>
          </div>
          <div className="flex gap-6 mx-auto">
            <Link
              href={`/${portfolioCode}/${productCode}/ideas`}
              className="text-zinc-900 dark:text-white font-medium"
            >
              Idea Backlog
            </Link>
            <Link
              href={`/${portfolioCode}/${productCode}/kb`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            >
              Knowledge Base
            </Link>
          </div>
          <div className="w-[150px]"></div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Idea Backlog
          </h1>
          <Link
            href={`/${portfolioCode}/${productCode}/ideas/new`}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Idea
          </Link>
        </div>

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
