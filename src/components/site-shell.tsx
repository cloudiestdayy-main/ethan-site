import type { PropsWithChildren } from "react";
import { MotionProvider } from "@/components/motion-provider";
import { NoiseOverlay } from "@/components/noise-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings } from "@/lib/settings";

export async function SiteShell({ children }: PropsWithChildren) {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen bg-pure-white text-ink">
      <SiteHeader announcement={settings.announcement_text} />
      <MotionProvider>{children}</MotionProvider>
      <SiteFooter
        contactEmail={settings.contact_email}
        socials={{
          instagramUrl: settings.instagram_url,
          twitterUrl: settings.twitter_url,
          artstationUrl: settings.artstation_url,
        }}
      />
      <NoiseOverlay />
    </div>
  );
}
