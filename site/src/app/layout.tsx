import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { THEME_SCRIPT } from "@/components/ThemeToggle";
import "./globals.css";

const OG_IMAGE = "https://mogesjohnson.github.io/BEST-OF-AI-DEV/images/og.jpg";

export const metadata: Metadata = {
  title: { default: "BEST OF AI DEV", template: "%s | BEST OF AI DEV" },
  description: "Why each practice in the BEST OF AI DEV template exists, with the evidence behind it.",
  // Share cards need absolute URLs. The site lives at /BEST-OF-AI-DEV on GitHub Pages.
  metadataBase: new URL("https://mogesjohnson.github.io"),
  openGraph: {
    type: "website",
    siteName: "BEST OF AI DEV",
    images: [{ url: OG_IMAGE, width: 1280, height: 720, alt: "BEST OF AI DEV: rules, templates and practices for AI-first dev" }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
