import { cookiesClient } from "../utils/amplify-server-utils";
import Link from "next/link";
import IdeasList from "./IdeasList";

export const dynamic = "force-dynamic";

type SortField = "name" | "validationStatus" | "age" | "ageOldest" | "upvotes";
type FilterField = "all" | "firstLevel" | "secondLevel" | "scaling";

const statusOrder: Record<string, number> = {
  firstLevel: 1,
  secondLevel: 2,
  scaling: 3,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; filter?: string }>;
}) {
  const params = await searchParams;
  const sortBy = (params.sort as SortField) || "age";
  const filterBy = (params.filter as FilterField) || "all";

  let ideas: NonNullable<Awaited<ReturnType<typeof cookiesClient.models.Idea.list>>["data"]> = [];
  let fetchError: string | null = null;

  try {
    // Fetch with database-level filtering using GSI (if filtered)
    let result;

    if (filterBy !== "all") {
      // Use GSI query for filtering by validationStatus
      result = await cookiesClient.models.Idea.listIdeaByValidationStatus({
        validationStatus: filterBy,
      });
    } else if (sortBy === "age") {
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
      // For name and validationStatus sorting, fetch all and sort in-memory
      result = await cookiesClient.models.Idea.list();
    }

    ideas = result.data?.filter((idea) => idea && idea.name) ?? [];

    // Sort in-memory for name, validationStatus, and upvotes
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

        {!fetchError ? (
          <IdeasList
            ideas={ideas.map((idea) => ({
              id: idea.id,
              name: idea.name,
              hypothesis: idea.hypothesis,
              validationStatus: idea.validationStatus,
              createdAt: idea.createdAt,
              upvotes: idea.upvotes ?? 0,
            }))}
            currentSort={sortBy}
            currentFilter={filterBy}
          />
        ) : null}
      </main>
    </div>
  );
}
