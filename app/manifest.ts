import type { MetadataRoute } from "next";

/**
 * app/manifest.ts —— 约定文件，自动产出 /manifest.webmanifest。
 *
 * PWA 的「应用清单」：告诉浏览器安装到桌面后叫什么、什么图标、什么主题色。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "next16-sass · Next.js 16 全栈实验室",
    short_name: "next16-sass",
    description: "把 App Router 全部核心机制跑一遍的教学型仓库",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
