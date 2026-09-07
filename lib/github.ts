import { profiles } from "@/content/profiles";

/**
 * Optional, build-time only. The public GitHub API needs no credentials; a
 * `GITHUB_TOKEN` raises the rate limit if one is set. Every failure path —
 * offline CI, rate limit, timeout, malformed body — returns `null`, and the
 * caller falls back to the verified static metric in content/profiles.ts.
 *
 * Nothing here runs in the browser: `connect-src 'self'` would block it, and
 * the site's premise is that no number is shown unless it was verified.
 */
export type GithubStats = {
  publicRepos: number;
  followers: number;
  profileUrl: string;
};

const login =
  profiles.find((p) => p.platform === "GitHub")?.handle ?? "jatinsingh1603";

export async function fetchGithubStats(): Promise<GithubStats | null> {
  if (process.env.PORTFOLIO_SKIP_GITHUB === "1") return null;
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-build",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com/users/${login}`, {
      headers,
      // Fetched once per build. The page stays fully static.
      cache: "force-cache",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      public_repos?: unknown;
      followers?: unknown;
      html_url?: unknown;
    };
    if (
      typeof body.public_repos !== "number" ||
      typeof body.followers !== "number"
    ) {
      return null;
    }
    return {
      publicRepos: body.public_repos,
      followers: body.followers,
      profileUrl:
        typeof body.html_url === "string"
          ? body.html_url
          : `https://github.com/${login}`,
    };
  } catch {
    return null;
  }
}
