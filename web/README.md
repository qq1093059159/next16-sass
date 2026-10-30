# 内容引擎基座（content-engine-base）

> 文章站 / 博客站 / 文档站的内容层 —— 把 `.md` / `.mdx` 丢进 `content/` 即成文章。
>
> 这是 `next16-sass` 仓库的**第十一章基座的独立实例**，用于证明「5 分钟移植」真的成立：
> 本目录没有从主仓库继承任何运行时配置，它是一个自包含的 Next.js 16 项目。

## 快速开始

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

## 目录结构

```text
web/
├─ app/
│  ├─ layout.tsx                 根布局（RSS 自动发现写在这里）
│  ├─ globals.css                Tailwind v4 + typography 插件
│  ├─ page.tsx                   首页
│  ├─ posts/
│  │  ├─ page.tsx                文章列表
│  │  ├─ [...slug]/page.tsx      文章详情（catch-all，支持多级路径）
│  │  └─ page/[n]/page.tsx       分页
│  ├─ category/[...category]/     分类页（多级 + 面包屑）
│  ├─ tags/page.tsx              标签索引
│  ├─ tags/[tag]/page.tsx        单标签页
│  ├─ search/page.tsx            搜索页
│  ├─ search/SearchClient.tsx    搜索交互（客户端）
│  └─ rss.xml/route.ts           RSS 2.0
├─ lib/
│  ├─ posts.ts                   ★ 核心：扫描 / 元数据 / 分类树 / 草稿 / 分页
│  ├─ search.ts                  构建期搜索索引
│  └─ site.ts                    站点常量
├─ components/mdx/Callout.tsx    自定义 MDX 组件
├─ mdx-components.tsx            MDX 组件映射表
└─ content/                      ← ★ 你的文章放这里
   ├─ hello.mdx
   └─ tech/
      ├─ _meta.json              分类名与描述
      └─ ssg-and-isr.mdx
```

## 写文章

在 `content/` 下新建 `.md` 或 `.mdx`，用 YAML frontmatter 声明元数据：

```md
---
title: "标题"
date: "2026-11-03"
excerpt: "摘要（会显示在列表页）"
tags: ["标签一", "标签二"]
draft: false
---

# 正文

支持 **Markdown** 与 JSX。
```

- 放进 `content/tech/` 就归到「技术」分类 → `/category/tech`
- `draft: true` 的文章不会生成路由、不进列表/RSS/标签
- `.md` 文件不支持 JSX（但 YAML frontmatter 两者都支持）

## 可用的路由

| 路径 | 说明 |
|---|---|
| `/` | 首页 |
| `/posts` | 文章列表（分类 / 标签导航 + 搜索框） |
| `/posts/<slug>` | 文章详情（`slug` 可含多段，如 `/posts/tech/ssg-and-isr`） |
| `/posts/page/2` | 分页 |
| `/category/<name>` | 分类页（可多级，如 `/category/tech/sub`） |
| `/tags` · `/tags/<tag>` | 标签页 |
| `/archive` | **归档页**（按年月分组） |
| `/author/<name>` | **作者页**（作者来自 frontmatter） |
| `/llms.txt` | **给 AI 爬虫的站点摘要**（Markdown） |
| `/search` | 全文搜索（中文子串匹配 + Fuse.js 英文容错），支持 `?q=` 分享 |
| `/og/<slug>` | **文章级动态 OG 图**（1200×630 PNG） |
| `/rss.xml` | RSS 2.0 订阅源 |
| `/sitemap.xml` · `/robots.txt` | SEO 约定文件 |

## 它自带了什么

### SEO

| 能力 | 实现 |
|---|---|
| JSON-LD 结构化数据 | `WebSite`（含 SearchAction）+ `BlogPosting` + `BreadcrumbList` |
| 文章级动态 OG 图 | `/og/<slug>` 按标题/摘要/分类生成 PNG |
| canonical | 每篇文章声明 `alternates.canonical` |
| Open Graph / Twitter | `article` 类型 + `summary_large_image` |
| sitemap | 含全部文章 + 静态页，`lastModified` 跟着 `updated` 走 |
| robots.txt | 默认允许，屏蔽 `/search`；对 GPTBot / ClaudeBot 明确放开 |
| 语义化 HTML | `<article>` / `<time>` / `<nav aria-label="面包屑">` |
| llms.txt | 站点导航 + 全部文章的 Markdown 摘要（AI 爬虫友好） |

### 阅读体验

| 能力 | 实现 |
|---|---|
| 目录（TOC） | 构建期从 Markdown 解析，锚点与正文标题**完全一致**（用同一个 github-slugger） |
| 滚动高亮 | IntersectionObserver，当前章节在右侧目录高亮 |
| 阅读时长 | 中英加权公式（中文 350 字/分、英文 220 词/分），不是简单的「词数/200」 |
| 相关文章 | 按**共同标签数**排序，比「同分类」更精准 |
| 上一篇 / 下一篇 | 按日期排序取相邻，首篇无上一篇、末篇无下一篇 |
| 搜索快捷键 | `/` 聚焦搜索框、`⌘K`/`Ctrl+K` 跳搜索页、`Esc` 清空 |
| 代码块复制 | 客户端注入按钮，无 JS 时降级为纯代码块 |
| 最后编辑时间 | Git 时间兜底 + 相对时间（客户端计算，SEO 用绝对日期） |
| 作者页 | `/author/<name>`，作者来自 frontmatter `author` |
| 代码高亮 | Shiki，编译期完成，零运行时开销 |
| 标题锚点 | `rehype-slug` 自动生成 id |

### 内容组织

| 能力 | 实现 |
|---|---|
| 多级分类 | 目录即分类，分类页 catch-all + 面包屑 + 子分类导航 |
| 标签 | frontmatter `tags` → `/tags/<tag>`，中文标签正常（自动 decode） |
| 草稿 | `draft: true` → 不生成路由、不进列表 / RSS / 标签页 |
| 归档 | `/archive` 按年月分组全部文章 |
| 分类元数据 | 分类目录下的 `_meta.json`（名称 + 描述） |

## 改成你自己的站

1. `lib/site.ts` —— 改 `SITE_NAME` / `SITE_DESCRIPTION`；
   `SITE_URL` 建议用环境变量 `NEXT_PUBLIC_SITE_URL` 注入
2. `app/globals.css` —— 改主题色变量（`--color-*`）
3. `content/` —— 删掉示例文章，换成你自己的
4. 路由前缀（`/posts` → `/blog` 等）—— 改目录名 + 页面里的 `href`

## 环境要求

- Node.js ≥ 20.9
- Next.js 16（用 Turbopack）

## 从这里开始改

1. `lib/site.ts` —— 站点名 / 描述 / URL（`NEXT_PUBLIC_SITE_URL` 可覆盖）
2. `app/globals.css` —— 主题色变量（`--color-*`）
3. `content/` —— 换成你的文章
4. 路由前缀（`/posts` → `/blog`）—— 改目录名 + 页面里的 `href`
