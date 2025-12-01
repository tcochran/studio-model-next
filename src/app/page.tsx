import { cookiesClient } from "../utils/amplify-server-utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  firstLevel: "First Level",
  secondLevel: "Second Level",
  scaling: "Scaling",
};

const statusColors: Record<string, string> = {
  firstLevel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secondLevel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default async function Home() {
  let ideas: NonNullable<Awaited<ReturnType<typeof cookiesClient.models.Idea.list>>["data"]> = [];
  let fetchError: string | null = null;

  try {
    const result = await cookiesClient.models.Idea.list();
    ideas = result.data?.filter((idea) => idea && idea.name) ?? [];
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
          <div className="overflow-x-auto" data-testid="ideas-list">
            <table className="w-full bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    Hypothesis
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                    Validation Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea) => (
                  <tr
                    key={idea.id}
                    className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    data-testid="idea-item"
                  >
                    <td className="px-6 py-4 text-zinc-900 dark:text-white" data-testid="idea-name">
                      {idea.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400" data-testid="idea-hypothesis">
                      {idea.hypothesis}
                    </td>
                    <td className="px-6 py-4" data-testid="idea-status">
                      {idea.validationStatus && (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[idea.validationStatus] || "bg-zinc-100 text-zinc-800"}`}
                        >
                          {statusLabels[idea.validationStatus] || idea.validationStatus}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
