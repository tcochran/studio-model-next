import { cookiesClient } from "../utils/amplify-server-utils";
import Link from "next/link";
import IdeasList from "./IdeasList";

export const dynamic = "force-dynamic";

type SortField = "name" | "validationStatus" | "age" | "ageOldest";

const statusOrder: Record<string, number> = {
  firstLevel: 1,
  secondLevel: 2,
  scaling: 3,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const params = await searchParams;
  const sortBy = (params.sort as SortField) || "age";

  let ideas: NonNullable<Awaited<ReturnType<typeof cookiesClient.models.Idea.list>>["data"]> = [];
  let fetchError: string | null = null;

  try {
    // Fetch with database-level sorting for age
    let result;

    if (sortBy === "age") {
      // Sort by createdAt descending (newest first) - database level
      result = await cookiesClient.models.Idea.list({
        sortDirection: "DESC",
      });
    } else if (sortBy === "ageOldest") {
      // Sort by createdAt ascending (oldest first) - database level
      result = await cookiesClient.models.Idea.list({
        sortDirection: "ASC",
      });
    } else {
      // For name and validationStatus, fetch all and sort in-memory
      // Note: GSIs exist but are for partition key queries, not full scans
      result = await cookiesClient.models.Idea.list();
    }

    ideas = result.data?.filter((idea) => idea && idea.name) ?? [];

    // Sort in-memory for name and validationStatus
    if (sortBy === "name") {
      ideas.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "validationStatus") {
      ideas.sort((a, b) => {
        const orderA = statusOrder[a.validationStatus || ""] || 99;
        const orderB = statusOrder[b.validationStatus || ""] || 99;
        return orderA - orderB;
      });
    }
  } catch (e) {
    console.error("Error fetching ideas:", e);
    fetchError = e instanceof Error ? e.message : "Unknown error fetching ideas";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Idea Backlog
          </h1>
          <Link
            href="/ideas/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Idea
          </Link>
        </div>

        {fetchError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading ideas: {fetchError}
          </div>
        )}

        {!fetchError && ideas.length > 0 ? (
          <IdeasList
            ideas={ideas.map((idea) => ({
              id: idea.id,
              name: idea.name,
              hypothesis: idea.hypothesis,
              validationStatus: idea.validationStatus,
              createdAt: idea.createdAt,
            }))}
            currentSort={sortBy}
          />
        ) : !fetchError ? (
          <p
            className="text-zinc-600 dark:text-zinc-400"
            data-testid="no-ideas"
          >
            No ideas yet. Add your first idea!
          </p>
        ) : null}
      </main>
    </div>
  );
}
