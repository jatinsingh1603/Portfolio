import { Suspense } from "react";
import { About } from "@/components/sections/about";
import { Achievements } from "@/components/sections/achievements";
import { AiLab } from "@/components/sections/ai-lab";
import { Contact } from "@/components/sections/contact";
import { CyberLab } from "@/components/sections/cyber-lab";
import { Hero } from "@/components/sections/hero";
import { Research } from "@/components/sections/research";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { WorldLoader } from "@/components/world/world-loader";
import { brand } from "@/content/brand";
import { fetchGithubStats } from "@/lib/github";

/**
 * Nine stations, in the order the rail counts them. Each sits in its own
 * Suspense boundary: the HTML is complete either way, but on the client React
 * then hydrates the stations as separate tasks that yield to the main thread,
 * instead of one long task — which is what a slow device feels at load. The
 * only data fetched anywhere on the site is the optional GitHub repository
 * count, resolved at build time with a verified static fallback.
 */
export default async function Home() {
  const github = await fetchGithubStats();
  const labels = brand.system.map((s) => ({ id: s.id, label: s.label }));
  return (
    <>
      <WorldLoader labels={labels} />
      <main id="main">
        <Suspense fallback={null}>
          <Hero />
        </Suspense>
        <Suspense fallback={null}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Work />
        </Suspense>
        <Suspense fallback={null}>
          <Research />
        </Suspense>
        <Suspense fallback={null}>
          <CyberLab />
        </Suspense>
        <Suspense fallback={null}>
          <AiLab />
        </Suspense>
        <Suspense fallback={null}>
          <Skills />
        </Suspense>
        <Suspense fallback={null}>
          <Achievements />
        </Suspense>
        <Suspense fallback={null}>
          <Contact github={github} />
        </Suspense>
      </main>
    </>
  );
}
