import Link from "next/link";

type ValidationStatus = "backlog" | "firstLevel" | "secondLevel" | "scaling" | "failed";

interface IdeaCardProps {
  ideaNumber: number;
  name: string;
  validationStatus: ValidationStatus;
  href: string;
}

const statusColors: Record<ValidationStatus, { card: string; border: string }> = {
  backlog: {
    card: "bg-gray-50 dark:bg-gray-950/20",
    border: "border-gray-200 dark:border-gray-800",
  },
  firstLevel: {
    card: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
  },
  secondLevel: {
    card: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-200 dark:border-purple-800",
  },
  scaling: {
    card: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-200 dark:border-green-800",
  },
  failed: {
    card: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
  },
};

export function IdeaCard({ ideaNumber, name, validationStatus, href }: IdeaCardProps) {
  const colors = statusColors[validationStatus];

  return (
    <Link
      href={href}
      data-testid="idea-card"
      className={`flex gap-2 p-3 min-h-[72px] w-[160px] ${colors.card} border ${colors.border} rounded hover:shadow-md hover:scale-105 transition-all cursor-pointer`}
    >
      <div
        className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 flex-shrink-0"
        data-testid="idea-card-number"
      >
        #{ideaNumber}
      </div>
      <div
        className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-3 flex-1"
        data-testid="idea-card-name"
      >
        {name}
      </div>
    </Link>
  );
}
