import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_URL, identity, positioning } from "@/content/site";
import { personJsonLd } from "@/lib/json-ld";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${identity.name} · ${identity.title}`,
    template: `%s · ${identity.name}`,
  },
  description: positioning.intro,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: identity.name,
    url: SITE_URL,
    title: `${identity.name} · ${identity.title}`,
    description: positioning.intro,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`js-reveal-gate ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <noscript>
          {/* Scripting off: reveals must never hide content permanently. */}
          <style>{`.js-reveal-gate [data-reveal="out"]{opacity:1;transform:none}`}</style>
        </noscript>
        {/* Runs before first paint; see lib/theme-script.ts for the CSP contract. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLd }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
