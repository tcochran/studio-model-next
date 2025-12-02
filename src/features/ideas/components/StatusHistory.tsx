import type { StatusHistoryEntry } from "../types";

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  firstLevel: "First Level",
  secondLevel: "Second Level",
  scaling: "Scaling",
  failed: "Failed",
};

const statusColors: Record<string, string> = {
  backlog: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  firstLevel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  secondLevel: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  scaling: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface StatusHistoryProps {
  history: StatusHistoryEntry[];
}

export function StatusHistory({ history }: StatusHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-8" data-testid="status-history">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Status History
      </h2>
      <div className="space-y-3">
        {history.map((entry, index) => {
          const date = new Date(entry.timestamp);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={`${entry.timestamp}-${index}`}
              data-testid="history-entry"
              className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[entry.status] || "bg-zinc-100 text-zinc-800"}`}
                  >
                    {statusLabels[entry.status] || entry.status}
                  </span>
                  <span
                    data-testid="history-timestamp"
                    className="text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    {formattedDate} at {formattedTime}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                    {entry.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
