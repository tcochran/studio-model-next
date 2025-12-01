import { cookiesClient } from "../../utils/amplify-server-utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function KBPage() {
  let documents: NonNullable<Awaited<ReturnType<typeof cookiesClient.models.KBDocument.list>>["data"]> = [];
  let fetchError: string | null = null;

  try {
    const result = await cookiesClient.models.KBDocument.list();
    documents = result.data?.filter((doc) => doc && doc.title) ?? [];
    // Sort by createdAt descending (newest first)
    documents.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (e) {
    console.error("Error fetching documents:", e);
    fetchError = e instanceof Error ? e.message : "Unknown error fetching documents";
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-3 flex gap-6">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
          >
            Idea Backlog
          </Link>
          <Link
            href="/kb"
            className="text-zinc-900 dark:text-white font-medium"
          >
            Knowledge Base
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Knowledge Base
          </h1>
          <Link
            href="/kb/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            + New Document
          </Link>
        </div>

        {fetchError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading documents: {fetchError}
          </div>
        )}

        {!fetchError && documents.length === 0 && (
          <p
            className="text-zinc-600 dark:text-zinc-400 mt-4"
            data-testid="kb-empty-state"
          >
            No documents yet. Add your first document!
          </p>
        )}

        {!fetchError && documents.length > 0 && (
          <ul data-testid="kb-document-list" className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex justify-between items-center"
              >
                <Link
                  href={`/kb/${doc.id}`}
                  className="text-black dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {doc.title}
                </Link>
                <span
                  data-testid="document-date"
                  className="text-zinc-500 dark:text-zinc-400 text-sm"
                >
                  {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
