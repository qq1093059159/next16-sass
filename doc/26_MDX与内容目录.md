# 第 26 课 · MDX 与内容目录（目录即内容源）

> **学习目标**：搞清 `@next/mdx` 到底做了什么（以及**没**做什么），并亲手实现一套「把 md 文件丢进目录就成文章」的博客。
> **对应代码**：`next.config.ts`、`mdx-components.tsx`、`components/mdx/Callout.tsx`、`lib/posts.ts`、`app/posts/`、`content/`
> **预计耗时**：45 分钟
> **前置知识**：第 02 课（约定文件）、第 04 课（动态路由）、第 20 课（SEO 约定文件）
> **说明**：这是**扩展课**，选学。想做博客 / 文档站 / CMS 时再回来读。

---

## 一、先把概念掰清楚

很多资料说「用了 `@next/mdx` 就能写博客，放个 `.md` 文件到目录里就会自动变成文章」。
这句话**对了一半**，而且那一半很重要。

### 1.1 `@next/mdx` 真正做的事

它是一个**编译期 loader**：

```text
app/posts/hello.mdx
        │
        │ ① @next/mdx 的 loader 把 .mdx 编译成 React 组件
        ▼
   一个普通的 React 组件
        │
        │ ② pageExtensions 里加了 "mdx"，Next 把它当页面文件
        ▼
   路由：/posts/hello
```

**结论：它遵循「一个文件 = 一个路由」。**
你把 `hello.mdx` 放进 `app/posts/`，它就**自动**有了 `/posts/hello` 这个路由 —— 不需要你写任何路由配置。

### 1.2 它**不**做的事

| 做不到 | 为什么 |
|---|---|
| 扫描任意目录生成列表 | 它是 loader，不是「内容源管理器」 |
| 解析 YAML frontmatter | 需要额外的 remark 插件 |
| 让文章放在 `app/` 之外 | 文件式路由只在 `app/` 下生效 |

**所以「放个 md 进目录就自动成文章」这句话，准确的说法是**：

> 放进 `app/` 下的**路由目录**里 → 自动成**路由**；
> 但**列表页**、**任意目录**、**frontmatter** 这三件事，仍然要你自己补。

### 1.3 本课要做的事

在 `app/posts/` 补一套完整的「目录即内容源」：

```text
content/                    ← 你放文章的目录（不在 app/ 下！）
├─ hello.mdx                ← 支持 JSX
├─ tech/                    ← 子目录 = 分类（零配置）
│  ├─ _meta.json            ←   分类名与描述
│  └─ nested-post.mdx       ←   /posts/tech/nested-post
└─ life/
   ├─ reading-notes.md       ← 纯 Markdown
   └─ reading-notes.json     ←   .md 的元数据走这里（旁路）

lib/posts.ts                ← 递归扫描目录 + 动态 import
app/posts/
├─ page.tsx                 ← 列表页（自动生成 + 分类导航）
└─ [...slug]/page.tsx       ← 详情页（catch-all，支持多段路径）
app/category/[category]/    ← 分类页（分类由目录名自动推导）
```

---

## 二、两种模式对比

| | 模式 A：`@next/mdx` 文件式路由 | 模式 B：动态路由 + 目录扫描 |
|---|---|---|
| 文章放哪 | 必须在 `app/` 的路由目录里 | 任意目录（`content/`） |
| URL | 由文件所在目录决定 | 由你写代码决定 |
| 列表页 | 要自己写 | 自动扫描生成 |
| 加一篇文章 | 放进目录 + rebuild | 放进目录 + rebuild |
| 适合 | 少量、结构化的长文页 | 博客 / 文档站 / 内容多的站点 |

本仓库两种都留着：
- **模式 A 的例子**：`app/mdx-page/page.mdx` → `/mdx-page`
- **模式 B 的例子**：`content/` + `app/posts/` → `/posts`

---

## 三、模式 B 的三个关键点

### 3.1 开启 MDX（`next.config.ts`）

```ts
import createMDX from '@next/mdx'
const withMDX = createMDX({
    extension: /\.(md|mdx)$/,   // 默认只支持 .mdx；这里连 .md 一起支持
});
// ...
export default withMDX(nextConfig);
```

```ts
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
```

两个都要：
- `extension` —— 决定 loader 处理哪些扩展名（默认只有 `.mdx`）
- `pageExtensions` —— 决定 Next 把哪些扩展名当页面文件

### 3.2 扫描目录（`lib/posts.ts`）

```ts
const POSTS_DIR = path.join(process.cwd(), "content");
const POST_EXT = /\.(md|mdx)$/;

export type PostFile = {
  /** URL 用的短名（文件名去掉扩展名） */
  slug: string;
  /** 磁盘上的完整文件名（含扩展名），动态 import 时用它当 key */
  file: string;
};

export function getPostFiles(): PostFile[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const all = fs
    .readdirSync(POSTS_DIR, { recursive: true })          // ← 递归
    .filter((entry): entry is string => typeof entry === "string")
    .map((file) => file.split(path.sep).join("/"));        // ⚠️ Windows 反斜杠

  return all
    .filter((file) => POST_EXT.test(file))
    .filter((file) => !file.split("/").some((s) => s.startsWith("_")))  // 跳过 _meta.json
    .map((file) => {
      const slug = file.replace(POST_EXT, "");
      const parts = slug.split("/");
      return {
        slug,
        slugParts: parts,
        file,
        category: parts.length > 1 ? parts[0] : undefined,
        baseSlug: parts[parts.length - 1],
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
```

> **为什么 `slug` 和 `file` 要分开**？这是本课最大的坑，见 §4.1。

### 3.3 动态 import 渲染（`app/posts/[...slug]/page.tsx`）

```tsx
export function generateStaticParams() {
  // ⚠️ 必须是【数组】形式 —— catch-all 动态段的 params.slug 是 string[]
  return getPostFiles().map((p) => ({ slug: p.slugParts }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const entry = getPostFiles().find((p) => p.slug === slug.join("/"));
  if (!entry) {
    notFound();
  }

  const { default: Post } = await import(`@/content/${entry.file}`);
  const metadata = await getPostMeta(entry.slug);   // ⚠️ 走 getPostMeta，见 §5.2
  return <article>{/* … */}<Post /></article>;
}
```

`generateStaticParams()` 在**构建期**扫描目录，把每个文件变成一条具体路由。
运行时再用动态 import 取出文件内容渲染。

> **为什么是 `[...slug]` 而不是 `[slug]`？**
> `[slug]` 只匹配**一段**路径。`content/tech/post.mdx` 对应 `/posts/tech/post` 有**两段**，
> `[slug]` 匹配不上（会 404），必须用 catch-all `[...slug]`。

#### 「零配置」的准确承诺

实测验收（新建 `content/news/`，放 3 篇文章，**没写一行路由代码**）：

```bash
mkdir -p content/news
# 丢进 first-post.mdx / second-post.md / no-date-post.md
pnpm build
```

构建产物自动多出：

```text
├ ○ /category/news                 ← 分类页自动出现
│ ├ ○ /posts/news/first-post       ← 路由自动生成
│ ├ ○ /posts/news/second-post
│ └ ○ /posts/news/no-date-post
```

**✅ 自动完成的事**

| 事项 | 结果 |
|---|---|
| 路由生成 | 文件相对路径 → URL（`content/news/a.mdx` → `/posts/news/a`） |
| 分类页 | 子目录名 → `/category/<目录名>`，带文章计数 |
| 分类导航 | 列表页顶部自动生成分类徽标 + 计数 |
| 分类元数据 | `_meta.json` → 分类名与描述 |
| 元数据 | YAML frontmatter → `title` / `date` / `excerpt` / `tags` |
| 排序 | 按 `date` 倒序，**缺失 `date` 的自动沉底** |
| 渲染 | GFM 表格 / 删除线 / 任务列表 / Shiki 代码高亮 / 标题锚点 |
| SEO | `generateMetadata` 自动把 frontmatter 转成 `<title>` 等 |
| 静态化 | 每篇文章都是 `○ Static`（构建期预渲染） |

**⚠️ 三个使用约束**

1. **必须重新 build** —— 目录扫描发生在构建期（`generateStaticParams`）。
   开发时可用 `pnpm dev`（Turbopack 会增量重建），生产必须重新 `pnpm build`。
2. **`.md` 与 `.mdx` 能力不同** —— `.mdx` 可写 JSX 与自定义组件；`.md` 只有纯 Markdown
   （但 YAML frontmatter 两者都支持）。
3. **文件名即 slug** —— 建议用英文/拼音短名。中文文件名也能用（URL 会被百分号编码，
   实测 `<title>` 正常），但 URL 不够美观。

**❌ 还不具备的（要自己加）**

| 能力 | 说明 |
|---|---|
| 全文搜索 | 需要 Fuse.js / Orama / FlexSearch，或换 Fumadocs / Nextra |
| RSS / Atom | 需要 `app/rss.xml/route.ts` 遍历 content/ 生成 |
| 上一篇 / 下一篇 | 按 `date` 排序后取相邻元素 |
| 标签页 | `tags` 已在 frontmatter 里，但还没有 `/tags/<tag>` 页面 |
| 草稿 | 需要在 `getPostFiles()` 里过滤 `draft: true` |
| 分页 | 列表页目前一次渲染全部 |
| ~~多级分类~~ | ✅ 已支持 —— `getCategories()` 返回所有层级，路由用 catch-all |

### 3.4 分类页：分类由目录名自动推导（`app/category/[...category]/page.tsx`）

```tsx
export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.path.split("/") }));
}
```

> ⚠️ 这里也必须是 **catch-all**（`[...category]`）而不是 `[category]` ——
> `content/a/b/post.mdx` 会产生 `a` 与 `a/b` **两级**分类，
> `/category/a/b` 是两段路径，`[category]` 接不住。
> 同理 `getCategories()` 返回的是**所有层级**的分类节点（`CategoryNode`），
> 不是只有第一段。

分类的显示名与描述放在分类目录下的 `_meta.json`：

```json
{
  "name": "技术",
  "description": "Next.js / React 相关的深度笔记"
}
```

> 下划线开头的文件会被扫描器跳过（不当成文章），专供元数据使用。

---

## 四、⚠️ 四个实测踩到的坑

### 4.1 坑 1：动态 import 的 key 必须是「含扩展名的完整文件名」

**错误写法**：

```tsx
await import(`@/content/${slug}.mdx`)   // ❌ 写死了 .mdx
```

**报错**：

```text
Error: Cannot find module '@/content/pure-markdown.mdx'
Export encountered an error on /posts/[slug]: /posts/pure-markdown, exiting the build.
```

**原因**：动态 import 表达式会被打包器（Turbopack / webpack）编译成
「该目录下**所有匹配扩展名的文件**」的 context map，**key 是完整路径**。
写死 `.mdx` 就等于在 map 里只查 `.mdx` 那一类，`.md` 文件根本不在 map 里。

**正确写法**：

```tsx
await import(`@/content/${entry.file}`)  // ✅ entry.file = "hello.mdx" / "pure-markdown.md"
```

> 这也解释了为什么 `lib/posts.ts` 要同时返回 `slug` 和 `file`：
> `slug` 给 URL 用，`file` 给 import 用。

### 4.2 坑 2：用 `@/` 别名，别用相对路径

```tsx
await import(`../../../content/${slug}.mdx`)   // ❌ 相对深度随文件位置变化，极易算错
await import(`@/content/${entry.file}`)        // ✅ 稳定
```

实测踩过：列表页在 `app/posts/page.tsx`（到根是 `../../`），
详情页在 `app/posts/[slug]/page.tsx`（到根是 `../../../`）——
**同一个相对路径表达式在两个文件里指向不同位置**，其中一个直接构建失败。

### 4.3 坑 3：加文章后需要重新 build

目录扫描发生在**构建期**（`generateStaticParams` + 列表页的 `fs.readdirSync`），
所以产物里是静态页：

```text
├ ○ /posts
├   /posts/[slug]
│ ├ ◐ /posts/[slug]
│ ├ ○ /posts/hello
│ └ ○ /posts/pure-markdown
```

想要「加完文章立刻可见、不必 rebuild」，两条路：

| 做法 | 效果 | 代价 |
|---|---|---|
| `await connection()` | 变成动态渲染，每次请求都扫目录 | 首屏变慢 |
| `"use cache"` + `cacheTag("posts")` + `revalidateTag("posts")` | 静态 + 按需失效 | 多写一点代码 |

本仓库保持**纯静态**（博客最常见的形态）。

### 4.4 附带印证：不存在的文章返回 200 而不是 404

访问 <http://localhost:3000/posts/not-exist> —— 状态码是 **200**，不是 404。

原因和第 06 课讲的完全一致：`/posts/[slug]` 是 `◐` PPR 壳子，
响应一开始流式输出，状态码就锁定了 200，404 界面只是后续追加的内容。

> **这就是同一个坑的第二次出现。** 看到「页面显示 404 但状态码是 200」时，
> 先想「这条路由是不是 PPR 壳子」，而不是「`notFound()` 写错了」。

### 4.5 坑 4：Windows 的路径分隔符

```ts
fs.readdirSync(dir, { recursive: true })
// Windows 上返回： "tech\nested-post.mdx"   ← 反斜杠！
// Linux/macOS 上返回： "tech/nested-post.mdx"
```

反斜杠拼出来的 import key 与打包器生成的 context map 对不上：

```text
Error: Cannot find module '@/content/tech\nested-post.mdx'
```

**必须统一转成正斜杠**：

```ts
.map((file) => file.split(path.sep).join("/"))
```

> 这是个典型的「Windows 上开发、Linux 上构建」才暴露的坑 ——
> 跨平台项目里 `path.sep` 一定要处理。

---

## 五、元数据：三种写法

| 写法 | 生效范围 | 说明 |
|---|---|---|
| YAML frontmatter | `.md` ✅ `.mdx` ✅ | **推荐**。`---` 包裹，由 remark 插件链处理（见 §5.1） |
| `export const metadata = {...}` | 仅 `.mdx` ✅ | MDX 语法层能力，Next 原生识别，自动进 `<head>` |
| 同名 `.json` 旁路 | `.md` ✅ `.mdx` ✅ | 可选补充机制，适合放编译链读不到的字段 |

> ⚠️ **本节结论已修正。** 最初写的是「`.md` 不支持元数据，必须用 `.json` 旁路」——
> 那是在**还没配 remark 插件链**时的实测结论。配了插件链之后，
> **`.md` 和 `.mdx` 都能用 YAML frontmatter**，这才是业界主流做法。

### 5.1 YAML frontmatter（推荐写法）

```markdown
---
title: "第一篇文章：用 MDX 写博客"
date: "2026-10-30"
excerpt: "把写好的文件丢进 content/ 目录，它就变成了一篇文章。"
tags: ["Next.js", "MDX"]
---

# 正文从这里开始
```

**为什么 frontmatter 对 `.md` 也生效？** 因为它属于 **remark 插件层** ——
在 Markdown → AST 之前就把文件头部的 `---` 区块剥掉了，与文件是 `.md` 还是 `.mdx` 无关。

| 层次 | 能力 | `.md` | `.mdx` |
|---|---|---|---|
| **MDX 语法层** | JSX、ESM 导出 | ❌ | ✅ |
| **remark 插件层** | YAML frontmatter、GFM 表格 | ✅ | ✅ |

插件配置见 [§9 插件链](#九插件链让-markdown-真正像文档)。

### 5.2 三种来源的合并优先级

`lib/posts.ts` 的 `getPostMeta()` 负责合并：

```ts
meta = {
  ...((mod.frontmatter ?? {}) as Partial<PostMeta>),   // ① YAML frontmatter
  ...((mod.metadata ?? {}) as Partial<PostMeta>),      // ② 手写 export const metadata
};
// ③ .json 旁路再覆盖一层
if (entry.jsonFile) {
  meta = { ...meta, ...readJsonMeta(entry.jsonFile) };
}
```

优先级：**frontmatter → 手写 metadata → .json 旁路**。

> ⚠️ **详情页一定要走 `getPostMeta()`**，不要直接用 `import()` 出来的 `metadata` ——
> 后者拿不到 frontmatter（frontmatter 被编译成 `export const frontmatter`，
> 不是 `metadata`）。这是本轮实测修掉的一个 bug。

### 5.2 ⚠️ `.md` 文件不支持 `export const metadata` —— 必须用 `.json` 旁路

**实测结论**（本节最重要的坑）：

| 文件类型 | 走什么解析 | JSX | `export const metadata` |
|---|---|---|---|
| `.mdx` | 完整 MDX | ✅ | ✅ 生效 |
| `.md` | **纯 CommonMark** | ❌ 当成普通文本 | ❌ **被当正文渲染出来** |

实测现象：在 `.md` 文件里写

```md
export const metadata = { title: "读书笔记" };
```

页面上会**原样显示这行代码**，标题则退化成文件名。

> 原因：Next 对 `.md` 与 `.mdx` 用**不同的 loader 配置**（`format: 'md'` vs `'mdx'`），
> `.md` 不启用 MDX 语法。`@next/mdx` 的 `extension` 只控制「哪些文件走 loader」，
> 改不了「用哪种语法解析」。

**解法：同名 `.json` 旁路文件**。

```text
content/life/reading-notes.md      ← 正文（纯 Markdown）
content/life/reading-notes.json    ← 元数据
```

```json
{
  "title": "读书笔记：把复杂留给自己",
  "date": "2026-10-20",
  "excerpt": "一篇纯 Markdown 的文章，放在 life 分类里。",
  "tags": ["读书", "随笔"]
}
```

`lib/posts.ts` 里做合并（**旁路优先**）：

```ts
export async function getPostMeta(slug: string): Promise<PostMeta | null> {
  const entry = getPostFiles().find((p) => p.slug === slug);
  if (!entry) return null;

  let meta: Partial<PostMeta> = {};
  try {
    const mod = await import(`@/content/${entry.file}`);
    meta = (mod.metadata ?? {}) as Partial<PostMeta>;   // .mdx 的 ESM export
  } catch {
    // .md 文件走到这里很正常 —— 它没有 ESM export
  }

  if (entry.jsonFile) {
    meta = { ...meta, ...readJsonMeta(entry.jsonFile) }; // .json 旁路优先
  }

  return { title: entry.baseSlug, ...meta };
}
```

> ⚠️ **详情页一定要走 `getPostMeta()`**，不要直接用 `import()` 出来的 `metadata` ——
> 后者拿不到 `.json` 旁路（这是本轮实测修掉的一个 bug：
> `.md` 文章的标题一直退化成文件名）。

---

## 六、MDX 组件定制（`mdx-components.tsx`）

MDX 编译时会把文章里用到的**标签名**交给映射表：

```tsx
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";

const components: MDXComponents = {
  h1: (props) => <h1 className="mb-3 mt-8 text-2xl font-bold" {...props} />,
  h2: (props) => <h2 className="mb-2 mt-6 text-xl font-semibold" {...props} />,
  a: ({ href = "", children, ...props }) =>
    href.startsWith("/") ? (
      <a href={href} className="text-blue-600 underline underline-offset-4 dark:text-blue-400" {...props}>
        {children}
      </a>
    ) : (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline underline-offset-4 dark:text-blue-400"
        {...props}
      >
        {children}
      </a>
    ),
  Callout,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

映射表的三条规则：

| 情况 | 结果 |
|---|---|
| 映射表里**有**这个标签名 | 换成你的组件（下面把 `h1`/`a` 都接管了） |
| 映射表里**没有** | 渲染成原生 HTML 标签（`p` / `ul` / `code` 等） |
| 想用自定义组件 | 把组件名登记进映射表（见 `Callout`） |

### 文章里怎么用自定义组件

```mdx
<Callout type="info" title="这是自定义组件">
  文章作者不需要 import 任何东西。
</Callout>
```

`components/mdx/Callout.tsx`：

```tsx
export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warn" | "danger";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    info: "border-sky-300 bg-sky-50 dark:border-sky-700 dark:bg-sky-950",
    warn: "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950",
    danger: "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950",
  }[type];

  const label = { info: "提示", warn: "注意", danger: "警告" }[type];

  return (
    <div className={`my-4 rounded-lg border p-4 text-sm ${styles}`}>
      <p className="mb-1 font-semibold">{title ?? label}</p>
      <div className="[&>p]:m-0">{children}</div>
    </div>
  );
}
```

---

## 七、正文排版：`prose` 类需要先引插件

本仓库装了 `@tailwindcss/typography`，但 **Tailwind v4 里插件要用 `@plugin` 指令引入**
（v3 是写进 `tailwind.config.js`）：

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Tailwind v4 的插件用 @plugin 指令引入（v3 是写进 tailwind.config.js）。
   typography 插件提供 prose / prose-invert 等类，用来排版正文。 */
@plugin "@tailwindcss/typography";
```

然后文章容器用：

```tsx
<div className="prose prose-neutral dark:prose-invert mt-8 max-w-none leading-7">
```

| 类 | 作用 |
|---|---|
| `prose` | 排版基础（字号、行高、标题、列表、代码块…） |
| `prose-neutral` | 配色方案（neutral / gray / slate…） |
| `dark:prose-invert` | 暗黑模式下的反色配色 |
| `max-w-none` | 取消 prose 的默认最大宽度 |

---

## 八、动手实验

### 实验 1：丢一篇文章进去

新建 `content/my-first-post.mdx`：

```mdx
export const metadata = {
  title: "我的第一篇",
  date: "2026-10-30",
  excerpt: "随便写点什么。",
};

# 我的第一篇

正文内容。
```

```bash
pnpm build && pnpm start
```

**预期**：

- <http://localhost:3000/posts> 列表里多了一条「我的第一篇」
- <http://localhost:3000/posts/my-first-post> 能打开
- 构建产物里多一行 `○ /posts/my-first-post`

> ⚠️ **必须重新 build** —— 目录扫描发生在构建期（坑 3）。

### 实验 2：让 `.md` 也支持 JSX（失败演示）

把 `content/my-first-post.mdx` 改名为 `.md`，并在正文里写一行 JSX：

```markdown
<div className="text-red-500">这行会报错</div>
```

**预期**：构建失败 —— `.md` 文件不走 MDX 编译，JSX 无法解析。
这说明**`.md` 和 `.mdx` 是两种不同的文件格式**，虽然本仓库用同一个 loader 处理它们。

### 实验 3：体验自定义组件

在 `content/hello.mdx` 里加：

```mdx
<Callout type="danger" title="危险操作">
  随便写点内容。
</Callout>
```

**预期**：页面出现红色的「危险操作」提示框。
如果报「组件未找到」，检查 `mdx-components.tsx` 里有没有登记 `Callout`。

### 实验 4：亲手触发坑 1

把 `app/posts/[slug]/page.tsx` 里的

```tsx
const { default: Post, metadata } = await import(`@/content/${entry.file}`);
```

改成

```tsx
const { default: Post, metadata } = await import(`@/content/${slug}.mdx`);
```

```bash
pnpm build
```

**预期**：构建失败，报

```text
Error: Cannot find module '@/content/pure-markdown.mdx'
```

因为 `pure-markdown.md` 的 key 是 `.md`，而你在查 `.mdx`。
**改回来**。

### 实验 5：亲手触发坑 2

把两处 `@/content/` 都改成 `../../../content/`，然后 `pnpm build`。

**预期**：构建失败 —— 相对深度算错了。
**改回来**。

### 实验 6：新建一个分类

```bash
mkdir -p content/study
cat > content/study/_meta.json <<'EOF'
{ "name": "学习", "description": "课程与读书笔记" }
EOF
cat > content/study/typescript.mdx <<'EOF'
export const metadata = { title: "TypeScript 笔记", date: "2026-10-31" };

# TypeScript 笔记
EOF
pnpm build && pnpm start
```

**预期**：

- <http://localhost:3000/posts> 列表里出现分类徽标「study」
- <http://localhost:3000/category/study> 能打开，标题显示「学习」（来自 `_meta.json`）
- <http://localhost:3000/posts/study/typescript> 能打开

> **零配置**：没有写过任何路由配置，分类页是自动推导出来的。

### 实验 7：亲手触发坑 4（Windows 路径分隔符）

把 `lib/posts.ts` 里的

```ts
.map((file) => file.split(path.sep).join("/"))
```

改成

```ts
// .map((file) => file.split(path.sep).join("/"))
```

```bash
pnpm build
```

**预期**：构建失败，报

```text
Error: Cannot find module '@/content/tech\nested-post.mdx'
```

**改回来**。

### 实验 8：亲手触发「.md 不支持 ESM 导出」

在 `content/pure-markdown.md` 顶部加一行：

```md
export const metadata = { title: "会被当正文" };
```

```bash
pnpm build && pnpm start
```

**预期**：构建**通过**（不报错！），但页面上会**原样显示这行代码**，
标题仍是文件名。**把这一行删掉**，改用 `content/pure-markdown.json`。

### 实验 9：体验插件链

在 `content/gfm-test.md` 里写一张表格：

```markdown
| 特性 | 库 | 状态 |
|---|---|---|
| 表格 | remark-gfm | ✅ |
```

```bash
pnpm build && pnpm start
```

打开 <http://localhost:3000/posts/gfm-test>。

**预期**：表格渲染成真正的 `<table>`（源码里能看到 `<table>` 标签）。

**然后**：把 `next.config.ts` 里的 `'remark-gfm'` 删掉，重新 build。

**预期**：表格消失，变成一堆竖线文本 —— 这就是没有 remark-gfm 的样子。

### 实验 10：亲手触发 Turbopack 的序列化限制

把 `next.config.ts` 里的

```ts
'remark-gfm',
```

改成

```ts
remarkGfm,          // ← 传函数
```

并加上 `import remarkGfm from 'remark-gfm'`。

```bash
pnpm build
```

**预期**：构建失败，报

```text
Error: loader .../mdx-js-loader.js for match "{*,next-mdx-rule}" does not have
serializable options.
```

**改回字符串**。

### 实验 11：验证 PPR 的 404 状态码坑点（第二次出现）

```bash
curl -I http://127.0.0.1:3000/posts/not-exist
```

**预期**：**200 OK**（页面是 404 界面）。
原因见 §4.4 —— 和第 06 课是同一个坑。

---

## 九、插件链：让 Markdown 真正「像文档」

光能解析 Markdown 不够 —— 技术文档需要**表格、代码高亮、标题锚点、目录**。
这些全部由 **remark / rehype 插件链**（`unified` 生态）提供。

### 9.1 本仓库的完整配置

```ts
import createMDX from '@next/mdx'

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
    options: {
        remarkPlugins: [
            'remark-frontmatter',
            ['remark-mdx-frontmatter', { name: 'frontmatter' }],
            'remark-gfm',
        ],
        rehypePlugins: [
            'rehype-slug',
            ['rehype-pretty-code', {
                theme: { dark: 'github-dark', light: 'github-light' },
                defaultLang: 'plaintext',
            }],
        ],
    },
})
```

### 9.2 remark vs rehype 的分工

| | 处理什么 | 典型插件 |
|---|---|---|
| `remarkPlugins` | Markdown AST（还没变成 HTML） | `remark-gfm`、`remark-frontmatter`、`remark-math`、`remark-toc` |
| `rehypePlugins` | HTML AST（已经是 HTML 树） | `rehype-slug`、`rehype-pretty-code`、`rehype-katex`、`rehype-autolink-headings` |

### 9.3 技术文档站最常用的插件

| 插件 | 解决什么 |
|---|---|
| `remark-gfm` | 表格、删除线、任务列表、自动链接、脚注 —— **几乎必备** |
| `remark-frontmatter` + `remark-mdx-frontmatter` | YAML frontmatter |
| `rehype-slug` | 标题自动 `id`，用于锚点目录 / 锚点跳转 |
| `rehype-pretty-code`（Shiki） | 代码高亮，**编译期完成**，零运行时开销 |
| `rehype-autolink-headings` | 标题旁出现 `#` 锚点链接 |
| `remark-math` + `rehype-katex` | LaTeX 公式 |
| `reading-time` | 阅读时长估算（普通 JS 包，不是插件） |

### 9.4 ⚠️ Turbopack 的硬性限制：插件必须用字符串名

Next 16 默认用 Turbopack，它要求 loader 的 options **必须可序列化**。
插件是**函数** → 不可序列化 → 构建直接失败：

```text
Error: loader .../mdx-js-loader.js for match "{*,next-mdx-rule}" does not have
serializable options. Ensure that options passed are plain JavaScript objects and values.
```

**不能这样写**：

```ts
// ❌ 传函数 —— Turbopack 下直接构建失败
import remarkGfm from 'remark-gfm'
createMDX({ options: { remarkPlugins: [remarkGfm] } })
```

**必须用字符串包名**，选项保持纯 JSON：

```ts
// ✅
createMDX({
  options: {
    remarkPlugins: ['remark-gfm', ['remark-toc', { heading: '目录' }]],
    rehypePlugins: ['rehype-slug', ['rehype-katex', { strict: true }]],
  },
})
```

> 插件的**选项**也不能含回调函数（如 `{ transform(node) {...} }`）——
> 那种插件只能走 Webpack，或找 Rust（MDX-RS）兼容版本。

### 9.5 ⚠️ `remark-mdx-frontmatter` 的 name 不能填 `metadata`

看起来把 `name` 设成 `metadata` 很美（frontmatter 直接变成 Next 标准 metadata），
但这个插件会**无条件**注入一个导出 —— 即使文件里根本没有 frontmatter，
也会生成 `export const metadata = {}`，于是和手写的 `export const metadata` **撞名**：

```text
Variable name conflict: metadata
```

**正确做法**：`name: 'frontmatter'`，把合并优先级交给 JS 层控制（见 §5.2）。

### 9.6 另一条路：Rust 编译器（`experimental.mdxRs`）

```ts
const withMDX = createMDX({ experimental: { mdxRs: true } })
```

| | JS 插件链（`options`） | Rust 编译器（`mdxRs`） |
|---|---|---|
| 插件生态 | unified 全生态（几百个） | 只有 Rust 实现的插件 |
| 编译速度 | 较慢 | 很快 |
| 稳定性 | 稳定 | **官方标注实验性，不建议上生产** |
| 配置 | 字符串插件名 | `mdxType: 'gfm'` 等字段 |

本仓库走 **JS 插件链** —— 可组合性最好，生态最全。

### 9.7 效果验收

打开 <http://localhost:3000/posts/gfm-test>，应当看到：

- 表格渲染成真正的 `<table>`
- `~~删除线~~` 渲染成 `<del>`
- `- [x]` 渲染成 `task-list-item`
- 代码块有 Shiki 的 token 着色（`<span data-line>` + `--shiki-*` CSS 变量）
- 每个标题都有自动生成的 `id`（`这个三级标题应该有-id`）

---

## 十、博客标配四件套

把「能当博客底座」的最后四块拼图补齐。

### 10.1 RSS 订阅源（`app/rss.xml/route.ts`）

```tsx
export async function GET() {
  const posts = await getAllPostMeta();
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${SITE_DESCRIPTION}</description>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
```

**四个必须注意的点**：

| 点 | 说明 |
|---|---|
| `<link>` / `<guid>` 必须是**绝对 URL** | 订阅器要靠它去抓正文，相对路径无效 |
| `<pubDate>` 必须是 **RFC 822** 格式 | `new Date().toUTCString()`，**不是** ISO 8601 |
| XML 特殊字符必须转义 | `&` `<` `>` `"` `'` → `&amp;` `&lt;` … |
| `<atom:link rel="self">` | 让订阅器知道 feed 自己的地址 |

用 Route Handler（而不是静态文件）的好处：**内容变了 feed 自动跟着变**。

站点常量抽到 `lib/site.ts`，`sitemap.ts` / `robots.ts` / `rss.xml` 共用，
`SITE_URL` 支持 `NEXT_PUBLIC_SITE_URL` 环境变量覆盖。

### 10.2 标签页（`app/tags/`）

```tsx
// app/tags/[tag]/page.tsx
export async function generateStaticParams() {
  const tags = await getAllTags();
  // ⚠️ 动态段的值必须是【字符串】—— 取 tag.name，不是整个对象
  return tags.map((tag) => ({ tag: tag.name }));
}
```

- 标签来自 frontmatter 的 `tags` 字段
- **中文标签正常工作**：`/tags/性能` → 编码成 `/tags/%E6%80%A7%E8%83%BD`，
  Next 自动解码 `params.tag`
- `/tags` 索引页列出所有标签与文章数

> ⚠️ **踩过的坑**：一开始写成 `tags.map((tag) => ({ tag }))`，
> 构建直接报 `A required parameter (tag) was not provided as a string received object`。
> 动态段的值必须是字符串。

> 💡 `generateStaticParams` **可以是 async** —— 标签要读 frontmatter 才知道，
> 直接 `await getAllTags()` 即可，不需要另写一个同步版本。

### 10.3 上一篇 / 下一篇

```ts
export async function getAdjacentPosts(slug: string) {
  const posts = await getAllPostMeta();   // 按 date 倒序（新的在前）
  const index = posts.findIndex((p) => p.slug === slug);
  return {
    prev: toAdjacent(posts[index - 1]),   // 更新的那篇 = 上一篇
    next: toAdjacent(posts[index + 1]),   // 更旧的那篇 = 下一篇
  };
}
```

列表是**新 → 旧**，所以数组里**前**一个是「上一篇」、**后**一个是「下一篇」。
第一篇没有「上一篇」，最后一篇没有「下一篇」（渲染时留空）。

### 10.4 草稿机制

```md
---
title: "还在写：草稿示例"
draft: true
---
```

`draft: true` 的文章会被**完全排除**：

| 位置 | 效果 |
|---|---|
| 路由 | **不生成**（`prerender-manifest.json` 里没有它） |
| 文章列表页 | 不出现 |
| 标签页 | 不出现 |
| RSS | 不出现 |

```ts
export function isDraft(file: string): boolean {
  const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf-8"));
  return data.draft === true || data.draft === "true";
}

// 在扫描阶段就过滤掉
export function getPostFiles(): PostFile[] {
  return all.map(/* ... */).filter((p) => !isDraft(p.file)).sort(/* ... */);
}
```

> **为什么用 gray-matter 而不是 import 编译产物？**
> `isDraft()` 要在 `generateStaticParams` 里跑，import 每个 .mdx 会加载整个编译产物，慢得多。
> gray-matter 直接读文件头部解析 YAML，代价几乎为零。

**发布流程**：加 `draft: true` → 写完删掉 → `pnpm build` → 自动发布。

> ⚠️ 访问草稿 URL 会命中动态 fallback，返回 `notFound()` 界面，
> 但**状态码是 200** —— 这正是 [第 06 课](06_错误边界与404状态码.md) 讲的 PPR 坑点。
---

## 十一、多级分类、路径分页与全文搜索

最后三块拼图。

### 11.1 多级分类：先厘清「文件系统路由」在哪儿生效

> Next.js 的规则是「**目录结构 = URL 路径**」——
> `app/shop/[id]/page.tsx` 就是 `/shop/:id`。
>
> **但那套规则作用于「页面文件」。** 我们的架构里，
> 全部文章路由由**一个 catch-all 动态段**承担：`app/posts/[...slug]/page.tsx`。
>
> 那规则在哪一步生效？**在 `generateStaticParams`**：

```ts
// lib/posts.ts
slugParts: ["a", "b", "post"]        // content/a/b/post.mdx

// app/posts/[...slug]/page.tsx
export function generateStaticParams() {
  return getPostFiles().map((p) => ({ slug: p.slugParts }));   // ← 数组长度 = 路径深度
}
```

catch-all 会为数组的**每一段**都生成实际路径 → `/posts/a/b/post`。

> 💡 **实测结论**：把文件丢进 `content/a/b/` 立刻就生成了 `/posts/a/b/deep-post` ——
> **多级分类在路由层面本来就支持**，不需要任何额外配置。
>
> 真正缺的是**分类页本身**的层级能力 —— 之前 `getCategories()` 只取路径第一段，
> `/category/a/b` 根本不存在。

补齐方式：

```ts
export type CategoryNode = {
  path: string;        // "a/b"      完整路径
  name: string;        // "b"        最后一段
  depth: number;       // 1          层级深度（顶级为 0）
  parent?: string;     // "a"        父分类
  count: number;       // 直接挂在下面的文章数
  totalCount: number;  // 含所有子分类的文章总数
  children: string[];  // 子分类路径
};
```

分类页路由改 **catch-all**（`[category]` 只匹配一段）：

```tsx
export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.path.split("/") }));
}
```

| 分类 | 面包屑 | 子分类导航 | 文章范围 |
|---|---|---|---|
| `/category/a` | 首页 / a | `b · 1` | `content/a/**`（含子分类） |
| `/category/a/b` | 首页 / a / b | — | 只 `content/a/b/**` |

### 11.2 路径分页：`/posts/page/2`

| | 路径分页 | query 参数 |
|---|---|---|
| 渲染方式 | **静态生成** | 动态渲染（要 `await connection()`） |
| SEO | 每页独立 URL | 所有页共用一个 URL |
| 缓存 | 构建期定好 | 每次请求都算 |

```ts
export const POSTS_PER_PAGE = 6;

export async function getPostPage(page: number): Promise<PostPageInfo> {
  const all = await getAllPostMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / POSTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), totalPages);
  return { page: current, totalPages, total: all.length, /* ... */ };
}
```

> 💡 `generateStaticParams` **可以是 async** —— 总页数要读文章才知道，
> `await getPostPage(1)` 拿到 `totalPages` 精确生成，比「保守估计 50 页」好
> （不会生成一堆 404 路由）。另外从**第 2 页**开始 —— 第 1 页就是 `/posts`。

路由匹配不冲突：`/posts/page/2` 命中静态段更具体的 `app/posts/page/[n]/page.tsx`，
`/posts/tech/post` 命中 `app/posts/[...slug]/page.tsx`。

### 11.3 全文搜索：构建期索引 + 子串匹配 + Fuse.js

```ts
export async function buildSearchIndex(): Promise<SearchDoc[]> {
  const metas = await getAllPostMeta();
  const files = getPostFiles();
  return metas.map((meta) => {
    const entry = files.find((f) => f.slug === meta.slug)!;
    const raw = fs.readFileSync(path.join(POSTS_DIR, entry.file), "utf-8");
    const { content: body } = matter(raw);              // 剥掉 frontmatter
    return { ...meta, content: markdownToPlainText(body).slice(0, 800) };
  });
}
```

索引直接内联进 `/search` 页面传给客户端组件 —— **零额外请求，首屏就能搜**。

**中文搜索为什么不能只靠 Fuse.js？**

Fuse 的匹配算法是「位图 + 编辑距离」，而中文没有空格分词：

| 查询 | 正文 | Fuse 距离 | 子串匹配 |
|---|---|---|---|
| `缓存` | `缓存机制` | 大（中文按字符算距离） | ✅ 命中 |

所以是**两条腿走路**：

```ts
// ① 子串匹配（大小写不敏感）—— 中文 100% 可靠
const scoreOf = (doc: SearchDoc): number => {
  let score = 0;
  if (doc.title.toLowerCase().includes(q)) score += 100;
  if (doc.tags.some((t) => t.toLowerCase().includes(q))) score += 60;
  if (doc.excerpt.toLowerCase().includes(q)) score += 40;
  if (doc.content.toLowerCase().includes(q)) score += 20;
  return score;
};

// ② Fuse.js 模糊匹配 —— 英文容错（拼错一个字母也能搜到）
const byFuzzy = fuse.search(q).map((r) => ({ doc: r.item, score: 30 }));
```

> ⚠️ 索引体积随文章数线性增长（本仓库 12 篇 → 20KB）。
> 几百篇以后改成「构建期生成静态 JSON + 客户端按需 fetch」。
---

## 十二、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 动态 import 写死扩展名 | `.md` 文件找不到 | 传含扩展名的完整文件名 |
| 用相对路径做动态 import | 不同深度下指向不同位置 | 用 `@/` 别名 |
| 以为 YAML frontmatter 能用 | frontmatter 被当正文渲染 | 用 `export const metadata`，或加 remark 插件 |
| 忘了重新 build | 新文章不出现 | 目录扫描在构建期 |
| 在映射表里没登记自定义组件 | 报「组件未找到」 | 登记进 `mdx-components.tsx` |
| Tailwind v4 里找不到 `prose` 类 | 排版全乱 | `@plugin "@tailwindcss/typography"` |
| 期望不存在的 slug 返回 404 | 实际是 200 | PPR 壳子导致；要真 404 用 Route Handler 显式返回 |
| 分类目录里的文章不出现 | 扫描没递归 | `readdirSync(dir, { recursive: true })` |
| 分类文章 404 | 用了 `[slug]` | 换 `[...slug]`（catch-all），params.slug 改成 `string[]` |
| Windows 上构建报 `Cannot find module` | 路径是反斜杠 | `.split(path.sep).join("/")` |
| `.md` 文章标题显示成文件名 | 没配 remark 插件链，frontmatter 不生效 | 配 `remark-frontmatter` + `remark-mdx-frontmatter` |
| 表格没渲染成表格 | 缺 `remark-gfm` | 加 `'remark-gfm'` 到 remarkPlugins |
| 构建报 `does not have serializable options` | Turbopack 下传了插件函数 | 改用字符串包名 |
| 构建报 `Variable name conflict: metadata` | `remark-mdx-frontmatter` 的 name 填了 `metadata` | 改成 `frontmatter`，合并交给 JS 层 |

---

## 十三、自检

1. `@next/mdx` 到底做了什么？它**不**做哪三件事？
2. 动态 import 的 key 为什么必须是完整文件名？
3. 为什么列表页和详情页用相对路径会出问题？
4. YAML frontmatter 在 MDX 里默认能用吗？
5. 自定义组件（`<Callout>`）是怎么在文章里被识别到的？
6. `prose` 类为什么不生效？Tailwind v4 的插件怎么引？
7. 加一篇文章后为什么必须重新 build？
8. `/posts/not-exist` 返回 200 的原因是什么？
9. 分类是怎么来的？新建一个分类要写多少代码？
10. 为什么 `[slug]` 接不住 `content/tech/post.mdx`？
11. `.md` 文件的元数据该怎么给？为什么不能写在 `.md` 里？
12. Windows 上构建报 `Cannot find module` 是什么原因？
13. remark 和 rehype 分别处理什么阶段的 AST？
14. 为什么 Turbopack 下插件必须用字符串名？
15. `remark-mdx-frontmatter` 的 name 为什么不能填 `metadata`？
16. 为什么 YAML frontmatter 对 `.md` 也生效？

---

## 十四、小结 & 下一步

- `@next/mdx` 是**编译期 loader**，遵循「一个文件 = 一个路由」，**不做目录扫描**。
- 「目录即内容源」要自己补四件事：递归扫描 + 动态 import + 列表页 + 分类页。
- 动态 import 的四个要点：**完整文件名**、**`@/` 别名**、**构建期扫描**、**正斜杠**。
- 分类**零配置**：`content/<分类名>/` 就是分类，`_meta.json` 可加名称与描述。
- 元数据三条来源（优先级 frontmatter → 手写 metadata → `.json` 旁路），
  **YAML frontmatter 是主流写法**，`.md` / `.mdx` 通用。
- 组件定制走 `mdx-components.tsx`；正文排版记得 `@plugin "@tailwindcss/typography"`。
- **插件链**才是「像技术文档」的关键：remark-gfm（表格）+ rehype-slug（锚点）+
  rehype-pretty-code（Shiki 高亮），三者缺一不可。
- Turbopack 的硬限制：插件用**字符串包名**，选项用纯 JSON —— 这是 Next 官方文档的要求。
- 又一次撞见 PPR 的 404 状态码坑 —— **同一个坑在不同页面复现，说明它是框架级行为**。

**下一步** → 回到 [第 25 课 · 实测踩坑与学习路线](25_实测踩坑与学习路线.md) 做总复习，
或按 [README 第十一章](../README.md#十一mdx-与内容目录目录即内容源) 细看本章要点。
