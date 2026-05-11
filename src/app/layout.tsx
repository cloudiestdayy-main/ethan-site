import type { Metadata } from "next";
import "./globals.css";

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
  openGraph: {
    title: "Ethan's Drawings | Portfolio manga",
    description: "Dove il disegno prende forma. Tavole manga e commissioni artistiche.",
    type: "website",
    locale: "it_IT",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full bg-pure-black text-pure-white antialiased">
        {children}
      </body>
    </html>
  );
}
