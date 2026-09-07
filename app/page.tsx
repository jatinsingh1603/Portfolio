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
 * Eleven stations, in the order the rail counts them. The only data fetched
 * anywhere on the site is the optional GitHub repository count, resolved at
 * build time with a verified static fallback.
 */
export default async function Home() {
  const github = await fetchGithubStats();
  const labels = brand.system.map((s) => ({ id: s.id, label: s.label }));
  return (
    <>
      <WorldLoader labels={labels} />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Research />
        <CyberLab />
        <AiLab />
        <Skills />
        <Achievements />
        <Contact github={github} />
      </main>
    </>
  );
}
