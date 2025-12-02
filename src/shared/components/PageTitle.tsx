import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  actions?: ReactNode;
  maxWidth?: "5xl" | "7xl";
}

export function PageTitle({ title, actions, maxWidth = "5xl" }: PageTitleProps) {
  const maxWidthClass = maxWidth === "7xl" ? "max-w-7xl" : "max-w-5xl";

  return (
    <div className={`mx-auto ${maxWidthClass} px-4 py-6`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {title}
        </h1>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
