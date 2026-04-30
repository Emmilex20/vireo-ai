import { ReactNode } from "react";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { PublicSiteFooter } from "./public-site-footer";
import { SiteHeader } from "./site-header";

export function PublicSiteFrame({
  children,
  showMobileDock = false,
}: {
  children: ReactNode;
  showMobileDock?: boolean;
}) {
  return (
    <>
      <SiteHeader />
      <div className="relative min-h-[calc(100vh-4rem)] pt-16">{children}</div>
      <PublicSiteFooter />
      {showMobileDock ? <MobileBottomNav /> : null}
    </>
  );
}
