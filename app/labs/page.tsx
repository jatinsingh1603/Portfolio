import type { Metadata } from "next";
import { CyberLab } from "@/components/sections/cyber-lab";
import { AiLab } from "@/components/sections/ai-lab";

export const metadata: Metadata = {
  title: "Interactive security and automation labs",
  description:
    "Explore the security investigation method and automation workflows behind the portfolio.",
};

export default function LabsPage() {
  return (
    <main id="main" className="cinematic" style={{ paddingTop: 120 }}>
      <h1 className="sr-only">Security and automation labs</h1>
      <div className="film-labs">
        <CyberLab />
        <AiLab />
      </div>
    </main>
  );
}
