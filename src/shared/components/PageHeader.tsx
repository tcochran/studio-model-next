import Link from "next/link";

type Tab = "ideas" | "kb";

interface PageHeaderProps {
  portfolioCode: string;
  portfolioName: string;
  productCode: string;
  productName: string;
  activeTab: Tab;
}

export function PageHeader({
  portfolioCode,
  portfolioName,
  productCode,
  productName,
  activeTab,
}: PageHeaderProps) {
  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center">
        <div className="flex gap-2 w-[200px]">
          <Link
            href={`/portfolios/${portfolioCode}`}
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium truncate"
          >
            {portfolioName}
          </Link>
          <span className="text-zinc-400 dark:text-zinc-600">/</span>
          <span className="text-zinc-900 dark:text-white font-medium truncate">
            {productName}
          </span>
        </div>
        <div className="flex gap-6 mx-auto">
          <Link
            href={`/${portfolioCode}/${productCode}/ideas`}
            className={
              activeTab === "ideas"
                ? "text-zinc-900 dark:text-white font-medium"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            }
          >
            Idea Backlog
          </Link>
          <Link
            href={`/${portfolioCode}/${productCode}/kb`}
            className={
              activeTab === "kb"
                ? "text-zinc-900 dark:text-white font-medium"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-medium"
            }
          >
            Knowledge Base
          </Link>
        </div>
        <div className="w-[200px]"></div>
      </div>
    </nav>
  );
}
