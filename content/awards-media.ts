import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Award photos are read from the filesystem at build time rather than listed in
 * a content module, so adding one is a matter of dropping a file in
 * public/images/awards/ — see the README there for the naming rule and for the
 * two rights questions to answer before publishing event photography.
 */
const AWARDS_DIR = path.join(process.cwd(), "public", "images", "awards");
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

export function awardPhotoSlug(event: string): string {
  return event
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function awardPhotos(event: string): string[] {
  if (!existsSync(AWARDS_DIR)) return [];
  const slug = awardPhotoSlug(event);
  return readdirSync(AWARDS_DIR)
    .filter((file) => IMAGE_RE.test(file) && file.startsWith(`${slug}-`))
    .sort()
    .map((file) => `/images/awards/${file}`);
}
