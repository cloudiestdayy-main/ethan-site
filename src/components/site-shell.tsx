import type { PropsWithChildren } from "react";
import { NoiseOverlay } from "@/components/noise-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-pure-white text-ink">
      <SiteHeader />
      {children}
      <SiteFooter />
      <NoiseOverlay />
    </div>
  );
}
