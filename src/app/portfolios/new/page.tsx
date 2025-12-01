"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

export default function NewPortfolioPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const router = useRouter();

  const [organizationName, setOrganizationName] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organizationName.trim() || !code.trim() || !name.trim()) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);

    try {
      await client.models.Portfolio.create({
        code: code.trim(),
        organizationName: organizationName.trim(),
        name: name.trim(),
        owners: [],
        products: JSON.stringify([]) as unknown as null,
      });
      router.push("/portfolios");
    } catch (e) {
      console.error("Error creating portfolio:", e);
      setError(e instanceof Error ? e.message : "Failed to create portfolio");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-3 flex gap-6">
          <Link
            href="/portfolios"
            className="text-zinc-900 dark:text-white font-medium"
          >
            Portfolios
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/portfolios"
          className="text-orange-600 dark:text-orange-400 hover:underline mb-4 inline-block"
        >
          &larr; Back to Portfolios
        </Link>

        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          New Portfolio
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              data-testid="form-error"
              className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Organization Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Acme Corp"
            />
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Portfolio Code
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., acme"
            />
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              URL-friendly code (lowercase, no spaces)
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Portfolio Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., Consumer Products"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? "Creating..." : "Create Portfolio"}
          </button>
        </form>
      </main>
    </div>
  );
}
