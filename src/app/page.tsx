import { cookiesClient } from "../utils/amplify-server-utils";

export default async function Home() {
  const { data: ideas } = await cookiesClient.models.Idea.list();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Idea Backlog
        </h1>

        {ideas && ideas.length > 0 ? (
          <ul className="space-y-4" data-testid="ideas-list">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-800"
                data-testid="idea-item"
              >
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {idea.title}
                </h2>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {idea.description}
                </p>
              </li>
            ))}
          </ul>
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
