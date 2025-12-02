import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import Link from "next/link";
import { PageHeader } from "@/shared/components/PageHeader";
import { PageTitle } from "@/shared/components/PageTitle";
import { IdeaCard } from "./IdeaCard";

export const dynamic = "force-dynamic";

type ValidationStatus = "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed";

type Idea = {
  id: string;
  ideaNumber: number;
  name: string;
  validationStatus: ValidationStatus | null;
  upvotes: number | null;
};

const statusLabels: Record<string, { label: string; description: string }> = {
  backlog: { label: "Backlog", description: "Not yet validated" },
  firstLevel: { label: "Unvalidated", description: "First Level Validation" },
  secondLevel: { label: "Partially Validated", description: "Second Level Validation" },
  scaling: { label: "Fully Validated", description: "Scaling" },
  failed: { label: "Failed", description: "Did not validate" },
};

const statusColors: Record<string, { card: string; border: string; header: string }> = {
  backlog: {
    card: "bg-gray-50 dark:bg-gray-950/20",
    border: "border-gray-200 dark:border-gray-800",
    header: "text-gray-900 dark:text-gray-100",
  },
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
  failed: {
    card: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    header: "text-red-900 dark:text-red-100",
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
  let ideas: Idea[] = [];
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
    backlog: ideas.filter((idea) => idea.validationStatus === "backlog"),
    firstLevel: ideas.filter((idea) => idea.validationStatus === "firstLevel"),
    secondLevel: ideas.filter((idea) => idea.validationStatus === "secondLevel"),
    scaling: ideas.filter((idea) => idea.validationStatus === "scaling"),
    failed: ideas.filter((idea) => idea.validationStatus === "failed"),
  };

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
        title="Idea Funnel"
        actions={
          <>
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
          </>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-8">

        {error && (
          <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg mb-6">
            <p>Error loading ideas: {error}</p>
          </div>
        )}

        <div className="space-y-12">
          {/* Backlog */}
          <div className="flex flex-col items-center">
            <div
              className="w-full"
              style={{ maxWidth: "100%" }}
              data-testid="funnel-layer-backlog"
            >
              <div className="mb-6 text-center">
                <div className="inline-block">
                  <h2 className={`text-xl font-semibold mb-1 ${statusColors.backlog.header}`}>
                    {statusLabels.backlog.label}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {groupedIdeas.backlog.length} {groupedIdeas.backlog.length === 1 ? "idea" : "ideas"}
                  </p>
                </div>
              </div>
              <div className={`border-t-2 ${statusColors.backlog.border} mb-4`}></div>
              {groupedIdeas.backlog.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-center">
                  {groupedIdeas.backlog.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      ideaNumber={idea.ideaNumber}
                      name={idea.name}
                      validationStatus="backlog"
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  No ideas in this stage
                </p>
              )}
            </div>
          </div>

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
                <div className="flex flex-wrap gap-3 justify-center">
                  {groupedIdeas.firstLevel.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      ideaNumber={idea.ideaNumber}
                      name={idea.name}
                      validationStatus="firstLevel"
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                    />
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
                <div className="flex flex-wrap gap-3 justify-center">
                  {groupedIdeas.secondLevel.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      ideaNumber={idea.ideaNumber}
                      name={idea.name}
                      validationStatus="secondLevel"
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                    />
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
                <div className="flex flex-wrap gap-3 justify-center">
                  {groupedIdeas.scaling.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      ideaNumber={idea.ideaNumber}
                      name={idea.name}
                      validationStatus="scaling"
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                  No ideas in this stage
                </p>
              )}
            </div>
          </div>

          {/* Failed - Graveyard */}
          <div className="flex flex-col items-center">
            <div
              className="w-full"
              style={{ maxWidth: "100%" }}
              data-testid="funnel-layer-failed"
            >
              <div className="mb-6 text-center">
                <div className="inline-block">
                  <h2 className={`text-xl font-semibold mb-1 ${statusColors.failed.header}`}>
                    {statusLabels.failed.label}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {groupedIdeas.failed.length} {groupedIdeas.failed.length === 1 ? "idea" : "ideas"}
                  </p>
                </div>
              </div>
              <div className={`border-t-2 ${statusColors.failed.border} mb-4`}></div>
              {groupedIdeas.failed.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-center">
                  {groupedIdeas.failed.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      ideaNumber={idea.ideaNumber}
                      name={idea.name}
                      validationStatus="failed"
                      href={`${basePath}/${idea.ideaNumber}?from=funnel`}
                    />
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
