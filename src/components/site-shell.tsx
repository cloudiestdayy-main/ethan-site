import type { PropsWithChildren } from "react";
import { CustomCursor } from "@/components/custom-cursor";
import { NoiseOverlay } from "@/components/noise-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function SiteShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-pure-black text-pure-white">
      <SiteHeader />
      {children}
      <SiteFooter />
      <NoiseOverlay />
      <CustomCursor />
    </div>
  );
}
