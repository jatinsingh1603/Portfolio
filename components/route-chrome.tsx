"use client";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const SiteHeader = dynamic(
  () => import("./site-header").then((module) => module.SiteHeader),
  { ssr: false },
);
const Rail = dynamic(() => import("./rail").then((module) => module.Rail), {
  ssr: false,
});
const Interactions = dynamic(
  () => import("./interactions").then((module) => module.Interactions),
  { ssr: false },
);

const hasOwnChrome = (path: string) =>
  path === "/" || /^\/(motion-study|resume)\/?$/.test(path);

/** The cinematic home owns its framing and renders the portrait just once. */
export function RouteChrome({ children }: { children: ReactNode }) {
  return hasOwnChrome(usePathname()) ? null : children;
}

/** Secondary-page controls load only where they are used. */
export function TopChrome() {
  return hasOwnChrome(usePathname()) ? null : (
    <>
      <Interactions />
      <Rail />
      <SiteHeader />
    </>
  );
}
