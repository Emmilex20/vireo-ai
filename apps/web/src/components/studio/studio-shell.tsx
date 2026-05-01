import type { ReactNode } from "react";

type StudioShellProps = {
  toolbar: ReactNode;
  children: ReactNode;
};

export function StudioShell({ toolbar, children }: StudioShellProps) {
  void toolbar;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-0">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-2.5 sm:rounded-[2rem] sm:p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-3 sm:rounded-[1.5rem] sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}
