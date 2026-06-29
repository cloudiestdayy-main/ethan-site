import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Ethan's Drawings | Portfolio manga",
    template: "%s | Ethan's Drawings",
  },
  description:
    "Portfolio manga e illustrazioni di Ethan, artista italiano appassionato di cultura giapponese.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ethan's Drawings | Portfolio manga",
    description: "Dove il disegno prende forma. Tavole manga e commissioni artistiche.",
    type: "website",
    locale: "it_IT",
    siteName: "Ethan's Drawings",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethan's Drawings | Portfolio manga",
    description: "Dove il disegno prende forma. Tavole manga e commissioni artistiche.",
  },
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ethan's Drawings",
  url: siteUrl,
  inLanguage: "it-IT",
  author: {
    "@type": "Person",
    name: "Ethan",
    jobTitle: "Illustratore / Artista manga",
    url: `${siteUrl}/about`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${cormorant.variable} ${manrope.variable} h-full scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-pure-black text-pure-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
