import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  actions?: ReactNode;
}

export function PageTitle({ title, actions }: PageTitleProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black dark:text-white">
          {title}
        </h1>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
