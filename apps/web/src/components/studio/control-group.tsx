import type { ReactNode } from "react";

type ControlGroupProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function ControlGroup({
  title,
  subtitle,
  children,
  className = "",
}: ControlGroupProps) {
  return (
    <div
      className={`rounded-[1.5rem] border border-white/10 bg-black/20 p-4 sm:p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-white sm:text-base">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  );
}
