import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Studio Tavole | Portfolio manga editoriale",
    template: "%s | Studio Tavole",
  },
  description:
    "Portfolio editoriale per tavole manga e commissioni artistiche, con una direzione visiva minimale e contemplativa.",
  openGraph: {
    title: "Studio Tavole | Portfolio manga editoriale",
    description:
      "Tavole manga presentate come una galleria d'arte contemporanea.",
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
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
