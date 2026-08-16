import { Capabilities } from "@/components/sections/capabilities";
import { Contact } from "@/components/sections/contact";
import { Credentials } from "@/components/sections/credentials";
import { Credibility } from "@/components/sections/credibility";
import { Currently } from "@/components/sections/currently";
import { Elsewhere } from "@/components/sections/elsewhere";
import { Hero } from "@/components/sections/hero";
import { Recognition } from "@/components/sections/recognition";
import { Research } from "@/components/sections/research";
import { Work } from "@/components/sections/work";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <Credibility />
      <Currently />
      <Work />
      <Research />
      <Recognition />
      <Capabilities />
      <Credentials />
      <Elsewhere />
      <Contact />
    </main>
  );
}
