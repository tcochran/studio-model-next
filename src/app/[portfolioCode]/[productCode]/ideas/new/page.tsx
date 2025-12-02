"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../../../amplify/data/resource";
import { PageHeader } from "../../../../../components/PageHeader";

type ValidationStatus = "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed";
type Source = "customerFeedback" | "teamBrainstorm" | "competitorAnalysis" | "userResearch" | "marketTrend" | "internalRequest" | "other";

type Product = {
  code: string;
  name: string;
};

export default function NewIdeaPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const router = useRouter();
  const params = useParams();
  const portfolioCode = params.portfolioCode as string;
  const productCode = params.productCode as string;

  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("backlog");
  const [source, setSource] = useState<Source | "">("");
  const [nameError, setNameError] = useState("");
  const [hypothesisError, setHypothesisError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [portfolioName, setPortfolioName] = useState(portfolioCode);
  const [productName, setProductName] = useState(productCode);

  useEffect(() => {
    async function fetchNames() {
      try {
        const result = await client.models.Portfolio.get({ code: portfolioCode });
        if (result.data) {
          setPortfolioName(result.data.name);
          const products: Product[] = result.data.products
            ? typeof result.data.products === "string"
              ? JSON.parse(result.data.products)
              : result.data.products
            : [];
          const product = products.find((p) => p.code === productCode);
          if (product) {
            setProductName(product.name);
          }
        }
      } catch (e) {
        console.error("Error fetching portfolio:", e);
      }
    }
    fetchNames();
  }, [client, portfolioCode, productCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
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

    if (hasError) {
      console.log("Validation errors, not submitting");
      return;
    }

    console.log("Starting idea creation...");
    setIsSubmitting(true);

    try {
      console.log("Fetching existing ideas for:", { portfolioCode, productCode });
      // Get the next idea number for this product
      const existingIdeas = await client.models.Idea.list({
        filter: {
          portfolioCode: { eq: portfolioCode },
          productCode: { eq: productCode },
        },
      });

      console.log("Existing ideas count:", existingIdeas.data?.length);

      const maxIdeaNumber = existingIdeas.data?.reduce((max, idea) => {
        return Math.max(max, idea.ideaNumber || 0);
      }, 0) || 0;

      const nextIdeaNumber = maxIdeaNumber + 1;
      console.log("Next idea number:", nextIdeaNumber);

      const ideaData = {
        ideaNumber: nextIdeaNumber,
        name: name.trim(),
        hypothesis: hypothesis.trim(),
        validationStatus,
        statusHistory: [JSON.stringify({
          status: validationStatus,
          timestamp: new Date().toISOString(),
        })],
        portfolioCode,
        productCode,
        ...(source && { source }),
      };

      console.log("Creating idea with data:", ideaData);

      const result = await client.models.Idea.create(ideaData);
      console.log("Idea created successfully:", result);

      router.push(`/${portfolioCode}/${productCode}/ideas`);
      router.refresh();
    } catch (error) {
      console.error("Error creating idea:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <PageHeader
        portfolioCode={portfolioCode}
        portfolioName={portfolioName}
        productCode={productCode}
        productName={productName}
        activeTab="ideas"
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Add New Idea
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
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="pl-4 pr-10 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="backlog">Backlog</option>
                <option value="firstLevel">First Level</option>
                <option value="secondLevel">Second Level</option>
                <option value="scaling">Scaling</option>
                <option value="failed">Failed</option>
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
                className="pl-4 pr-10 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Idea"}
          </button>
        </form>
      </main>
    </div>
  );
}
