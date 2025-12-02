import { ReactNode } from "react";

interface PageContentProps {
  children: ReactNode;
  maxWidth?: "5xl" | "7xl";
}

export function PageContent({ children, maxWidth = "5xl" }: PageContentProps) {
  const maxWidthClass = maxWidth === "7xl" ? "max-w-7xl" : "max-w-5xl";

  return (
    <main className={`mx-auto ${maxWidthClass} px-4 py-8`}>
      {children}
    </main>
  );
}
