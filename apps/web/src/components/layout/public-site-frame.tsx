import { ReactNode } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { PublicSiteFooter } from "./public-site-footer";
import { SiteHeader } from "./site-header";

export function PublicSiteFrame({
  children,
  showMobileDock = false,
  headerClassName,
  contentClassName,
}: {
  children: ReactNode;
  showMobileDock?: boolean;
  headerClassName?: string;
  contentClassName?: string;
}) {
  return (
    <>
      <SiteHeader className={headerClassName} />
      <div className={`relative min-h-[calc(100vh-4rem)] pt-16 ${contentClassName ?? ""}`}>
        {children}
      </div>
      <PublicSiteFooter />
      {showMobileDock ? <MobileBottomNav /> : null}
    </>
  );
}
