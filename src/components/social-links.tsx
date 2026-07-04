import { ArtStationIcon, InstagramIcon, XIcon } from "@/components/social-icons";

export type SocialUrls = {
  instagramUrl: string;
  twitterUrl: string;
  artstationUrl: string;
};

export function hasSocialLinks(urls: SocialUrls) {
  return Boolean(
    urls.instagramUrl.trim() || urls.twitterUrl.trim() || urls.artstationUrl.trim(),
  );
}

/**
 * Icone social da site_settings: rende solo quelle con un URL impostato.
 * Il contenitore/layout lo decide il chiamante (footer vs pagina Contatti).
 */
export function SocialLinks({
  urls,
  linkClassName,
  iconClassName = "h-5 w-5",
}: {
  urls: SocialUrls;
  linkClassName: string;
  iconClassName?: string;
}) {
  const links = [
    { href: urls.instagramUrl.trim(), label: "Instagram", Icon: InstagramIcon },
    { href: urls.twitterUrl.trim(), label: "X", Icon: XIcon },
    { href: urls.artstationUrl.trim(), label: "ArtStation", Icon: ArtStationIcon },
  ].filter((link) => link.href);

  if (!links.length) {
    return null;
  }

  return (
    <>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
          aria-label={label}
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </>
  );
}
