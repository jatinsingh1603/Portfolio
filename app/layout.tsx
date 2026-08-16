import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SITE_URL, identity, positioning } from "@/content/site";
import { personJsonLd } from "@/lib/json-ld";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

/**
 * Downloaded and self-hosted at build time (no runtime request to Google, so
 * `font-src 'self'` holds). Declared here rather than pulled from the `geist`
 * npm package because that package ships the full 70 KB charset and Next does
 * not emit a preload for it — together that cost ~1.9s of LCP on Slow 4G, as
 * the fallback face painted at FCP and the real face swapped in much later.
 * The Latin subset is ~20 KB per family and Next preloads it automatically.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

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
      className={`js-reveal-gate ${geistSans.variable} ${geistMono.variable}`}
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
