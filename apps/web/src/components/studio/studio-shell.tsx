import type { ReactNode } from "react";

type StudioShellProps = {
  toolbar: ReactNode;
  children: ReactNode;
};

export function StudioShell({ toolbar, children }: StudioShellProps) {
  return (
    <div className="space-y-6">
      {toolbar}

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-3 sm:p-4">
        <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
