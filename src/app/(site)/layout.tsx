import type { PropsWithChildren } from "react";
import { SiteShell } from "@/components/site-shell";

export default function PublicLayout({ children }: PropsWithChildren) {
  return <SiteShell>{children}</SiteShell>;
}
