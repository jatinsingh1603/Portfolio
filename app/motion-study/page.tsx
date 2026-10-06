import type { Metadata } from "next";
import { motionStudyContent } from "@/content/motion-study";
import { MotionStudy } from "@/components/motion-study";
import "../motion-study.css";
import "../evidence-sheet.css";

export const metadata: Metadata = {
  title: "The case of Jatin Singh | Motion preview",
  description:
    "A cinematic exploration of Jatin Singh's journey through cybersecurity, research and automation.",
  robots: { index: false, follow: false },
};

export default function MotionStudyPage() {
  return <MotionStudy content={motionStudyContent} />;
}
