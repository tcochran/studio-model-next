import type { Idea, SortField, FilterField, StatusHistoryEntry } from "./types";

export function sortIdeas(ideas: Idea[], sortBy: SortField): Idea[] {
  const sorted = [...ideas];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) =>
        (a.name || "").localeCompare(b.name || "")
      );
    case "validationStatus":
      const statusOrder: Record<string, number> = {
        backlog: 0,
        firstLevel: 1,
        secondLevel: 2,
        scaling: 3,
        failed: 4,
      };
      return sorted.sort(
        (a, b) =>
          (statusOrder[a.validationStatus || ""] || 999) -
          (statusOrder[b.validationStatus || ""] || 999)
      );
    case "age":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "ageOldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case "upvotes":
      return sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    case "ideaNumber":
      return sorted.sort((a, b) => a.ideaNumber - b.ideaNumber);
    default:
      return sorted;
  }
}

export function filterIdeas(ideas: Idea[], filterBy: FilterField): Idea[] {
  if (filterBy === "all") return ideas;
  return ideas.filter((idea) => idea.validationStatus === filterBy);
}

export function parseStatusHistory(
  statusHistory: string[] | null
): StatusHistoryEntry[] {
  if (!statusHistory) return [];

  return statusHistory
    .map((entry) => {
      try {
        return JSON.parse(entry) as StatusHistoryEntry;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is StatusHistoryEntry => entry !== null)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export function getNextIdeaNumber(ideas: Idea[]): number {
  if (ideas.length === 0) return 1;
  return Math.max(...ideas.map((i) => i.ideaNumber)) + 1;
}
