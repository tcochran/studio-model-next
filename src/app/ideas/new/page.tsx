"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

type ValidationStatus = "firstLevel" | "secondLevel" | "scaling";

export default function NewIdeaPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const router = useRouter();
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("firstLevel");
  const [nameError, setNameError] = useState("");
  const [hypothesisError, setHypothesisError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setHypothesisError("");

    let hasError = false;

    if (!name.trim()) {
      setNameError("Name is required");
      hasError = true;
    }

    if (!hypothesis.trim()) {
      setHypothesisError("Hypothesis is required");
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      await client.models.Idea.create({
        name: name.trim(),
        hypothesis: hypothesis.trim(),
        validationStatus,
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error creating idea:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Add New Ideas
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your idea name"
            />
            {nameError && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                data-testid="name-error"
              >
                {nameError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="hypothesis"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Hypothesis
            </label>
            <textarea
              id="hypothesis"
              name="hypothesis"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your hypothesis"
            />
            {hypothesisError && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                data-testid="hypothesis-error"
              >
                {hypothesisError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="validationStatus"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Validation Status
            </label>
            <div className="relative inline-block">
              <select
                id="validationStatus"
                name="validationStatus"
                value={validationStatus}
                onChange={(e) => setValidationStatus(e.target.value as ValidationStatus)}
                className="pl-4 pr-10 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="firstLevel">First Level</option>
                <option value="secondLevel">Second Level</option>
                <option value="scaling">Scaling</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Idea"}
          </button>
        </form>
      </main>
    </div>
  );
}
