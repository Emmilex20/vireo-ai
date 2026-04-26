import type { ReactNode } from "react";

type StudioCardProps = {
  children: ReactNode;
  className?: string;
};

export function StudioCard({ children, className = "" }: StudioCardProps) {
  return (
    <div
      className={`rounded-[1.75rem] border border-white/10 bg-white/5 p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
