import type { MetadataRoute } from "next";

/**
 * app/sitemap.ts —— 约定文件，自动产出 /sitemap.xml。
 *
 * Next 会在构建期执行这个函数，把返回值序列化成 XML。
 * 搜索引擎抓取时访问 /sitemap.xml 即可拿到全站结构。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://next16-sass-beta.vercel.app";

  const staticRoutes = ["", "/about", "/albums", "/books", "/mycache", "/ssg/1", "/knowledge"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...[1, 2, 3].map((id) => ({
      url: `${baseUrl}/ssg/${id}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
