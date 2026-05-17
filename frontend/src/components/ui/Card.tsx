import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = "p-6",
}: {
  children: ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={`glass-card rounded-3xl ${padding} ${className}`}>{children}</div>
  );
}
