"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../../amplify/data/resource";

type Product = {
  code: string;
  name: string;
};

type Portfolio = {
  code: string;
  organizationName: string;
  name: string;
  owners: string[];
  products: Product[];
};

export default function PortfolioDetailPage() {
  const client = useMemo(() => generateClient<Schema>(), []);
  const params = useParams();
  const code = params.code as string;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");

  const [showAddOwner, setShowAddOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const result = await client.models.Portfolio.get({ code });
        if (result.data) {
          let products: Product[] = [];
          if (result.data.products) {
            try {
              products = typeof result.data.products === "string"
                ? JSON.parse(result.data.products)
                : result.data.products;
            } catch {
              products = [];
            }
          }
          setPortfolio({
            code: result.data.code,
            organizationName: result.data.organizationName,
            name: result.data.name,
            owners: (result.data.owners ?? []).filter((o): o is string => o !== null),
            products,
          });
        } else {
          setError("Portfolio not found");
        }
      } catch (e) {
        console.error("Error fetching portfolio:", e);
        setError("Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [client, code]);

  const handleAddProduct = async () => {
    if (!portfolio || !productCode.trim() || !productName.trim()) return;

    const newProduct = { code: productCode.trim(), name: productName.trim() };
    const updatedProducts = [...portfolio.products, newProduct];

    try {
      await client.models.Portfolio.update({
        code: portfolio.code,
        products: JSON.stringify(updatedProducts) as unknown as null,
      });
      setPortfolio({ ...portfolio, products: updatedProducts });
      setProductCode("");
      setProductName("");
      setShowAddProduct(false);
    } catch (e) {
      console.error("Error adding product:", e);
    }
  };

  const handleAddOwner = async () => {
    if (!portfolio || !ownerEmail.trim()) return;

    const updatedOwners = [...portfolio.owners, ownerEmail.trim()];

    try {
      await client.models.Portfolio.update({
        code: portfolio.code,
        owners: updatedOwners,
      });
      setPortfolio({ ...portfolio, owners: updatedOwners });
      setOwnerEmail("");
      setShowAddOwner(false);
    } catch (e) {
      console.error("Error adding owner:", e);
    }
  };

  if (loading) {
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
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </main>
      </div>
    );
  }

  if (error || !portfolio) {
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
        <main className="mx-auto max-w-3xl px-4 py-8">
          <Link
            href="/portfolios"
            className="text-orange-600 dark:text-orange-400 hover:underline mb-4 inline-block"
          >
            &larr; Back to Portfolios
          </Link>
          <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error || "Portfolio not found"}
          </div>
        </main>
      </div>
    );
  }

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

      <main className="mx-auto max-w-3xl px-4 py-8" data-testid="portfolio-detail">
        <Link
          href="/portfolios"
          className="text-orange-600 dark:text-orange-400 hover:underline mb-4 inline-block"
        >
          &larr; Back to Portfolios
        </Link>

        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          {portfolio.name}
        </h1>

        <p data-testid="organization-name" className="text-zinc-600 dark:text-zinc-400 mb-1">
          Organization: {portfolio.organizationName}
        </p>

        <p data-testid="portfolio-code" className="text-zinc-500 dark:text-zinc-500 text-sm mb-8">
          Code: {portfolio.code}
        </p>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Owners
            </h2>
            <button
              data-testid="add-owner-button"
              onClick={() => setShowAddOwner(true)}
              className="px-3 py-1 text-sm bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white rounded-lg transition-colors"
            >
              + Add Owner
            </button>
          </div>

          {showAddOwner && (
            <div className="mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <input
                type="email"
                name="ownerEmail"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white mb-2"
              />
              <div className="flex gap-2">
                <button
                  data-testid="save-owner-button"
                  onClick={handleAddOwner}
                  className="px-3 py-1 bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddOwner(false)}
                  className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div data-testid="owners-list" className="space-y-2">
            {portfolio.owners.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No owners yet
              </p>
            ) : (
              portfolio.owners.map((owner, index) => (
                <div
                  key={index}
                  className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-black dark:text-white"
                >
                  {owner}
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Products
            </h2>
            <button
              data-testid="add-product-button"
              onClick={() => setShowAddProduct(true)}
              className="px-3 py-1 text-sm bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white rounded-lg transition-colors"
            >
              + Add Product
            </button>
          </div>

          {showAddProduct && (
            <div className="mb-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <input
                type="text"
                name="productCode"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Product code (e.g., mobile-app)"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white mb-2"
              />
              <input
                type="text"
                name="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name (e.g., Mobile App)"
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white mb-2"
              />
              <div className="flex gap-2">
                <button
                  data-testid="save-product-button"
                  onClick={handleAddProduct}
                  className="px-3 py-1 bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div data-testid="products-list" className="space-y-2">
            {portfolio.products.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                No products yet
              </p>
            ) : (
              portfolio.products.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-black dark:text-white font-medium">
                      {product.name}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      {product.code}
                    </p>
                  </div>
                  <Link
                    href={`/${portfolio.code}/${product.code}/ideas`}
                    data-testid="product-ideas-link"
                    className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-lg transition-colors"
                  >
                    View Ideas
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
