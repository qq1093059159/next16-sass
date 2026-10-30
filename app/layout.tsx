import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { jsonLdScript, websiteJsonLd } from "@/lib/seo";
import SearchShortcut from "@/components/search/SearchShortcut";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  /**
   * RSS 自动发现 —— 浏览器/阅读器扫到这一行就知道 feed 在哪。
   * 少了这一行，订阅者就得手动填 /rss.xml 地址。
   */
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: `${SITE_NAME} RSS` }],
    },
  },
};

export default function DashboardLayout({
  children,
  team,
  analytics,
}: {
  children: React.ReactNode;
  team: React.ReactNode;
  analytics: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 全站搜索快捷键（/ 聚焦 · ⌘K 跳转） */}
        <SearchShortcut />

        {/* 站点级 JSON-LD：WebSite + SearchAction（声明站内搜索） */}
        {jsonLdScript(websiteJsonLd())}

        <main className="bg-white text-black dark:bg-black dark:text-white">
            {/* 加载平行路由 */}
            {team}
            {children}
            {analytics}
            <SpeedInsights />
            <Analytics />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
