"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../../../../amplify/data/resource";

type ValidationStatus = "firstLevel" | "secondLevel" | "scaling";
type Source = "customerFeedback" | "teamBrainstorm" | "competitorAnalysis" | "userResearch" | "marketTrend" | "internalRequest" | "other";

type Product = {
  code: string;
  name: string;
};

export default function EditIdeaPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const router = useRouter();
  const params = useParams();
  const portfolioCode = params.portfolioCode as string;
  const productCode = params.productCode as string;
  const ideaNumber = parseInt(params.ideaNumber as string, 10);

  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("firstLevel");
  const [source, setSource] = useState<Source | "">("");
  const [nameError, setNameError] = useState("");
  const [hypothesisError, setHypothesisError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [portfolioName, setPortfolioName] = useState(portfolioCode);
  const [productName, setProductName] = useState(productCode);

  const basePath = `/${portfolioCode}/${productCode}/ideas`;

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch portfolio names
        const portfolioResult = await client.models.Portfolio.get({ code: portfolioCode });
        if (portfolioResult.data) {
          setPortfolioName(portfolioResult.data.name);
          const products: Product[] = portfolioResult.data.products
            ? typeof portfolioResult.data.products === "string"
              ? JSON.parse(portfolioResult.data.products)
              : portfolioResult.data.products
            : [];
          const product = products.find((p) => p.code === productCode);
          if (product) {
            setProductName(product.name);
          }
        }

        // Fetch idea data
        const result = await client.models.Idea.list({
          filter: {
            portfolioCode: { eq: portfolioCode },
            productCode: { eq: productCode },
            ideaNumber: { eq: ideaNumber },
          },
        });

        const idea = result.data?.[0];
        if (!idea) {
          setError("Idea not found");
          setIsLoading(false);
          return;
        }

        setIdeaId(idea.id);
        setName(idea.name || "");
        setHypothesis(idea.hypothesis || "");
        setValidationStatus((idea.validationStatus as ValidationStatus) || "firstLevel");
        setSource((idea.source as Source) || "");
        setIsLoading(false);
      } catch (e) {
        console.error("Error fetching idea:", e);
        setError("Failed to load idea");
        setIsLoading(false);
      }
    }
    fetchData();
  }, [client, portfolioCode, productCode, ideaNumber]);

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

    if (hasError || !ideaId) return;

    setIsSubmitting(true);

    try {
      const updateData: any = {
        id: ideaId,
        name: name.trim(),
        hypothesis: hypothesis.trim(),
        validationStatus,
      };

      if (source) {
        updateData.source = source;
      }

      await client.models.Idea.update(updateData);
      router.push(`${basePath}/${ideaNumber}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating idea:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`${basePath}/${ideaNumber}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center">
            <div className="flex gap-2">
              <Link
                href={`/portfolios/${portfolioCode}`}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                {portfolioName}
              </Link>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <span className="text-zinc-900 dark:text-white font-medium">{productName}</span>
            </div>
            <div className="flex gap-6 mx-auto">
              <Link
                href={basePath}
                className="text-zinc-900 dark:text-white font-medium"
              >
                Idea Backlog
              </Link>
              <Link
                href={`/${portfolioCode}/${productCode}/kb`}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                Knowledge Base
              </Link>
            </div>
            <div className="w-[150px]"></div>
          </div>
        </nav>

        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center">
            <div className="flex gap-2">
              <Link
                href={`/portfolios/${portfolioCode}`}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                {portfolioName}
              </Link>
              <span className="text-zinc-400 dark:text-zinc-600">/</span>
              <span className="text-zinc-900 dark:text-white font-medium">{productName}</span>
            </div>
            <div className="flex gap-6 mx-auto">
              <Link
                href={basePath}
                className="text-zinc-900 dark:text-white font-medium"
              >
                Idea Backlog
              </Link>
              <Link
                href={`/${portfolioCode}/${productCode}/kb`}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                Knowledge Base
              </Link>
            </div>
            <div className="w-[150px]"></div>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-4 py-8">
          <Link
            href={basePath}
            data-testid="back-to-ideas"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center">
          <div className="flex gap-2">
            <Link
              href={`/portfolios/${portfolioCode}`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            >
              {portfolioName}
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <span className="text-zinc-900 dark:text-white font-medium">{productName}</span>
          </div>
          <div className="flex gap-6 mx-auto">
            <Link
              href={basePath}
              className="text-zinc-900 dark:text-white font-medium"
            >
              Idea Backlog
            </Link>
            <Link
              href={`/${portfolioCode}/${productCode}/kb`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            >
              Knowledge Base
            </Link>
          </div>
          <div className="w-[150px]"></div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Edit Idea
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

          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Source (optional)
            </label>
            <div className="relative inline-block">
              <select
                id="source"
                name="source"
                data-testid="source-select"
                value={source}
                onChange={(e) => setSource(e.target.value as Source | "")}
                className="pl-4 pr-10 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Select source...</option>
                <option value="customerFeedback">Customer Feedback</option>
                <option value="teamBrainstorm">Team Brainstorm</option>
                <option value="competitorAnalysis">Competitor Analysis</option>
                <option value="userResearch">User Research</option>
                <option value="marketTrend">Market Trend</option>
                <option value="internalRequest">Internal Request</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCancel}
              data-testid="cancel-button"
              className="flex-1 px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-teal-800 hover:bg-teal-900 disabled:bg-teal-600 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
