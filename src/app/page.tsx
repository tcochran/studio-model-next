import { cookiesClient } from "../utils/amplify-server-utils";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  "first-level": "First Level",
  "second-level": "Second Level",
  scaling: "Scaling",
};

const statusColors: Record<string, string> = {
  "first-level": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "second-level": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default async function Home() {
  const { data: ideas } = await cookiesClient.models.Idea.list();

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

        {ideas && ideas.length > 0 ? (
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
        ) : (
          <p
            className="text-zinc-600 dark:text-zinc-400"
            data-testid="no-ideas"
          >
            No ideas yet. Add your first idea!
          </p>
        )}
      </main>
    </div>
  );
}
