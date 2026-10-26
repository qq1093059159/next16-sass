# 第 20 课 · 元数据与 SEO 约定文件

> **学习目标**：掌握 `metadata` / `generateMetadata` / `viewport`，以及六个 SEO 约定文件。
> **对应代码**：`app/(root)/seo/page.tsx`、`app/sitemap.ts`、`app/robots.ts`、`app/manifest.ts`、`app/icon.tsx`、`app/opengraph-image.tsx`
> **预计耗时**：40 分钟

---

## 一、三个导出，各司其职

| 导出 | 类型 | 用途 |
|---|---|---|
| `metadata` | 静态对象 | 固定元信息 |
| `generateMetadata` | 异步函数 | 动态元信息（拿 params/searchParams） |
| `viewport` | 静态对象 | 视口相关（**Next 14+ 必须单独导出**） |

---

## 二、真实代码

### 2.1 `app/(root)/seo/page.tsx`

```tsx
import type { Metadata, Viewport } from "next";

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
    </div>
  );
}
```

**`title` 的两种写法**：

```tsx
title: "固定标题"                    // 就是这个
title: { default: "站点默认标题", template: "%s · 站点名" }
```

用 `template` 后，子页面只需写 `title: "我的页面"`，父级自动拼成
`我的页面 · 站点名`。

### 2.2 动态 metadata：`app/(dashboard)/dashboard/users/[id]/page.tsx`

```tsx
import React from "react";
// 设置动态meta
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `User #${id}`,
    description: `User detail page for user ${id}`,
  };
}
export default async function UserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>Showing UserDetail for user #{id}</div>;
}
```

> `generateMetadata` 的 `params` **也是 Promise**，必须 `await`。

---

## 三、六个 SEO 约定文件

| 文件 | 产出 | 类型 |
|---|---|---|
| `app/sitemap.ts` | `/sitemap.xml` | `MetadataRoute.Sitemap` |
| `app/robots.ts` | `/robots.txt` | `MetadataRoute.Robots` |
| `app/manifest.ts` | `/manifest.webmanifest` | `MetadataRoute.Manifest` |
| `app/icon.tsx` | `/icon` | 动态 PNG |
| `app/opengraph-image.tsx` | `/opengraph-image` | 动态分享图 |
| `app/favicon.ico` | `/favicon.ico` | 静态图标 |

### 3.1 `app/sitemap.ts`

```ts
import type { MetadataRoute } from "next";

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
```

### 3.2 `app/robots.ts`

```ts
import type { MetadataRoute } from "next";

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
```

### 3.3 `app/manifest.ts`

```ts
import type { MetadataRoute } from "next";

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
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
```

### 3.4 `app/icon.tsx` —— 动态生成图标

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        N
      </div>
    ),
    { ...size },
  );
}
```

**不需要在 `public/` 放 png**：Next 在构建期执行这个组件，
用 Satori 把 JSX 渲染成 PNG，产出 `/icon` 并自动写进 `<head>`。

### 3.5 `app/opengraph-image.tsx` —— 动态分享卡片

```tsx
import { ImageResponse } from "next/og";

export const alt = "next16-sass · Next.js 16 全栈实验室";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0f1117 0%, #212734 100%)",
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 800,
        }}
      >
        <div>next16-sass</div>
        <div style={{ fontSize: 36, fontWeight: 400, opacity: 0.8, marginTop: 16 }}>
          Next.js 16 全栈实验室 · App Router 知识点地图
        </div>
      </div>
    ),
    { ...size },
  );
}
```

---

## 四、动手实验

### 实验 1：看生成的 head 标签

访问 <http://localhost:3000/seo>，「查看网页源代码」，看 `<head>` 里自动生成的标签。

**重点看**：`title`、`description`、`og:*`、`twitter:*`、`viewport`、`theme-color`。

### 实验 2：验证 title 模板

```bash
curl -s http://127.0.0.1:3000/seo | grep -o "<title>[^<]*</title>"
curl -s http://127.0.0.1:3000/dashboard/users/7 | grep -o "<title>[^<]*</title>"
```

**预期**：

- `/seo` → `<title>next16-sass · Next.js 16 全栈实验室</title>`（用了 default）
- `/dashboard/users/7` → `<title>User #7 · next16-sass</title>`（模板拼接生效）

### 实验 3：访问六个 SEO 产物

```bash
for p in /sitemap.xml /robots.txt /manifest.webmanifest /icon /opengraph-image; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code} %{content_type}' http://127.0.0.1:3000$p)"
done
```

**预期**：全部 200，内容类型分别是 `application/xml`、`text/plain`、
`application/manifest+json`、`image/png`、`image/png`。

### 实验 4：改 icon 看是否重新生成

把 `app/icon.tsx` 里的字母 `N` 改成 `S`，重新 `pnpm build && pnpm start`，
访问 `/icon` —— 图片变成 S。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| `viewport` 塞进 `metadata` | 不生效 | Next 14+ 必须单独导出 |
| `generateMetadata` 忘了 `await params` | 静默 NaN | params 是 Promise |
| `openGraph` 少写 `title` | 分享卡片标题为空 | 每个平台字段都写全 |
| `sitemap.ts` 忘了 return | 构建报错 | 必须 return 数组 |
| `ImageResponse` 用复杂 CSS | 渲染失败 | Satori 只支持部分 CSS |

---

## 六、自检

1. `metadata` / `generateMetadata` / `viewport` 各自负责什么？
2. `title` 的 `template` 是干什么的？
3. 六个 SEO 约定文件分别产出什么？
4. `generateMetadata` 里的 `params` 需要 `await` 吗？

---

## 七、小结 & 下一步

- 静态元信息用 `metadata`，动态用 `generateMetadata`，视口用 `viewport`。
- `sitemap` / `robots` / `manifest` / `icon` / `opengraph-image` 都是约定文件，构建期产出。

**下一课** → [第 21 课 · 客户端导航与 Hooks](21_客户端导航与Hooks.md)
