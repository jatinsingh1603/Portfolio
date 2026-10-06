import { motionStudyContent } from "@/content/motion-study";
import { MotionStudy } from "@/components/motion-study";
import "./motion-study.css";
import "./evidence-sheet.css";

export default function HomePage() {
  return <MotionStudy content={motionStudyContent} />;
}
