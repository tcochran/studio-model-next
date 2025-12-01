"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../../../amplify/data/resource";

type KBDocument = {
  id: string;
  title: string;
  content: string;
  createdAt?: string | null;
};

type Product = {
  code: string;
  name: string;
};

export default function DocumentDetailPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const params = useParams();
  const portfolioCode = params.portfolioCode as string;
  const productCode = params.productCode as string;
  const id = params.id as string;

  const [document, setDocument] = useState<KBDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioName, setPortfolioName] = useState(portfolioCode);
  const [productName, setProductName] = useState(productCode);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch portfolio to get names
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

        // Fetch document
        const result = await client.models.KBDocument.get({ id });
        if (result.data) {
          setDocument({
            id: result.data.id,
            title: result.data.title,
            content: result.data.content,
            createdAt: result.data.createdAt,
          });
        } else {
          setError("Document not found");
        }
      } catch (e) {
        console.error("Error fetching document:", e);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [client, id, portfolioCode, productCode]);

  const handleDownload = () => {
    if (!document) return;

    const blob = new Blob([document.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const basePath = `/${portfolioCode}/${productCode}/kb`;

  if (loading) {
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
                href={`/${portfolioCode}/${productCode}/ideas`}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                Idea Backlog
              </Link>
              <Link
                href={basePath}
                className="text-zinc-900 dark:text-white font-medium"
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

  if (error || !document) {
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
                href={`/${portfolioCode}/${productCode}/ideas`}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
              >
                Idea Backlog
              </Link>
              <Link
                href={basePath}
                className="text-zinc-900 dark:text-white font-medium"
              >
                Knowledge Base
              </Link>
            </div>
            <div className="w-[150px]"></div>
          </div>
        </nav>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Link
            href={basePath}
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            &larr; Back to Knowledge Base
          </Link>
          <div
            data-testid="document-error"
            className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg"
          >
            {error || "Document not found"}
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
              href={`/${portfolioCode}/${productCode}/ideas`}
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            >
              Idea Backlog
            </Link>
            <Link
              href={basePath}
              className="text-zinc-900 dark:text-white font-medium"
            >
              Knowledge Base
            </Link>
          </div>
          <div className="w-[150px]"></div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href={basePath}
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          &larr; Back to Knowledge Base
        </Link>

        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {document.title}
          </h1>
          <button
            onClick={handleDownload}
            data-testid="download-button"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Download
          </button>
        </div>

        {document.createdAt && (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Created:{" "}
            {new Date(document.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}

        <div
          data-testid="document-content"
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-black dark:text-white whitespace-pre-wrap"
        >
          {document.content}
        </div>
      </main>
    </div>
  );
}
