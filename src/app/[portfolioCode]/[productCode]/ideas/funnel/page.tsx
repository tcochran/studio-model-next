import { cookiesClient } from "../../../../../utils/amplify-server-utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; description: string }> = {
  firstLevel: { label: "Unvalidated", description: "First Level Validation" },
  secondLevel: { label: "Partially Validated", description: "Second Level Validation" },
  scaling: { label: "Fully Validated", description: "Scaling" },
};

const statusColors: Record<string, { card: string; border: string; header: string }> = {
  firstLevel: {
    card: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    header: "text-blue-900 dark:text-blue-100",
  },
  secondLevel: {
    card: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
    header: "text-purple-900 dark:text-purple-100",
  },
  scaling: {
    card: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
    header: "text-green-900 dark:text-green-100",
  },
};

type Product = {
  code: string;
  name: string;
};

export default async function FunnelPage({
  params,
}: {
  params: Promise<{ portfolioCode: string; productCode: string }>;
}) {
  const { portfolioCode, productCode } = await params;

  let portfolioName = portfolioCode;
  let productName = productCode;
  let ideas: any[] = [];
  let error: string | null = null;

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

    // Fetch all ideas for this product
    const result = await cookiesClient.models.Idea.list({
      filter: {
        portfolioCode: { eq: portfolioCode },
        productCode: { eq: productCode },
      },
    });
    ideas = result.data || [];
  } catch (e) {
    console.error("Error fetching ideas:", e);
    error = e instanceof Error ? e.message : "Unknown error";
  }

  const basePath = `/${portfolioCode}/${productCode}/ideas`;

  // Group ideas by validation status
  const groupedIdeas = {
    firstLevel: ideas.filter((idea) => idea.validationStatus === "firstLevel"),
    secondLevel: ideas.filter((idea) => idea.validationStatus === "secondLevel"),
    scaling: ideas.filter((idea) => idea.validationStatus === "scaling"),
  };

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
              href={basePath}
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

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Idea Funnel
          </h1>
          <div className="flex gap-2">
            <Link
              href={basePath}
              data-testid="list-view-link"
              className="inline-flex items-center px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg text-sm font-medium"
            >
              List View
            </Link>
            <Link
              href={`${basePath}/new`}
              className="px-4 py-2 bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white rounded-lg text-sm font-medium"
            >
              + New Idea
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg mb-6">
            <p>Error loading ideas: {error}</p>
          </div>
        )}

        <div className="space-y-12">
          {/* First Level - Unvalidated */}
          <div className="flex flex-col items-center">
            <div
              className="w-full"
              style={{ maxWidth: "85%" }}
              data-testid="funnel-layer-firstLevel"
            >
              <div className="mb-6 text-center">
                <div className="inline-block">
                  <h2 className={`text-xl font-semibold mb-1 ${statusColors.firstLevel.header}`}>
                    {statusLabels.firstLevel.label}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {groupedIdeas.firstLevel.length} {groupedIdeas.firstLevel.length === 1 ? "idea" : "ideas"}
                  </p>
                </div>
              </div>
              <div className={`border-t-2 ${statusColors.firstLevel.border} mb-4`}></div>
              {groupedIdeas.firstLevel.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {groupedIdeas.firstLevel.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                      data-testid="idea-card"
                      className={`block p-2 h-[60px] ${statusColors.firstLevel.card} border ${statusColors.firstLevel.border} rounded hover:shadow-md hover:scale-105 transition-all cursor-pointer`}
                    >
                      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1" data-testid="idea-card-number">
                        #{idea.ideaNumber}
                      </div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-2" data-testid="idea-card-name">
                        {idea.name}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  No ideas in this stage
                </p>
              )}
            </div>
          </div>

          {/* Second Level - Partially Validated */}
          <div className="flex flex-col items-center">
            <div
              className="w-full"
              style={{ maxWidth: "65%" }}
              data-testid="funnel-layer-secondLevel"
            >
              <div className="mb-6 text-center">
                <div className="inline-block">
                  <h2 className={`text-xl font-semibold mb-1 ${statusColors.secondLevel.header}`}>
                    {statusLabels.secondLevel.label}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {groupedIdeas.secondLevel.length} {groupedIdeas.secondLevel.length === 1 ? "idea" : "ideas"}
                  </p>
                </div>
              </div>
              <div className={`border-t-2 ${statusColors.secondLevel.border} mb-4`}></div>
              {groupedIdeas.secondLevel.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {groupedIdeas.secondLevel.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                      data-testid="idea-card"
                      className={`block p-2 h-[60px] ${statusColors.secondLevel.card} border ${statusColors.secondLevel.border} rounded hover:shadow-md hover:scale-105 transition-all cursor-pointer`}
                    >
                      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1" data-testid="idea-card-number">
                        #{idea.ideaNumber}
                      </div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-2" data-testid="idea-card-name">
                        {idea.name}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  No ideas in this stage
                </p>
              )}
            </div>
          </div>

          {/* Scaling - Fully Validated */}
          <div className="flex flex-col items-center">
            <div
              className="w-full"
              style={{ maxWidth: "50%" }}
              data-testid="funnel-layer-scaling"
            >
              <div className="mb-6 text-center">
                <div className="inline-block">
                  <h2 className={`text-xl font-semibold mb-1 ${statusColors.scaling.header}`}>
                    {statusLabels.scaling.label}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {groupedIdeas.scaling.length} {groupedIdeas.scaling.length === 1 ? "idea" : "ideas"}
                  </p>
                </div>
              </div>
              <div className={`border-t-2 ${statusColors.scaling.border} mb-4`}></div>
              {groupedIdeas.scaling.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {groupedIdeas.scaling.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                      data-testid="idea-card"
                      className={`block p-2 h-[60px] ${statusColors.scaling.card} border ${statusColors.scaling.border} rounded hover:shadow-md hover:scale-105 transition-all cursor-pointer`}
                    >
                      <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mb-1" data-testid="idea-card-number">
                        #{idea.ideaNumber}
                      </div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-2" data-testid="idea-card-name">
                        {idea.name}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  No ideas in this stage
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
