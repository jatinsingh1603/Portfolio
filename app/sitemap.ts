import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/security", "/resume", "/contact"];
  return [
    ...routes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
      priority: route === "" ? 1 : 0.8,
    })),
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(),
      priority: 0.6,
    })),
  ];
}
