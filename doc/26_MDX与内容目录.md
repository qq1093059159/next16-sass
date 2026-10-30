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

### 3.4 分类页：分类由目录名自动推导（`app/category/[category]/page.tsx`）

```tsx
export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.name }));
}
```

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

## 五、元数据：用 `export const metadata` 而不是 YAML frontmatter

`.mdx` 文件里可以写 ESM 导出，Next 会当成标准的 `metadata` 处理并自动写进 `<head>`：

```mdx
export const metadata = {
  title: "第一篇文章：用 MDX 写博客",
  date: "2026-10-30",
  excerpt: "把写好的 .mdx 文件丢进 content/ 目录，它就变成了一篇文章。",
};

# 你好，MDX

这是一篇放在 `content/` 目录下的文章。**它同时支持 Markdown 和 JSX**。
```

三种写法的取舍：

| 写法 | 支持情况 | 备注 |
|---|---|---|
| `export const metadata = {...}` | ✅ 仅 `.mdx` | Next 标准 metadata，自动进 `<head>`，类型安全 |
| YAML frontmatter（`---` 包裹） | ❌ 默认不支持 | 要自己加 remark 插件（如 `remark-frontmatter`） |
| 同名 `.json` 旁路 | ✅ `.md` 与 `.mdx` 通用 | 见 §5.2 |

> 补充：`generateMetadata` 也能在 MDX 里用 —— 它和 `metadata` 一样是 ESM 导出，
> Next 会把它当成动态 metadata 的来源。

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
<div className="prose prose-neutral dark:prose-invert mt-6 max-w-none leading-7">
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

### 实验 9：验证 PPR 的 404 状态码坑点（第二次出现）

```bash
curl -I http://127.0.0.1:3000/posts/not-exist
```

**预期**：**200 OK**（页面是 404 界面）。
原因见 §4.4 —— 和第 06 课是同一个坑。

---

## 九、常见错误

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
| `.md` 文章标题显示成文件名 | `.md` 不支持 ESM export | 改用同名 `.json` 旁路 |

---

## 十、自检

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

---

## 十一、小结 & 下一步

- `@next/mdx` 是**编译期 loader**，遵循「一个文件 = 一个路由」，**不做目录扫描**。
- 「目录即内容源」要自己补四件事：递归扫描 + 动态 import + 列表页 + 分类页。
- 动态 import 的四个要点：**完整文件名**、**`@/` 别名**、**构建期扫描**、**正斜杠**。
- 分类**零配置**：`content/<分类名>/` 就是分类，`_meta.json` 可加名称与描述。
- 元数据有两条来源：`.mdx` 用 `export const metadata`；`.md` 用同名 `.json` 旁路。
- 组件定制走 `mdx-components.tsx`；正文排版记得 `@plugin "@tailwindcss/typography"`。
- 又一次撞见 PPR 的 404 状态码坑 —— **同一个坑在不同页面复现，说明它是框架级行为**。

**下一步** → 回到 [第 25 课 · 实测踩坑与学习路线](25_实测踩坑与学习路线.md) 做总复习，
或按 [README 第十一章](../README.md#十一mdx-与内容目录目录即内容源) 细看本章要点。
