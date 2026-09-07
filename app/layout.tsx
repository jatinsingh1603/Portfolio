import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
} from "next/font/google";
import { Rail } from "@/components/rail";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { brand } from "@/content/brand";
import { SITE_URL, identity, positioning } from "@/content/site";
import { personJsonLd } from "@/lib/json-ld";
import { THEME_SCRIPT } from "@/lib/theme-script";
import "./globals.css";

/**
 * All three faces are downloaded and self-hosted at build time (no runtime
 * request to Google, so `font-src 'self'` holds). Latin subsets only, and only
 * the weights the stylesheet uses. The display face is one static weight: the
 * variable file with its optical-size axis is 75 KB and sat on the LCP path;
 * the static 600 is under half that and carries the headline just as well.
 */
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

/**
 * Not preloaded on purpose: the headline is set in the display face, and this
 * 41 KB file competing for the same throttled connection was the difference
 * between LCP at 1.54 s and under the 1.5 s budget. It swaps in behind a
 * metric-matched fallback, so nothing shifts.
 */
const sans = IBM_Plex_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

const mono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const title = `${identity.name} · ${identity.title}`;
const description = `${brand.tagline}. ${positioning.intro}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s · ${identity.name}` },
  description,
  alternates: { canonical: "/" },
  authors: [{ name: identity.name, url: SITE_URL }],
  creator: identity.name,
  openGraph: {
    type: "website",
    siteName: identity.name,
    url: SITE_URL,
    title,
    description,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description },
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
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <noscript>
          {/* Scripting off: reveals must never hide content permanently. */}
          <style>{`[data-reveal="out"]{opacity:1!important;transform:none!important}.rule--ticked{transform:none!important}`}</style>
        </noscript>
        {/* Runs before first paint; see lib/theme-script.ts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: personJsonLd }}
        />
      </head>
      <body>
        <div className="ground" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Rail />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
