import { About } from "@/components/sections/about";
import { Achievements } from "@/components/sections/achievements";
import { AiLab } from "@/components/sections/ai-lab";
import { Contact } from "@/components/sections/contact";
import { CyberLab } from "@/components/sections/cyber-lab";
import { Elsewhere } from "@/components/sections/elsewhere";
import { Hero } from "@/components/sections/hero";
import { Journey } from "@/components/sections/journey";
import { Research } from "@/components/sections/research";
import { Skills } from "@/components/sections/skills";
import { Work } from "@/components/sections/work";
import { fetchGithubStats } from "@/lib/github";

/**
 * Eleven stations, in the order the rail counts them. The only data fetched
 * anywhere on the site is the optional GitHub repository count, resolved at
 * build time with a verified static fallback.
 */
export default async function Home() {
  const github = await fetchGithubStats();
  return (
    <main id="main">
      <Hero />
      <About />
      <Work />
      <Research />
      <CyberLab />
      <AiLab />
      <Skills />
      <Journey />
      <Achievements />
      <Elsewhere github={github} />
      <Contact />
    </main>
  );
}
