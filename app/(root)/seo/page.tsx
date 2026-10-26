import type { Metadata, Viewport } from "next";

/**
 * 完整的 Metadata 演示。
 *
 * 三个导出各司其职：
 *  - metadata        静态元信息（可被 generateMetadata 覆盖）
 *  - generateMetadata 动态元信息（拿 params/searchParams）
 *  - viewport        视口相关（Next 14+ 从 metadata 里拆出来的）
 */
export const metadata: Metadata = {
  title: {
    default: "next16-sass · Next.js 16 全栈实验室",
    template: "%s · next16-sass",
  },
  description: "把 App Router 全部核心机制跑一遍的教学型仓库",
  applicationName: "next16-sass",
  authors: [{ name: "next16-sass" }],
  keywords: ["Next.js", "App Router", "React 19", "教学"],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/seo",
    siteName: "next16-sass",
    title: "SEO 元数据演示",
    description: "openGraph 会被微信 / Facebook / Twitter 抓取",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO 元数据演示",
    description: "twitter:card = summary_large_image 会渲染成大图卡片",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "light dark",
};

export default function SeoPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>SEO 元数据 · metadata / viewport</h1>
      <div className="mt-4 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
        <p>在浏览器里右键「查看网页源代码」，可以看到 head 里自动生成的全部标签。</p>
      </div>
      <div className="mt-6 rounded-lg border border-sky-300 bg-sky-50 p-4 text-sm dark:border-sky-700 dark:bg-sky-950">
        <h2 className="font-semibold">要点</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>title 用 template 后，子页面只需要写 title 字段，父级自动拼接后缀。</li>
          <li>viewport 在 Next 14 之后必须单独导出，不能再塞进 metadata。</li>
          <li>动态页面用 generateMetadata（本项目在 /dashboard/users/[id] 演示过）。</li>
          <li>图标与 OG 图可以用约定文件动态生成（app/icon.tsx、app/opengraph-image.tsx）。</li>
        </ul>
      </div>
    </div>
  );
}
