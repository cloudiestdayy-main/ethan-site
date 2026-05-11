import type { PropsWithChildren } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-pure-black text-pure-white">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
