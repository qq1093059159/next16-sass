import type { MetadataRoute } from "next";

/**
 * app/robots.ts —— 约定文件，自动产出 /robots.txt。
 *
 * 告诉爬虫哪些路径可以抓、哪些不要抓，并在最后附上 sitemap 地址。
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/basic/", "/mycache"],
      },
    ],
    sitemap: "https://next16-sass-beta.vercel.app/sitemap.xml",
    host: "https://next16-sass-beta.vercel.app",
  };
}
