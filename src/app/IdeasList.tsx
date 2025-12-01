"use client";

import { useState, useMemo, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { formatRelativeTime } from "../utils/formatRelativeTime";

type Idea = {
  id: string;
  ideaNumber: number;
  name: string | null;
  hypothesis: string | null;
  validationStatus: string | null;
  createdAt: string;
  upvotes: number | null;
  source: string | null;
};

type SortField = "name" | "validationStatus" | "age" | "ageOldest" | "upvotes" | "ideaNumber";
type FilterField = "all" | "firstLevel" | "secondLevel" | "scaling";

const statusLabels: Record<string, string> = {
  firstLevel: "First Level",
  secondLevel: "Second Level",
  scaling: "Scaling",
};

const statusColors: Record<string, string> = {
  firstLevel: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  secondLevel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const sourceLabels: Record<string, string> = {
  customerFeedback: "Customer Feedback",
  teamBrainstorm: "Team Brainstorm",
  competitorAnalysis: "Competitor Analysis",
  userResearch: "User Research",
  marketTrend: "Market Trend",
  internalRequest: "Internal Request",
  other: "Other",
};

const sourceColor = "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200";

export default function IdeasList({
  ideas: initialIdeas,
  currentSort,
  currentFilter,
  portfolioCode,
  productCode,
}: {
  ideas: Idea[];
  currentSort: SortField;
  currentFilter: FilterField;
  portfolioCode?: string;
  productCode?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const client = useMemo(() => generateClient<Schema>(), []);

  // Base path for links (scoped or root)
  const basePath = portfolioCode && productCode
    ? `/${portfolioCode}/${productCode}/ideas`
    : "";

  // Track local upvote changes separately from server data
  const [upvoteOverrides, setUpvoteOverrides] = useState<Record<string, number>>({});

  // Track which row is expanded (null if none)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Merge server data with local upvote overrides
  const ideas = useMemo(() =>
    initialIdeas.map(idea => ({
      ...idea,
      upvotes: upvoteOverrides[idea.id] ?? idea.upvotes,
    })),
    [initialIdeas, upvoteOverrides]
  );

  const handleUpvote = async (ideaId: string) => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return;

    const newUpvotes = (idea.upvotes || 0) + 1;
    const oldUpvotes = idea.upvotes || 0;

    // Optimistic update
    setUpvoteOverrides(prev => ({ ...prev, [ideaId]: newUpvotes }));

    // Update in database
    try {
      await client.models.Idea.update({
        id: ideaId,
        upvotes: newUpvotes,
      });
    } catch (error) {
      console.error("Failed to update upvotes:", error);
      // Revert optimistic update on error
      setUpvoteOverrides(prev => ({ ...prev, [ideaId]: oldUpvotes }));
    }
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    const path = basePath || "/";
    router.push(`${path}?${params.toString()}`);
    router.refresh();
  };

  const handleFilterChange = (newFilter: string) => {
    const params = new URLSearchParams(searchParams);
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    const path = basePath || "/";
    router.push(`${path}?${params.toString()}`);
    router.refresh();
  };

  const handleRowClick = (ideaId: string) => {
    setExpandedId(expandedId === ideaId ? null : ideaId);
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-zinc-600 dark:text-zinc-400">
            Sort by:
          </label>
          <div className="relative inline-block">
            <select
              id="sort"
              data-testid="sort-dropdown"
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="ideaNumber"># (Newest)</option>
              <option value="age">Age (Newest)</option>
              <option value="ageOldest">Age (Oldest)</option>
              <option value="name">Name</option>
              <option value="validationStatus">Validation Status</option>
              <option value="upvotes">Votes</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm text-zinc-600 dark:text-zinc-400">
            Filter by:
          </label>
          <div className="relative inline-block">
            <select
              id="filter"
              data-testid="filter-dropdown"
              value={currentFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="pl-3 pr-8 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="firstLevel">First Level</option>
              <option value="secondLevel">Second Level</option>
              <option value="scaling">Scaling</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <svg className="h-4 w-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {ideas.length === 0 ? (
        <p
          className="text-zinc-600 dark:text-zinc-400 mt-4"
          data-testid="no-ideas"
        >
          No ideas yet. Add your first idea!
        </p>
      ) : (
        <div className="overflow-x-auto" data-testid="ideas-list">
        <table className="w-full bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-2 py-2 text-right text-sm font-semibold text-zinc-900 dark:text-white w-12">
                #
              </th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-zinc-900 dark:text-white w-20">
                Age
              </th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                Name
              </th>
              <th className="px-2 py-2 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                Hypothesis
              </th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                Validation Status
              </th>
              <th className="px-2 py-2 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                Source
              </th>
              <th className="px-2 py-2 text-right text-sm font-semibold text-zinc-900 dark:text-white">
                Votes
              </th>
            </tr>
          </thead>
          <tbody>
            {ideas.map((idea) => (
              <Fragment key={idea.id}>
              <tr
                onClick={() => handleRowClick(idea.id)}
                className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-opacity duration-200 ${
                  expandedId === idea.id ? "hidden" : "opacity-100"
                }`}
                data-testid="idea-item"
              >
                <td className="px-2 py-2 text-right text-sm text-zinc-500 dark:text-zinc-400" data-testid="idea-number">
                  {idea.ideaNumber}
                </td>
                <td className="px-2 py-2 text-zinc-500 dark:text-zinc-400 text-sm" data-testid="idea-age" suppressHydrationWarning>
                  {formatRelativeTime(idea.createdAt)}
                </td>
                <td className="px-2 py-2 text-sm text-zinc-900 dark:text-white" data-testid="idea-name">
                  <Link
                    href={basePath ? `${basePath}/${idea.ideaNumber}` : `/ideas/${idea.ideaNumber}`}
                    className="hover:text-orange-600 dark:hover:text-orange-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {idea.name}
                  </Link>
                </td>
                <td className="px-2 py-2 text-sm text-zinc-600 dark:text-zinc-400" data-testid="idea-hypothesis">
                  <div className="whitespace-pre-wrap line-clamp-3">
                    {idea.hypothesis}
                  </div>
                </td>
                <td className="px-2 py-2 text-center" data-testid="idea-status">
                  {idea.validationStatus && (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColors[idea.validationStatus] || "bg-zinc-100 text-zinc-800"}`}
                    >
                      {statusLabels[idea.validationStatus] || idea.validationStatus}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-center" data-testid="idea-source">
                  {idea.source && (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${sourceColor}`}
                    >
                      {sourceLabels[idea.source] || idea.source}
                    </span>
                  )}
                </td>
                <td className="px-2 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span
                      className="text-sm text-zinc-600 dark:text-zinc-400"
                      data-testid="upvote-count"
                    >
                      {idea.upvotes || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote(idea.id);
                      }}
                      className="px-2 py-1 text-xs font-medium rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      data-testid="upvote-button"
                    >
                      +1
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === idea.id && (
                <tr
                  key={`${idea.id}-expanded`}
                  onClick={() => handleRowClick(idea.id)}
                  className="cursor-pointer animate-slideDown border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  data-testid="expanded-content"
                >
                  <td colSpan={7} className="px-8 py-6 bg-zinc-50 dark:bg-zinc-800/30">
                    <div className="space-y-4">
                      {/* Header with idea number and name */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-baseline gap-3">
                          <span className="text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                            #{idea.ideaNumber}
                          </span>
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            <Link
                              href={basePath ? `${basePath}/${idea.ideaNumber}` : `/ideas/${idea.ideaNumber}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {idea.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400" suppressHydrationWarning>
                            {formatRelativeTime(idea.createdAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              {idea.upvotes || 0}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpvote(idea.id);
                              }}
                              className="px-2 py-1 text-xs font-medium rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {idea.validationStatus && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${statusColors[idea.validationStatus] || "bg-zinc-100 text-zinc-800"}`}>
                            {statusLabels[idea.validationStatus] || idea.validationStatus}
                          </span>
                        )}
                        {idea.source && (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${sourceColor}`}>
                            {sourceLabels[idea.source] || idea.source}
                          </span>
                        )}
                      </div>

                      {/* Hypothesis */}
                      <div>
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Hypothesis</h4>
                        <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-wrap" data-testid="expanded-hypothesis">
                          {idea.hypothesis || "No hypothesis provided."}
                        </p>
                      </div>

                      {/* Created date */}
                      <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        <span>Created: </span>
                        <span className="text-zinc-900 dark:text-white" data-testid="expanded-created">
                          {new Date(idea.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </>
  );
}
