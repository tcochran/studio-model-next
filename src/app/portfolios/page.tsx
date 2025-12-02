import { cookiesClient } from "@/shared/utils/amplify-server-utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

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

export default async function PortfoliosPage() {
  let portfolios: Portfolio[] = [];
  let fetchError: string | null = null;

  try {
    const result = await cookiesClient.models.Portfolio.list();
    portfolios = (result.data ?? []).map((p) => {
      let products: Product[] = [];
      if (p.products) {
        try {
          products = typeof p.products === "string" ? JSON.parse(p.products) : p.products;
        } catch {
          products = [];
        }
      }
      return {
        code: p.code,
        organizationName: p.organizationName,
        name: p.name,
        owners: (p.owners ?? []).filter((o): o is string => o !== null),
        products,
      };
    });
  } catch (e) {
    console.error("Error fetching portfolios:", e);
    fetchError = e instanceof Error ? e.message : "Unknown error fetching portfolios";
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

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Portfolios
          </h1>
          <Link
            href="/portfolios/new"
            className="px-4 py-2 bg-[rgb(247,71,64)] hover:bg-[rgb(227,51,44)] text-white font-medium rounded-lg transition-colors"
          >
            + New Portfolio
          </Link>
        </div>

        {fetchError && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            Error loading portfolios: {fetchError}
          </div>
        )}

        {!fetchError && portfolios.length === 0 && (
          <div data-testid="portfolio-empty-state" className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              No portfolios yet. Create your first portfolio to get started.
            </p>
            <Link
              href="/portfolios/new"
              className="text-orange-600 dark:text-orange-400 hover:underline"
            >
              Create a portfolio
            </Link>
          </div>
        )}

        {!fetchError && portfolios.length > 0 && (
          <div data-testid="portfolio-list" className="space-y-4">
            {portfolios.map((portfolio) => (
              <Link
                key={portfolio.code}
                href={`/portfolios/${portfolio.code}`}
                data-testid="portfolio-card"
                className="block p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  {portfolio.name}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                  {portfolio.products.length} products | {portfolio.owners.length} owners
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
