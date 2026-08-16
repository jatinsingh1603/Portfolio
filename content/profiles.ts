import type { Profile } from "./schema";

/**
 * §4.10 hard rule: `metric` is rendered verbatim or omitted entirely. Every
 * value below was verified at build time or supplied by the owner in writing.
 * If you do not have the number, leave it undefined — never estimate.
 */
export const profiles: Profile[] = [
  {
    platform: "GitHub",
    handle: "jatinsingh1603",
    url: "https://github.com/jatinsingh1603",
    metric: "16 public repositories",
  },
  {
    platform: "LinkedIn",
    handle: "jatinsingh1603",
    url: "https://www.linkedin.com/in/jatinsingh1603/",
  },
  {
    platform: "Google Bug Hunters",
    handle: "Profile",
    url: "https://bughunters.google.com/profile/3645d13e-669c-4a4e-a8b1-b32d9b75b4d7",
    // Reputation and valid-report count pending — the profile is not
    // machine-readable and nothing here will be guessed.
  },
  {
    platform: "TryHackMe",
    handle: "inNinja",
    url: "https://tryhackme.com/p/inNinja",
    // Rank, level and room count pending from the owner.
  },
  {
    platform: "LeetCode",
    handle: "jatinsingh1603",
    url: "https://leetcode.com/u/jatinsingh1603/",
    metric: "535 problems solved",
  },
  {
    platform: "swiftPentest",
    handle: "swiftsaneai/swiftPentest",
    url: "https://github.com/swiftsaneai/swiftPentest",
    metric: "Contributor · Python · MIT",
  },
  {
    platform: "X",
    handle: "jatinsingh1603",
    url: "https://x.com/jatinsingh1603",
  },
];

/** Everything the JSON-LD `sameAs` array should contain. */
export const sameAs = [...profiles.map((p) => p.url), "https://swiftsane.com"];
