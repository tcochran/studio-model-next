import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import Link from "next/link";
import { PageHeader } from "@/shared/components/PageHeader";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  firstLevel: "First Level",
  secondLevel: "Second Level",
  scaling: "Scaling",
  failed: "Failed",
};

const statusColors: Record<string, string> = {
  backlog: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  firstLevel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secondLevel:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const sourceLabels: Record<string, string> = {
  customerFeedback: "Customer Feedback",
  teamBrainstorm: "Team Brainstorm",
  competitorAnalysis: "Competitor Analysis",
  userResearch: "User Research",
  marketTrend: "Market Trend",
  internalRequest: "Internal Request",
  other: "Other",
};

const sourceColor = "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";

type Product = {
  code: string;
  name: string;
};

export default async function IdeaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ portfolioCode: string; productCode: string; ideaNumber: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { portfolioCode, productCode, ideaNumber } = await params;
  const { from } = await searchParams;
  const ideaNum = parseInt(ideaNumber, 10);

  let idea = null;
  let error: string | null = null;
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

    // Query for idea by portfolioCode, productCode, and ideaNumber
    const result = await cookiesClient.models.Idea.list({
      filter: {
        portfolioCode: { eq: portfolioCode },
        productCode: { eq: productCode },
        ideaNumber: { eq: ideaNum },
      },
    });
    idea = result.data?.[0] || null;
  } catch (e) {
    console.error("Error fetching idea:", e);
    error = e instanceof Error ? e.message : "Unknown error";
  }

  const basePath = `/${portfolioCode}/${productCode}/ideas`;
  const backPath = from === "funnel" ? `${basePath}/funnel` : basePath;

  if (!idea || error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <PageHeader
          portfolioCode={portfolioCode}
          portfolioName={portfolioName}
          productCode={productCode}
          productName={productName}
          activeTab="ideas"
        />

        <main className="mx-auto max-w-5xl px-4 py-8">
          <Link
            href={backPath}
            data-testid="back-to-ideas"
            className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:underline mb-6"
          >
            &larr; Back to Ideas
          </Link>

          <div className="p-6 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
            <h1 className="text-xl font-semibold mb-2">Idea not found</h1>
            <p>The idea you are looking for does not exist or has been removed.</p>
          </div>
        </main>
      </div>
    );
  }

  const formattedDate = new Date(idea.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <PageHeader
        portfolioCode={portfolioCode}
        portfolioName={portfolioName}
        productCode={productCode}
        productName={productName}
        activeTab="ideas"
      />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href={backPath}
            data-testid="back-to-ideas"
            className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:underline"
          >
            &larr; Back to Ideas
          </Link>
          <Link
            href={`${basePath}/${ideaNumber}/edit`}
            data-testid="edit-idea-button"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Edit
          </Link>
        </div>

        <h1
          className="text-3xl font-bold text-black dark:text-white mb-6"
          data-testid="idea-detail-name"
        >
          {idea.name}
        </h1>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Validation Status:
            </span>
            {idea.validationStatus && (
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[idea.validationStatus] || "bg-zinc-100 text-zinc-800"}`}
                data-testid="idea-detail-status"
              >
                {statusLabels[idea.validationStatus] || idea.validationStatus}
              </span>
            )}
            {!idea.validationStatus && (
              <span
                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                data-testid="idea-detail-status"
              >
                Not set
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Source:
            </span>
            {idea.source && (
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${sourceColor}`}
                data-testid="idea-detail-source"
              >
                {sourceLabels[idea.source] || idea.source}
              </span>
            )}
            {!idea.source && (
              <span
                className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                data-testid="idea-detail-source"
              >
                Not set
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              Created:
            </span>
            <span
              className="text-zinc-900 dark:text-white"
              data-testid="idea-detail-created"
            >
              {formattedDate}
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
              Hypothesis
            </h2>
            <div
              className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap text-zinc-700 dark:text-zinc-300"
              data-testid="idea-detail-hypothesis"
            >
              {idea.hypothesis || "No hypothesis provided."}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
