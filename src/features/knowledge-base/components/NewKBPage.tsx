"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";
import { PageHeader } from "@/shared/components/PageHeader";
import type { Product } from "../types";

export function NewKBPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const router = useRouter();
  const params = useParams();
  const portfolioCode = params.portfolioCode as string;
  const productCode = params.productCode as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
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
    setTitleError("");
    setContentError("");

    let hasError = false;

    if (!title.trim()) {
      setTitleError("Title is required");
      hasError = true;
    }

    if (!content.trim()) {
      setContentError("Content is required");
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    try {
      await client.models.KBDocument.create({
        title: title.trim(),
        content: content.trim(),
        portfolioCode,
        productCode,
      });
      router.push(`/${portfolioCode}/${productCode}/kb`);
      router.refresh();
    } catch (error) {
      console.error("Error creating document:", error);
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
        activeTab="kb"
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Add New Document
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter document title"
            />
            {titleError && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                data-testid="title-error"
              >
                {titleError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste or type your markdown content here..."
            />
            {contentError && (
              <p
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                data-testid="content-error"
              >
                {contentError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? "Adding..." : "Add Document"}
          </button>
        </form>
      </main>
    </div>
  );
}
