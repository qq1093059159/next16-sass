# next16-sass · Next.js 16 全栈实验室

> 一个把 **Next.js 16 App Router 全部核心机制跑一遍**的教学型仓库。
> 不是业务脚手架，而是一份**可点击验证的知识图谱** —— 每个目录就是一个知识点的最小可运行样本（Minimum Runnable Demo），并且大量样本被刻意做成**两两对照组**，让你亲手体会差异，而不是读文档想象。
>
> 技术底座：**Next.js 16.3.8 + React 19.3.0 + Tailwind CSS v4 + TypeScript 5**，并预置了 **AI SDK 6 / DeepSeek / Clerk** 的接线位。

---

## 项目速览（30 秒读完）

> **一句话**：一个把 Next.js 16 App Router 全部核心机制跑一遍的**教学型仓库** —— 每个目录就是一个知识点的最小可运行样本，大量样本被刻意做成**两两对照组**，让你亲手体会差异，而不是读文档想象。

| 维度 | 结论 |
|---|---|
| **是什么** | Next.js 16 特性地图 + 反模式对照表 + 实测踩坑清单 |
| **不是什么** | ❌ 生产级 SaaS 模板 ❌ 最佳实践范本（代码里多处标注「仅供演示」） |
| **技术底座** | Next.js 16.3.8 · React 19.3.0 · Tailwind v4 · TypeScript 5 · Turbopack |
| **规模** | 55 个路由目录 · 28 个知识点主题 · 62 个构建产物页面 |
| **启动** | `pnpm install && pnpm dev` → http://localhost:3000 |
| **总索引** | [`/knowledge`](http://localhost:3000/knowledge) —— 运行时知识点地图，9 大主题 50+ 条，全带跳转链接 |

**目录骨架**（到分组为止，细节见[第三章](#三路由全景地图)）：

```text
app/
├─ layout.tsx default.tsx loading.tsx not-found.tsx global-error.tsx globals.css
├─ (auth)/ (dashboard)/ (root)/        ← 三个路由组（不进 URL）
├─ @team/ @analytics/                  ← 两个平行路由 slot
├─ api/                                ← 13 个 Route Handler
├─ basic/ client/ serveronly/ mycache/ mysuspense/ myimage/ env/ mdx-page/
├─ slug/ slugs/                        ← 动态路由三兄弟
├─ (root)/ssg revalidate optimistic intercepting hooks after stream seo font knowledge
├─ sitemap.ts robots.ts manifest.ts icon.tsx opengraph-image.tsx instrumentation.ts
components/  lib/  context/  proxy.ts  mdx-components.tsx  api.http
```

**三层阅读路径**：

| 层级 | 怎么用 | 耗时 |
|---|---|---|
| 1. 摸底 | 本速览 + 上表 | 30 秒 |
| 2. 上手 | [第二章](#二5-分钟跑起来) 跑起来 → 点开 [`/knowledge`](http://localhost:3000/knowledge) 按知识点找代码 | 5 分钟 |
| 3. 系统学 | [第四章](#四核心知识点详解) 27 个主题逐个拆解 | 按需 |

---

## 目录导航

| 章节 | 内容 | 适合谁 |
|---|---|---|
| [项目速览](#项目速览30-秒读完) | 30 秒读完整个项目：定位 · 骨架 · 三层阅读路径 | 所有人 |
| [一、项目定位与技术栈](#一项目定位与技术栈) | 这仓库是什么、不是什么；依赖分层清单 | 所有人 |
| [二、5 分钟跑起来](#二5-分钟跑起来) | 环境要求、启动、环境变量、踩坑表 | 第一次 clone 的人 |
| [三、路由全景地图](#三路由全景地图) | 目录树 + URL 对照表 + 三个对照组 | 想快速知道「去哪看什么」 |
| [四、核心知识点详解](#四核心知识点详解) | **27 个主题**逐个拆解（**本文主体**） | 系统学习 App Router |
| [五、AI 能力专区](#五ai-能力专区ai-潮流达人视角) | AI SDK 6 / DeepSeek 接线现状与补全方案 | 想接 AI 的人 |
| [六、next.config.ts 逐项拆解](#六nextconfigts-逐项拆解) | 每个配置项在干什么 | 配置调优 |
| [七、架构师 Review：已知问题与 TODO](#七架构师-review已知问题与-todo) | 15 个真实缺陷清单（含已修复） | 想把它改造成生产基座 |
| [八、13 天学习路径](#八13-天学习路径) | 按依赖顺序排的学习路线图 | 新手 |
| [九、速查附录](#九速查附录) | 知识点覆盖清单 · 自测命令 · 版本号 · 调试技巧 | 日常查阅 |
| [**十、doc/ 教学文档**](#十doc-教学文档25-课体系) | **25 课教学拆解**：概念 + 真实代码 + 动手实验 + 自检 | 想系统跟着学 |
| [**十一、MDX 与内容目录**](#十一mdx-与内容目录目录即内容源) | 把 .md/.mdx 丢进 `content/` 即成文章；两种 MDX 模式的区别 | 想写博客/做 CMS |

---

## 一、项目定位与技术栈

### 1.1 它是什么

一个 **"路由约定实验田"**。仓库用 60+ 个路由目录，把 App Router 的每一条约定文件规则、每一种路由符号、每一层缓存策略都做成了可运行样本。

> **本文档是本仓库唯一的项目说明文档。** 早前另有一份 `项目分析.md`（2026-09-15 的静态快照），
> 其内容已被本文档完全覆盖且信息过时（如 Next 16.1.1、React 19.2.3、提及已移除的 mysql2 / next-auth），
> 本轮已合并删除。

### 1.2 它不是什么

明确边界，避免误用：

- ❌ **不是生产级 SaaS 模板** —— 路由守护写在 `useEffect`、鉴权采用 Clerk（备份未接线）+ Server Actions 双演示，均为教学便利让路
- ❌ **不是最佳实践范本** —— 代码中多处自带「仅供演示 非最佳实践」注释
- ✅ **是 Next.js 16 特性地图 + 反模式对照表** —— 连"坑"都给你准备好了，见[第七章](#七架构师-review已知问题与-todo)

### 1.3 技术栈全景

| 层 | 依赖 | 备注 |
|---|---|---|
| 运行时 | `next` 16.3.8 · `react` / `react-dom` 19.3.0 · `typescript` 5.9 | React Compiler 已开启 |
| 构建 | Turbopack（dev 默认）· SWC · `@tailwindcss/postcss` 4 | Tailwind v4 **无** `tailwind.config.js` |
| 样式 / UI | `tailwindcss` 4 · `tw-animate-css` · shadcn/ui(new-york/RSC) · `@radix-ui/react-*` · `cva` · `clsx` · `tailwind-merge` · `lucide-react` · `next-themes` | 暗黑模式基于 `next-themes` |
| 数据 / 校验 | `zod` 4.3 | `z.treeifyError` 是 Zod 4 新 API |
| 鉴权 | `@clerk/nextjs` 6.36 | ⚠️ 仅占位未接线，生产请换成熟方案 |
| AI | `ai` 6.0 · `@ai-sdk/react` 3 · `@ai-sdk/deepseek` 2 | ⚠️ `app/api/chat` 是 501 占位，见[第五章](#五ai-能力专区ai-潮流达人视角) |
| 内容 | `@next/mdx` · `@mdx-js/loader` · `@mdx-js/react` · `next-mdx-remote-client` | MDX 支持需在 `next.config.ts` 启用 |
| 监控 | `@vercel/analytics` · `@vercel/speed-insights` | 已在根 layout 挂载 |

### 1.4 三个值得注意的版本信号

| 信号 | 说明 |
|---|---|
| **Next 16 + React 19.3** | 踩在最前沿。`"use server"` / `useActionState` / `useOptimistic` / Cache Components / PPR 全部是一等公民 |
| **ESLint 9 Flat Config** | 用 `eslint.config.mjs` 而非 `.eslintrc`。Next 16 把 preset 拆成了 `core-web-vitals` 和 `typescript` 两个具名入口 |
| **Tailwind v4** | **没有 `tailwind.config.js`**。全部配置搬进 `app/globals.css`，见 [4.13](#413-样式体系tailwind-v4-css-first) |

---

## 二、5 分钟跑起来

### 2.1 环境要求

| 依赖 | 版本 | 必需性 |
|---|---|---|
| Node.js | ≥ 20.9（推荐 22 LTS） | ✅ 必需 |
| pnpm | ≥ 9 | ✅ 必需（仓库用 `pnpm-lock.yaml`） |
| DeepSeek API Key | — | ⚠️ 仅第五章 AI 功能需要 |

### 2.2 启动

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

其他脚本：

```bash
pnpm build        # 生产构建
pnpm build:prod   # cross-env DB_HOST=8.8.8.8 next build ← 演示构建期环境变量注入
pnpm start        # 启动生产服务
pnpm lint         # ESLint 检查
```

> **注意 `dev` 与 `build:prod` 的差异**：`pnpm dev` 注入 `DB_HOST=localhost`，`pnpm build:prod` 注入 `DB_HOST=8.8.8.8`。这两条脚本是配合 `/env` 页面演示**构建期内联 vs 运行时读取**的开关，别当成真实环境的配置手段（真实项目用 `.env.local`）。

### 2.3 环境变量样板

新建 `.env.local`（仓库未提供，自行创建）：

```bash
# ── Clerk（当前未接线，仅占位路由） ──────────────────
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
# CLERK_SECRET_KEY=""

# ── AI ──────────────────────────────────────────────
DEEPSEEK_API_KEY=""
```

> ⚠️ **安全提醒**：只有 **`NEXT_PUBLIC_` 前缀**的变量会被打进浏览器包。密钥类变量（API Key、DB 密码、`AUTH_SECRET`）**绝不能**加这个前缀。同时请确认 `.gitignore` 已经忽略 `.env*.local`。



### 2.5 已知启动坑

| 现象 | 原因 | 解决 |
|---|---|---|
| Turbopack 改文件后嵌套路由偶发 404 | dev 期文件系统缓存错乱 | **先停 `dev`**，再 `rm -rf .next`，重启。**切勿在 dev 运行时删 `.next`** |
| 访问 `/mdx-page` 404 | `next.config.ts` 的 `pageExtensions` 被注释 | 取消注释启用 MDX loader，见 [4.15](#415-mdx把内容变成一等公民) |
| 构建期报 `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents` | 开启了 Cache Components 后，段级 `dynamic` / `revalidate` / `dynamicParams` 全部禁用 | 改用 `await connection()` 与 `"use cache"` + `cacheLife()`，见 [4.16](#416-cache-components把-use-cache-真正跑起来-) |
| 构建期报 `useSearchParams() should be wrapped in a suspense boundary` | 静态预渲染页面里直接用了 `useSearchParams` | 用 `<Suspense>` 包住该客户端组件，见 [4.23](#423-导航-hooks-与-metadata) |


---

## 三、路由全景地图

### 3.1 目录树（剔除 `node_modules` / `.next`）

```text
next16-sass/
├── app/
│   ├── layout.tsx              ← 根布局，同时接收 @team/@analytics 两个 slot
│   ├── default.tsx             ← 平行路由兜底
│   ├── loading.tsx             ← 全局 Suspense 边界
│   ├── not-found.tsx           ← 404
│   ├── global-error.tsx        ← 全局错误边界（会替换根 layout）
│   ├── globals.css             ← Tailwind v4 CSS-first 配置 ★
│   │
│   ├── (auth)/                 ← 路由组：登录演示（不进 URL）
│   │   ├── mylogin/            · 传统 fetch('/api/login') + router.push
│   │   ├── serverlogin/        · Server Action + FormData + .bind()
│   │   └── serverzodlogin/     · useActionState + Zod 校验 ★最推荐
│   │
│   ├── (dashboard)/dashboard/  ← 路由组：后台（不进 URL）
│   │   ├── layout.tsx          · 嵌套布局
│   │   ├── analytics/          · 普通路由（≠ @analytics slot！）
│   │   └── users/[id]/         · 动态路由 + generateMetadata
│   │
│   ├── (root)/                 ← 路由组：主站（接管根路径 /）
│   │   ├── layout.tsx          · 挂载 Navbar
│   │   ├── page.tsx            · 首页：Link / useRouter / Script 全家桶
│   │   ├── error.tsx           · 段级错误边界
│   │   ├── home/               · useEffect 客户端守卫（反模式）
│   │   ├── about/ albums/ books/ sign-in/[[...sign-in]]/
│   │   ├── ssg/[id]/           · generateStaticParams + ISR + cacheTag
│   │   ├── posts/              · 「目录即内容源」：列表页 + [slug] 详情页
│   │   ├── revalidate/         · revalidatePath / revalidateTag / updateTag / refresh
│   │   ├── optimistic/         · useOptimistic + useFormStatus（React 19）
│   │   ├── intercepting/       · 拦截路由 @modal/(.)photo/[id] ★
│   │   ├── hooks/              · usePathname / useSearchParams / useSelectedLayoutSegment(s)
│   │   ├── after/              · after() 响应后任务
│   │   ├── stream/             · SSE 客户端消费（ReadableStream）
│   │   ├── seo/                · metadata / viewport 完整字段
│   │   ├── font/               · next/font 字体优化
│   │   ├── knowledge/          · ★ 知识点地图（全仓库索引）
│   │   └── notfound/ notfound-dynamic/ · 404 状态码对照实验
│   │
│   ├── @team/ @analytics/      ← 平行路由 slot（page 与 default 必须成对）
│   │
│   ├── api/                    ← 13 个 Route Handler
│   │   ├── db.ts               · 内存假数据（模块级数组）
│   │   ├── books/ user/ login/ · 基础 CRUD + cookies 读写
│   │   ├── stream/             · SSE 流式响应
│   │   ├── cors/               · OPTIONS 预检 + 动态 Origin
│   │   ├── redirect/           · redirect vs rewrite
│   │   ├── cookies/            · response.cookies + maxDuration
│   │   ├── notfound/           · 显式返回 404（状态码可控）
│   │   └── chat/ register/     · ⚠️ 501 占位，待接线（见第五章）
│   │
│   ├── basic/                  ← 约定文件实验室
│   │   ├── layout.tsx          · 状态保持（切路由不重置）
│   │   ├── template.tsx        · 状态归零（切路由重挂载）★对照组
│   │   ├── loading.tsx  error.tsx
│   │   └── a/  b/              · a 慢 5s 触发 loading；b 立即返回
│   │
│   ├── client/                 · "use client" 执行时机实验
│   ├── serveronly/             · server-only 编译期约束
│   ├── mycache/                · Cache Components 对照：use cache ↔ connection() ★
│   ├── mysuspense/             · connection() + Suspense 流式
│   ├── myimage/                · next/image 三形态 + sizes
│   ├── env/                    · 环境变量可见性
│   ├── mdx-page/page.mdx       · MDX 即页面
│   ├── slug/[id]/              · 单段动态路由
│   ├── slug/[...id]/           · catch-all
│   ├── slugs/[[...id]]/        · 可选 catch-all
│   │
│   ├── sitemap.ts robots.ts manifest.ts icon.tsx opengraph-image.tsx
│   └── instrumentation.ts      · register() + onRequestError()
├── content/                    · 文章源目录（.md / .mdx），放进去即成文章
├── components/
│   ├── DarkMode.tsx            · next-themes + shadcn Dropdown
│   ├── mdx/Callout.tsx         · MDX 自定义组件（提示/注意/警告）
│   ├── navigation/navbar/      · 服务端壳包客户端岛 ★最佳实践形态
│   └── ui/                     · shadcn: button / input / dropdown-menu
├── lib/
│   ├── posts.ts                · 扫描 content/ 目录 + 动态 import 文章
│   ├── actions.ts              · 'use server'：Zod 登录校验
│   ├── revalidate-actions.ts   · 'use server'：按需失效四件套
│   ├── optimistic-actions.ts   · 'use server'：乐观更新的慢接口
│   ├── knowledge-map.ts        · 知识点地图数据源
│   └── utils.ts                · cn() = clsx + tailwind-merge
├── context/Theme.tsx           · next-themes Provider 二次封装
├── proxy.ts                    ← Next 16 新命名（原 middleware.ts）★
├── mdx-components.tsx          · MDX 全局组件映射约定
└── api.http                    · REST Client 调试草稿
```

### 3.2 URL 路由对照表

| URL | 文件 | 演示的知识点 |
|---|---|---|
| `/` | `(root)/page.tsx` | Link / useRouter / Script 全家桶 |
| `/about` | `(root)/about/page.tsx` | 最简服务端组件 + error 触发 |
| `/albums` | `(root)/albums/page.tsx` | async RSC 直接 fetch，请求发生在服务端 |
| `/books` | `(root)/books/page.tsx` | RSC → Route Handler 内部调用 |
| `/home` | `(root)/home/page.tsx` | useEffect 守卫（**反模式**，见[第七章 #4](#七架构师-review已知问题与-todo)） |
| `/sign-in/*` | `(root)/sign-in/[[...sign-in]]` | 可选 catch-all |
| `/mylogin` | `(auth)/mylogin` | 传统 fetch + router.push |
| `/serverlogin` | `(auth)/serverlogin` | Server Action + FormData + `.bind()` |
| `/serverzodlogin` | `(auth)/serverzodlogin` | `useActionState` + Zod ★推荐写法 |
| `/dashboard/users` `/dashboard/analytics` | `(dashboard)/dashboard/...` | 路由组 + 嵌套布局（⚠️ `/dashboard` 本身没有 `page.tsx`，访问是 404） |
| `/dashboard/users/1` | `(dashboard)/.../users/[id]` | 动态路由 + generateMetadata |
| `/basic/a` `/basic/b` | `basic/a` `basic/b` | loading 边界 + layout/template 状态对比 |
| `/client` `/serveronly` | 同名目录 | RSC 与 Client 边界对照 |
| `/mycache` | `mycache/page.tsx` | 缓存四手段全陈列 |
| `/mysuspense` | `mysuspense/page.tsx` | Suspense 流式最小范式 |
| `/myimage` | `myimage/page.tsx` | next/image + sizes 响应式 |
| `/env` | `env/page.tsx` | `process.env` 服务端可见性 |
| `/mdx-page` | `mdx-page/page.mdx` | MDX 即路由页面 |
| `/slug/foo` | `slug/[id]` | 单段动态路由 |
| `/slug/a/b` | `slug/[...id]` | catch-all |
| `/slugs` `/slugs/a/b` | `slugs/[[...id]]` | 可选 catch-all |
| `/api/*` | `api/*/route.ts` | Route Handlers |
| `/knowledge` | `(root)/knowledge/page.tsx` | **知识点地图（全仓库索引）** |
| `/mycache` | `mycache/page.tsx` | Cache Components 对照：`use cache` ↔ `connection()` |
| `/ssg` `/ssg/1` | `(root)/ssg/[id]/page.tsx` | generateStaticParams + ISR |
| `/posts` `/posts/<slug>` | `posts/page.tsx`、`posts/[slug]/page.tsx` | **MDX 博客**：目录即内容源 |
| `/revalidate` | `(root)/revalidate/page.tsx` | revalidatePath / revalidateTag / updateTag / refresh |
| `/optimistic` | `(root)/optimistic/page.tsx` | useOptimistic + useFormStatus |
| `/intercepting` | `(root)/intercepting/**` | 拦截路由：软导航弹窗 / 硬导航全屏 |
| `/hooks` | `(root)/hooks/page.tsx` | usePathname / useSearchParams / useSelectedLayoutSegment(s) |
| `/after` | `(root)/after/page.tsx` | after() 响应后任务 |
| `/stream` | `(root)/stream/page.tsx` | SSE 流式响应消费端 |
| `/seo` | `(root)/seo/page.tsx` | metadata / viewport 完整字段 |
| `/font` | `(root)/font/page.tsx` | next/font 字体优化 |
| `/notfound` `/notfound-dynamic` | `(root)/notfound*/page.tsx` | **notFound() 状态码对照实验** |
| `/sitemap.xml` `/robots.txt` `/manifest.webmanifest` | `app/sitemap.ts` 等 | SEO 约定文件 |
| `/icon` `/opengraph-image` | `app/icon.tsx` 等 | 动态生成 PNG |
| `/api/cors` `/api/redirect` `/api/cookies` `/api/stream` `/api/notfound` | `app/api/*/route.ts` | CORS / redirect+rewrite / Cookie / SSE / 显式 404 |

### 3.3 三个刻意为之的「对照组」

这是本仓库教学设计的精髓 —— **把两份几乎相同的代码并排放，让你亲眼看出差异**：

| 对照组 | A 面 | B 面 | 亲眼可见的差异 |
|---|---|---|---|
| **状态存活** | `basic/layout.tsx` | `basic/template.tsx` | 同样一个 `useState` 计数器，在 `/basic/a` ↔ `/basic/b` 间跳转：**layout 的计数保留，template 的归零** |
| **代码在哪跑** | `client/page.tsx` | `serveronly/page.tsx` | client 里能用 `document`/`window`；serveronly 里 `import "server-only"` 一旦被客户端组件引用，构建即失败 —— 把不该跨边界的东西锁死在服务端 |
| **表单提交** | `mylogin`（fetch + useState + router.push） | `serverzodlogin`（useActionState + Server Action） | 后者少写约 80% 样板代码，`isPending` 白送，且**一行 API 路由都不用写** |

---

## 四、核心知识点详解

### 4.1 App Router 约定文件七件套

Next.js 靠**文件名约定**（而非配置）驱动渲染。仓库把这七个约定文件全用了一遍：

| 文件 | 作用 | 本仓库位置 | 硬性规则 |
|---|---|---|---|
| `layout.tsx` | 布局外壳，**不随导航重挂载** | `app/layout.tsx`、`app/(dashboard)/dashboard/layout.tsx`、`app/basic/layout.tsx` | 根 layout **必须**含 `<html><body>` |
| `template.tsx` | 布局外壳，**每次导航重新挂载** | `app/basic/template.tsx` | 与 layout 只差这一点 |
| `page.tsx` | 路由页面本体 | 到处都是 | 一个目录只能有一个；只有 `page` 才对外可见 |
| `loading.tsx` | Suspense 边界 | `app/loading.tsx`、`app/basic/loading.tsx` | 自动包 `<Suspense fallback>` |
| `error.tsx` | 段级错误边界 | `app/(root)/error.tsx`、`app/basic/error.tsx` | **必须是 `"use client"`**，且要接 `error` / `reset` |
| `global-error.tsx` | 全局错误边界 | `app/global-error.tsx` | 会**替换根 layout**，须自己输出 `<html><body>` |
| `not-found.tsx` | 404 | `app/not-found.tsx` | 由 `notFound()` 或未匹配路由触发 |

> **`default.tsx` 是第八件**（平行路由专属），见 [4.2](#42-路由组-vs-平行路由本项目最容易混淆的两个概念)。

**渲染嵌套顺序**（以 `/basic/a` 为例）：

```text
app/layout.tsx
  └─ app/loading.tsx (外层 Suspense 边界)
       └─ basic/layout.tsx
            └─ basic/template.tsx
                 └─ basic/loading.tsx (内层 Suspense)
                      └─ basic/error.tsx (错误边界)
                           └─ basic/a/page.tsx
```

### 4.2 路由组 vs 平行路由（本项目最容易混淆的两个概念）

两个都用括号，但**完全不是一回事**：

| | 路由组 `(folder)` | 平行路由 `@folder` |
|---|---|---|
| **符号** | 圆括号 | `@` 前缀 |
| **是否进 URL** | ❌ 不进 | ❌ 不进 |
| **作用** | 给路由**分组**，可挂独立 layout | 把一个额外 UI **作为 prop 注入**同级 layout |
| **消费方式** | 无需特殊接收，正常渲染 children | layout 必须**声明同名 prop** |
| **本仓库** | `(auth)` `(dashboard)` `(root)` | `@team` `@analytics` |

**平行路由的接收方式** —— 关键在于 `app/layout.tsx` 的 props 名字必须和 `@` 目录名一模一样：

```tsx
// app/layout.tsx
export default function DashboardLayout({
  children, team, analytics
}: {
  children: React.ReactNode; team: React.ReactNode; analytics: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="bg-white text-black dark:bg-black dark:text-white">
            {team}{children}{analytics}   {/* ← 加载平行路由 */}
```

> **为什么 `@team` 和 `@analytics` 都必须配 `default.tsx`？**
> 平行路由有一个反直觉行为（已在本仓库实测，命令见 [9.2](#92-自测命令速查)）：
> - **硬刷新 / 直接输入 URL** → 当前路由下没有匹配的 slot 内容，Next 渲染该 slot 的 **`default.tsx`**
> - **软导航（`<Link>` 点击）** → Next 保留上一次 slot 的状态（同一 slot 在不同路由间切换时不会重置）
>
> 实测证据：`curl /dashboard/users/1` 看到的是 `team default` / `analytics default`；
> 而 `curl /`（该路由下 slot 确有对应 page）看到的是 `Team page` / `Analytics page`。
>
> 缺了 `default.tsx`，硬导航到没有对应 slot 的路由时 slot 会直接空掉 —— 这是平行路由最高频的线上事故。
> `app/default.tsx`、`@team/default.tsx`、`@analytics/default.tsx` 三个文件共同构成完整兜底链。

> ⚠️ **命名陷阱**：`app/@analytics`（slot）和 `app/(dashboard)/dashboard/analytics`（普通路由）**同名但毫无关系**。前者是注入 layout 的 UI 片段，后者是 `/dashboard/analytics` 这个 URL。看代码时务必分辨。

### 4.3 动态路由三兄弟

三个目录并排放，一眼看全是区别：

| 写法 | 目录 | 匹配 `/x` | 匹配 `/x/a` | 匹配 `/x/a/b` | `params` 形态 |
|---|---|:-:|:-:|:-:|---|
| `[id]` | `app/slug/[id]` | ✅ | ❌ | ❌ | `{ id: '123' }` |
| `[...id]` | `app/slug/[...id]` | ❌ | ✅ | ✅ | `{ id: ['a','b'] }` |
| `[[...id]]` | `app/slugs/[[...id]]` | ✅ | ✅ | ✅ | `{ id: '123' }` 或 `{ id: ['123','456'] }` |

```tsx
// app/slugs/[[...id]]/page.tsx
"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const params = useParams();
  console.log(params); //{id: '123'}  {id: ['123', '456']} 接受单个值以及多个值
  return <div>[[...slug]]Page</div>;
}
```

**`[[...id]]` 的真实价值**在 `(root)/sign-in/[[...sign-in]]/page.tsx` —— Clerk 官方推荐写法：让 `/sign-in`、`/sign-in/factor-one`、`/sign-in/sso-callback` 全部落到同一个页面，把多步登录的子路径交给 Clerk 组件自己处理。

**`params` 已经变成 Promise（Next 15+ 破坏性变更）**：

```tsx
// ✅ Next 15/16 新写法
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
// ❌ 旧写法（Next 15 之前）：params 是同步对象
export async function PUT(request: Request, context: { params: { id: string } }) {
  const id = +context.params.id;   // ← 没有 await
}
```

本仓库**已经全部迁移到新写法**：

```ts
// app/api/books/[id]/route.ts ✅
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = +(await context.params).id;
}
```

> 旧写法在 Next 15+ 下会拿到一个 **Promise**，`+context.params.id` 求值成 `NaN` —— 是个静默 bug。
> 本仓库所有动态段（`api/books/[id]`、`api/user/[id]`、`dashboard/users/[id]`、`ssg/[id]`）都已用 `await params`。

### 4.4 layout vs template：状态保持实验

这是全仓库**最巧妙的教学设计** —— `basic/layout.tsx` 和 `basic/template.tsx` 的代码几乎逐字相同：

```tsx
// basic/layout.tsx
"use client"; //需要交互的地方要改为客户端组件 默认是服务端组件
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Blog 布局组件</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <h1>数量： {count}</h1>
      <hr />
      {children}
    </div>
  );
}
```

```tsx
// basic/template.tsx —— 除了 h1 文案，上述代码原样复制
export default function BlogTemplate({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  // ... 完全相同
}
```

**亲手验证**：
1. 访问 `/basic/a`，点几下 `+1` 让计数变成 3
2. 点「跳转B」→ **layout 的计数仍是 3**
3. 回退到 `/basic`，再进 `/basic/a` → **template 的计数已归零**

**工程意义**：
- `layout` 保留状态 → 适合放**侧边栏、播放器、WebSocket 连接、滚动容器**
- `template` 重挂载 → 适合放**需要每次进页面重置的表单、需要重跑入场动画的元素**

### 4.5 RSC vs Client Component：边界到底在哪

三个页面构成完整证据链。

**证据一：`client/page.tsx` —— 代码确实被下载到浏览器了**

```tsx
"use client";
import { useEffect, useState } from "react";
console.log("client");                    // ← 模块加载时执行（含 SSR 阶段）
export default function ClientPage() {
  const [count, setCount] = useState(0);
  console.log("client X");                // ← 每次渲染执行
  useEffect(() => {
    console.log(document, window);        // ← 浏览器 API 可用
  }, []);
  // ...
}
```

打开控制台，你会看到 `"client"` 在**服务端终端**和**浏览器控制台**都打印了一次 —— 这证明客户端组件也会参与 SSR（生成首屏 HTML），之后在浏览器 hydrate 接管。

**证据二（历史示例，已移除）：原 `server/page.tsx` —— 这些代码物理上无法在浏览器运行**

```tsx
import fs from "node:fs";                                    // Node 内置模块
import mysql, { RowDataPacket } from "mysql2/promise";       // TCP 数据库连接
// 操作数据库 仅供演示 非最佳实践
const pool = mysql.createPool({
  host: "localhost", user: "root", password: "root", database: "next16-basic",
});
export default async function ServerPage() {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM goods");
  const data = fs.readFileSync("./data.json", "utf-8");   // ← 该文件已随本页一并移除
  // ...
}
```

> ⚠️ 两个反模式，生产禁用：① 连接池写在模块顶层且硬编码凭据；② `fs.readFileSync("./data.json")` 用相对路径，依赖进程 CWD —— 部署到 Serverless/容器环境会直接失败。
>
> 本页与它读取的 `data.json` 都已移除；这里保留代码快照，作为「反模式对照」存档。

**证据三：`serveronly/page.tsx` —— 编译期就把误用打死**

```tsx
// app/serveronly/page.tsx
import "server-only";

export default function ServerOnlyPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server Only</h1>
      <p>
        本模块顶部带有 <code>import &quot;server-only&quot;</code>。它只能在服务端组件（RSC）中使用；
        一旦被客户端组件导入，构建期即报错，从而把不该跨边界的代码锁死在服务端。
      </p>
    </main>
  );
}
```

只要任何 `"use client"` 组件 `import` 它，**构建立刻失败**，而不是等到运行时才报错。`server-only` 包本身不含逻辑，纯粹是一句话报错，用来把「不该跨边界的东西」锁死在服务端。

> 配套还有 `client-only` 包，反之亦然。

**最佳实践形态**请看 `components/navigation/navbar/index.tsx` —— **服务端壳 + 客户端岛**：

```tsx
// components/navigation/navbar/index.tsx —— 服务端组件（无 "use client"）
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/DarkMode";   // ← 客户端岛

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 ...">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/globe.svg" width={23} height={23} alt="logo" />
        <p className="h2-bold font-space-grotesk ...">
          Dev <span className="text-primary-500">Flow</span>
        </p>
      </Link>
      <p>Global Search</p>
      <div className="flex-between gap-5">
        <ModeToggle />   {/* ← 只有这一小块 JS 会被打包下发 */}
      </div>
    </nav>
  );
};

export default Navbar;
```

> 注意 `components/DarkMode.tsx` 才是 `"use client"` 的那一端，Navbar 本身是服务端组件。

**原则：把 `"use client"` 尽可能推向叶子节点。** 一个组件标了 `"use client"`，它 import 的整棵子树都会被拖进浏览器包。

### 4.6 流式渲染：Suspense / loading / connection()

**层次一：`loading.tsx` 就是 Suspense 语法糖**

`basic/a/page.tsx` 用一个真实的 5 秒延迟来触发：

```tsx
const getData = async () => {
  //触发异步会自动跳转到loading组件 异步结束正常返回页面
  return new Promise((resolve) => { setTimeout(() => { resolve("数据"); }, 5000); });
};
export default async function APage() {
  const data = await getData();
  //遇到异常会自动跳转到error组件
  // throw new Error("错误");
  return <div><h1>A Page</h1><Link href="/basic/b">跳转B</Link></div>;
}
```

访问 `/basic/a`：先看到 `basic/loading.tsx`，5 秒后内容替换进来。切换到 `/basic/b`（同步立即返回）**不会**看到 loading —— 完美对照。

**层次二：`mysuspense/page.tsx` —— 更精细的手控流式**

```tsx
/* eslint-disable react-hooks/purity */
import { Suspense } from "react";
import { connection } from "next/server";
const DynamicContent = async () => {
  await connection(); //使用connection表示不要预渲染这部分
  const random = Math.random();
  const now = Date.now();
  return (<div><h2>动态内容</h2><ul><li>名称：{random}</li><li>时间：{now}</li></ul></div>);
};
export default async function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Suspense fallback={<div>动态内容Loading...</div>}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

这就是 **PPR（Partial Prerendering）的基础形态**：`<h1>Home</h1>` 被静态直出，动态部分走独立 chunk 流式追加，用户不用等最慢的数据。

> **`connection()` 是 Next 16 的稳定 API**（Next 15 时代以实验特性存在）：显式告诉框架「从这里开始依赖真实请求，别预渲染我」。过去靠读取 `cookies()` / `headers()` 隐式触发动态渲染，现在有了显式的表达手段。

**层次三：三种边界的分工**

| 边界 | 触发方式 | 粒度 | 客户端？ |
|---|---|---|---|
| `loading.tsx` | 约定文件 | 整个路由段 | 否（服务端） |
| `<Suspense>` | 手写 React API | 任意子树 | 否 |
| `error.tsx` | 抛异常 | 整个路由段 | **是** |

### 4.7 Next 16 缓存体系：四个层级

> ⚠️ 本节讲的是**心智模型**。具体代码与实验在 [4.16](#416-cache-components把-use-cache-真正跑起来-)，
> 页面在 `/mycache`（缓存侧与动态侧同页对照，刷新几次就能看懂）。

**四层手段速查**：

| 层级 | 手段 | 作用域 | 适用场景 |
|---|---|---|---|
| ① **组件级** | `"use cache"` + `cacheLife()` / `cacheTag()` | 单个组件/函数 | **Cache Components**（Next 16 主打，本仓库已开启） |
| ② **请求级** | `fetch(url, { cache: 'no-store' })` | 单个请求 | 精确控制某一条请求 |
| ②' **请求级** | `fetch(url, { next: { revalidate: N, tags: [...] } })` | 单个请求 | 配合 `revalidateTag()` 按需失效 |
| ③ **路径级** | `revalidatePath()` / `revalidateTag()` / `updateTag()` / `refresh()` | 按需失效 | 内容变更后主动清缓存 |
| ④ **段级（旧）** | `export const revalidate` / `dynamic` / `dynamicParams` | 整个路由段 | ⚠️ **Cache Components 开启后构建期直接报错**，已被 ①③ 取代 |

**`cacheLife` 的三段语义**（Next 16 新模型）：

```tsx
"use cache";
cacheLife({
  stale: 30,      // 客户端可无网络验证地使用 30s（不发请求直接用）
  revalidate: 60, // 服务端 60s 内可返回旧值，但后台重算
  expire: 3600,   // 硬过期：超过 1h 必须重新计算
});
```

预设值：`cacheLife("default" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "max")`。

**旧模型（Next 15 及以前）长什么样** —— 只做对照，**不要再用**：

```tsx
// ❌ Cache Components 开启后，这三行会让构建直接失败
export const dynamic = "force-dynamic";  // 强制动态
export const revalidate = 5;             // 5 秒 ISR
export const dynamicParams = false;      // 未预生成的路径直接 404
```

它们各自的现代替代：

| 旧写法 | 现代替代 |
|---|---|
| `dynamic = "force-dynamic"` | `await connection()` |
| `revalidate = N` | `"use cache"` + `cacheLife({ revalidate: N })` |
| `dynamicParams = false` | 路由内 `notFound()`（注意 PPR 下状态码，见 [4.27](#427-实测坑点ppr-模式下-notfound-返回-200)） |

> **开启方式**：`"use cache"` 需要 `next.config.ts` 里 `cacheComponents: true`。本仓库**已开启**。

### 4.8 Server Actions 演进链：3 个登录页的完整教学路径

`(auth)/` 目录下的 3 个登录页构成了一条**从传统到现代**的演进路线：

```text
演进链（越往下越现代）
│
├─ mylogin        传统派：useState + fetch('/api/login') + router.push
│                 └─ 样板最多，要手写 loading、手写 API 路由、手写跳转
│
├─ serverlogin    FormData 派：Server Action 接收 FormData + .bind() 传参
│                 └─ 原生表单语义，JS 禁用也能提交（渐进增强）
│
└─ serverzodlogin 现代派：useActionState + Zod 服务端校验  ★最推荐
                  └─ isPending 白送、错误信息服务端返回、类型安全
```

**① `.bind()` 预置额外参数** —— FormData 只能带表单字段，额外参数靠 bind

```tsx
// (auth)/serverlogin/page.tsx
export default function Login() {
  async function handleLogin(id: number, formData: FormData) {
    "use server";
    const username = formData.get("username");
    const password = formData.get("password");
    const form = Object.fromEntries(formData);
    console.log(username, password, form, id);
  }
  const userFunction = handleLogin.bind(null, 1); //绑定id参数
  return <form action={userFunction}>{/* ... */}</form>
}
```

> 注意 bind 后参数顺序：`bind(null, 1)` 把 `id` 变成第一个参数，FormData 自动排到最后。

**③ `useActionState` + Zod —— 本项目的最佳形态**

服务端 action（`lib/actions.ts`，全项目唯一 `'use server'` 文件）：

```ts
'use server'          // ← 写在文件首行，整个文件的导出都变成 Server Action
import { z } from "zod"
const loginSchema = z.object({
  username: z.string().min(6, '用户名不能少于6位'),
  password: z.string().min(6, '密码不能少于6位')
})
export async function handleLogin(_prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) {
    const errorMessage = z.treeifyError(result.error).properties;
    let str = ''
    Object.entries(errorMessage!).forEach(([_key, value]) => {
      value.errors.forEach((error: any) => { str += error + '\n' })
    })
    return { message: str }
  }
  //校验成功，进行数据库操作逻辑
  return { message: '登录成功' }
}
```

客户端消费：

```tsx
// (auth)/serverzodlogin/page.tsx
"use client";
import { useActionState } from "react";
import { handleLogin } from "@/lib/actions";
const initialState = { message: "" };
export default function Login() {
  const [state, formAction, isPending] = useActionState(handleLogin, initialState);
  return (
    <div>
      {isPending && <div>Loading...</div>}
      {state.message}
      <form action={formAction}>{/* ... */}</form>
```

**为什么这是最佳形态**：

| 收益 | 说明 |
|---|---|
| `isPending` 免费 | 不用自己 `useState` 管 loading |
| 零 API 路由 | 浏览器直接调用服务端函数，Next 自动生成 RPC 端点 |
| 渐进增强 | `<form action={...}>` 原生语义，无 JS 也能工作 |
| 校验在服务端 | `safeParse` 不抛异常；客户端永远绕不过（安全） |
| 类型契约清晰 | `useActionState` 的 state 类型 = action 返回值类型 |

> **Zod 4 关键变更**：本项目用的是 `z.treeifyError(result.error).properties`，这是 **Zod 4 的新 API**。Zod 3 时代是 `result.error.flatten().fieldErrors`，升级时编译会报错。

### 4.9 Route Handlers（Route 层）

**HTTP 方法导出清单**（`api/login/route.ts` 顶部的注释备忘）：

```ts
// export async function GET(request: Request) { }
// export async function HEAD(request: Request) { }
// export async function POST(request: Request) { }
// export async function PUT(request: Request) { }
// export async function DELETE(request: Request) { }
// export async function PATCH(request: Request) { }
// //实测：未定义 OPTIONS 时，Next 16 返回 405 Method Not Allowed（带 Allow 头），
// //      并不会自动补一个 204 —— 需要处理预检就自己手写 OPTIONS
```

**请求解析四种姿势**（`api/user/route.ts`）：

```ts
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams; //接受url中的参数
  console.log(query.get('id'));
  return NextResponse.json({ message: 'Get request successful' });
}
export async function POST(request: NextRequest) {
  //const body = await request.formData();      //接受formData数据
  //const body = await request.text();          //接受text数据
  //const body = await request.arrayBuffer();   //接受arrayBuffer数据
  //const body = await request.blob();          //接受blob数据
  const body = await request.json();            //接受json数据
  return NextResponse.json({ message: 'Post request successful', body }, { status: 201 });
}
```

**Cookie 读写 + httpOnly**（`api/login/route.ts`）：

```ts
import { cookies } from "next/headers"; //引入cookies
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.username === 'admin' && body.password === '123456') {
    const cookieStore = await cookies(); //获取cookie
    cookieStore.set('token', '123456', {
      httpOnly: true,                 //只允许在服务器端访问
      maxAge: 60 * 60 * 24 * 30,      //30天
    });
    return NextResponse.json({ code: 1 }, { status: 200 });
  }
  return NextResponse.json({ code: 0 }, { status: 401 });
}
```

> `httpOnly: true` 是关键 —— 防 XSS 窃取 token。生产还应加 `secure: true`（仅 HTTPS）+ `sameSite: 'lax'`。

> 📌 调试技巧：根目录的 `api.http` 配合 VS Code 的 **REST Client** 插件（`humao.rest-client`）可直接发请求。`###` 是请求分隔符，`#` 是注释行。

### 4.10 鉴权：手写 Cookie 演示 + Clerk 占位

仓库目前只有一套能跑通的鉴权演示，另有一套是占位：

| 方案 | 文件 | 状态 | 说明 |
|---|---|---|---|
| **手写 Cookie** | `api/login/route.ts` + `(root)/home` | ✅ 可用(演示级) | token 硬编码 `'123456'`，仅演示流程 |
| **Clerk** | `@clerk/nextjs` 依赖 + `/sign-in/[[...sign-in]]` | ⚠️ 占位 | 依赖保留但未接线（备份文件已清理，路由仅占位） |

> 架构师建议：手写 Cookie 仅作流程演示，**生产务必换成 Clerk 等成熟方案**，并移除本仓库已删除的 Auth.js 相关代码。详见[第七章 #1](#七架构师-review已知问题与-todo)。

### 4.11 proxy.ts：Next 16 的破坏性变更（重点）

**Next 16 官方已把 `middleware.ts` 重命名为 `proxy.ts`**，函数导出从 `middleware` 改为 `proxy`，
配置类型从 `MiddlewareConfig` 改为 `ProxyConfig`（两者仍都从 `next/server` 导出，新代码用 `ProxyConfig`）。

构建时若检测到 `middleware.ts`，Next 16.3.8 会打印这段**逐字警告**：

```text
The "middleware" file convention is deprecated. Please use "proxy" instead.

  To migrate automatically, run:
  npx @next/codemod@canary middleware-to-proxy .

  Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

> 同时存在 `middleware.ts` 与 `proxy.ts` 时，**构建直接失败**（实测原文）：
> ```text
> Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
> Please use "./proxy.ts" only. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
> ```

```ts
// proxy.ts —— Next 16 新写法
import { NextRequest, NextResponse } from "next/server";
import { ProxyConfig } from "next/server";

export async function proxy(request: NextRequest) {
  // 此时会拦截项目中所有的请求，包括静态资源、API请求、页面请求等
  console.log(request.url, 'url');
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  })
  return response;
}
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
export const config: ProxyConfig = {
  matcher: ['/api/:path*', '/home/:path*'],
  // matcher 写法三选一：单条 / 数组 / 负向前瞻正则
  // matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

**Next 16 与 proxy 相关的三个新配置**（都在 `experimental` 下）：

| 配置 | 作用 |
|---|---|
| `experimental.proxyPrefetch` | 让 proxy 参与 `<Link>` 预取请求的处理 |
| `experimental.proxyTimeout` | proxy 的最长执行时间 |
| `experimental.proxyClientMaxBodySize` | proxy 读客户端请求体的上限 |
```

**`matcher` 的三种写法**：

| 写法 | 示例 | 适用 |
|---|---|---|
| 单条字符串 | `'/api/:path*'` | 单个路径段 |
| 数组（本项目用） | `['/api/:path*', '/home/:path*']` | 多个路径段 |
| 负向前瞻正则 | `'/((?!api\|_next...).*)'` | 排除静态/内部路径 |

> ✅ `proxy.ts` 已清理：删除了 Next 15 残留的 `export { auth as middleware } from "@/auth"`，仅保留具名 `proxy` 导出（详见[第七章 #2](#七架构师-review已知问题与-todo)）。

### 4.12 数据与工具：Zod 4 / server-only

**Zod 4 的 `treeifyError`**（见 4.8）：

```ts
const errorMessage = z.treeifyError(result.error).properties;
// Zod 3 是 result.error.flatten().fieldErrors，升级到 Zod 4 会编译报错
```

**`cn()` 工具函数**（几乎所有 shadcn 组件的基石）：

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))   // clsx 拼条件类名，tailwind-merge 消解冲突
}
```

**`server-only` 包**（见 4.5 证据三）：编译期约束，误在客户端引用直接构建失败。

### 4.13 样式体系：Tailwind v4 CSS-first

这是本项目最值得细看的样式文件 `app/globals.css`。**Tailwind v4 没有 `tailwind.config.js`**，全部配置搬进 CSS：

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));   /* 把 dark: 改成基于 .dark 类，配合 next-themes */

/* 定义整体主题样式 */
@theme inline {
  --color-dark-100: #000000;
  --color-dark-200: #0f1117;
  --color-light-900: #ffffff;
  /* ... 自定义颜色值 */
}

/* 定义特定组件样式（只能叫 card） */
@layer components {
  .card { @apply p-6 bg-gray-100 border border-gray-300 rounded-lg; }
}
/* 完全自己定义类名 */
@layer utilities {
  .mycard { @apply p-6 bg-gray-100; }
  .background-light900_dark200 { @apply bg-background dark:bg-dark-200; }
  .flex-between { @apply flex justify-between items-center; }
}
/* 自定义动画 */
@keyframes background-change { 0% { background-color: #ff0000; } 50% { background-color: #00ff00; } 100% { background-color: #0000ff; } }
.animated-background { animation: background-change 5s infinite; }
```

**v3 → v4 的关键变化**：

| v3 | v4 |
|---|---|
| `tailwind.config.js` 里配 theme | `@theme` 块里用 CSS 变量 |
| `darkMode: 'class'` | `@custom-variant dark (&:is(.dark *))` |
| `content` 数组声明扫描路径 | 自动扫描，无需配置 |
| `postcss.config` 引 `tailwindcss` + `autoprefixer` | 只引 `@tailwindcss/postcss`（`postcss.config.mjs`） |

### 4.14 图片优化：next/image 与 sizes

`myimage/page.tsx` 演示了三种图片来源与响应式 `sizes`：

```tsx
import Image from "next/image";
import profile from "@/public/profile.png";   // 静态 import（需 tsconfig 配别名）

export default function MyImage() {
  return (
    <div>
      {/* ① 公共目录字符串路径：必须手写宽高 */}
      <Image src="/profile.png" width={100} height={100} alt="1" />

      {/* ② 静态 import：构建期读图自动注入宽高，无需手写 */}
      <Image src={profile} alt="1" />

      {/* ③ 远程图：必须在 next.config.ts 的 images.remotePatterns 白名单里 */}
      <Image src="https://eo-img.521799.xyz/i/pc/img1.webp" alt="1" width={192} height={108} />
    </div>
  );
}

// sizes 教科书示范
export function Avatar() {
  return <Image src="/avatar.jpg" width={64} height={64} alt="头像" sizes="64px" />;       // 固定 64px
}
export function Banner() {
  return <Image src="/banner.jpg" width={1920} height={600} alt="横幅" sizes="100vw" />;   // 占满视口
}
export function ContentImage() {
  return <Image src="/content.jpg" width={1200} height={800} alt="内容图"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px" />;                 // 响应式
}
```

**`sizes` 为什么重要**：它告诉浏览器「这张图在页面上实际渲染多大」，Next 据此选择 `deviceSizes`/`imageSizes` 里最合适的一档去下载，避免手机端下载 4K 图。`next.config.ts` 里已配 `deviceSizes` 与 `imageSizes`、`formats: ['image/avif', 'image/webp']`、以及 `eo-img.521799.xyz` 的 `remotePatterns`。

### 4.15 MDX：把内容变成一等公民

`app/mdx-page/page.mdx` 直接作为一个路由页面：

```mdx
# welcome to MDX

这是一段文字，**他加粗了**，并且有重点内容`important`。

- one
- two
- three

<div className="bg-red-500">
  <p>自定义标签</p>
</div>
```

**要让它生效，必须两步**：

1. 安装 `@next/mdx` + `@mdx-js/loader` + `@mdx-js/react`（已装）
2. **取消注释** `next.config.ts` 里的对应行：

```ts
// const withMDX = createMDX();  ← 默认支持 .mdx；要支持 .md 需传 extension
// pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],  ← 让它识别 .mdx 路由
export default withMDX()(nextConfig);   // ← 用 withMDX 包裹
```

**全局组件映射**（`mdx-components.tsx` 必须放在项目根目录、必须叫这个名字）：

```tsx
import type { MDXComponents } from "mdx/types";
const components: MDXComponents = {};
export function useMDXComponents(): MDXComponents {
  return components;   // 当前返回空对象 = 走默认渲染；想给 <a> 套 next/link 就在这里加
}
```

> ⚠️ 当前 `next.config.ts` 里这几行是**注释状态**，所以访问 `/mdx-page` 可能 404 —— 属于「装了待用」的教学预留，见[第七章 #9](#七架构师-review已知问题与-todo)。


### 4.16 Cache Components：把 `"use cache"` 真正跑起来 ★

原仓库的 `cacheComponents: false` 让 `"use cache"` 只是一句注释。本轮已**开启**该开关，
并把整个仓库迁移到 Next 16 的新缓存模型。

**开关带来的强制约束**（构建期直接报错，不是警告）：

| 被禁用的写法 | 报错原文 | 新写法 |
|---|---|---|
| `export const dynamic = "force-dynamic"` | Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents` | `await connection()` |
| `export const revalidate = 5` | 同上（revalidate） | `"use cache"` + `cacheLife()` |
| `export const dynamicParams = false` | 同上（dynamicParams） | 固定为 fallback: blocking |

**迁移后的对照组** —— `app/mycache/page.tsx` 现在把两块内容放在同一张页面：

```tsx
// app/mycache/CachedPart.tsx —— 缓存侧
async function getCachedName() {
  "use cache";                 // ← 指令必须在函数体第一行
  cacheLife("hours");          // 预设：default|seconds|minutes|hours|days|weeks|max
  cacheTag("mycache-demo");    // 打标签，供 revalidateTag 精准失效
  return { name: `随机名字-${Math.random().toString(36).slice(2, 8)}`, at: Date.now() };
}

// app/mycache/DynamicPart.tsx —— 动态侧
export default async function DynamicPart() {
  await connection();          // ← 显式声明「这段不要预渲染」
  const name = `随机名字-${Math.random().toString(36).slice(2, 8)}`;
  return (<div>…名称：{name}…</div>);
}
```

**最直观的验证方式**：两块内容里都放了 `Math.random()`。
反复刷新 `/mycache` —— 上面的「随机名字」**永远不变**（缓存命中），下面的**每次都变**。
不需要看任何日志，刷新几次就懂了。

构建输出也能看出区别：

```text
├ ◐ /mycache      1h      1d
│
│   Revalidate = 1h（cacheLife("hours") 预设）
│   Expire     = 1d
│
│   ◐ (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

`◐` = **部分预渲染（PPR）**：静态壳子直出，动态部分流式追加。这是 Next 16 的默认形态。

### 4.17 静态生成与 ISR：generateStaticParams

`app/(root)/ssg/[id]/page.tsx` 演示三个知识点：

```tsx
export function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));   // 构建期预渲染这 3 条路径
}

async function getPost(id: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });  // ISR 的过期策略
  cacheTag(`post-${id}`);                                   // 供 revalidateTag 精准失效
  return posts.find((post) => post.id === id);
}
```

**构建产物验证**（`pnpm build` 输出）：

```text
├   /ssg/[id]
│ ├ ◐ /ssg/[id]
│ ├ ○ /ssg/1      1m      1h      ← ○ 表示已预渲染为静态页
│ ├ ○ /ssg/2      1m      1h
│ └ ○ /ssg/3      1m      1h
```

**运行时验证**（`pnpm start` 后）：

```bash
curl -I http://127.0.0.1:3000/ssg/1
# x-nextjs-cache: HIT          ← 命中缓存
# x-nextjs-stale-time: 30      ← 30 秒内可无网络验证地直接用旧值
```

> ⚠️ `dynamicParams` 在 Cache Components 模式下**不可配置**（构建期报错）。
> 实际行为固定为 `fallback: blocking` —— 访问没预生成的路径时运行时按需生成。

### 4.18 按需失效：revalidatePath / revalidateTag / updateTag / refresh

`lib/revalidate-actions.ts` 集中演示四个 API：

| API | 粒度 | 备注 |
|---|---|---|
| `revalidatePath(path)` | 按 URL 路径 | 整条路由重新生成 |
| `revalidateTag(tag, profile)` | 按标签 | `profile` 决定过期策略，如 `"max"` |
| `updateTag(tag)` | 按标签 | **Next 16 新增**，只能在 Server Action 里，实现「读己所写」 |
| `refresh()` | 客户端 | 刷新客户端 Router Cache 里的动态数据副本 |

```ts
"use server";
import { revalidatePath, revalidateTag, refresh, updateTag } from "next/cache";

export async function invalidateByTag() {
  revalidateTag("post-1", "max");
}
```

> 注意 `revalidateTag` 在 Next 16 里是**两个参数**（tag + profile），
> 写成 `revalidateTag("post-1")` 会直接编译报错：`Expected 2 arguments, but got 1`。

### 4.19 乐观更新：useOptimistic + useFormStatus（React 19）

`app/(root)/optimistic/` 是本仓库**最贴近生产**的一组示例。

```tsx
"use client";
const [messages, setMessages] = useState<Message[]>([]);
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (state: Message[], newMessage: Message) => [...state, newMessage],
);

async function handleSubmit(formData: FormData) {
  const text = String(formData.get("text") ?? "").trim();
  addOptimisticMessage({ id: "optimistic", text, pending: true });  // ① 立刻乐观插入
  const saved = await addMessage(text);                            // ② 真实请求
  setMessages((prev) => [...prev, saved]);                         // ③ 用真实数据替换
}
```

**两个 Hook 的分工**：

- `useOptimistic` —— 服务端结果回来之前先渲染「预计状态」，到达后 React 自动丢弃乐观值。
  约束：必须在 Action / Transition 内部调用。
- `useFormStatus` —— 只负责读父级 form 的 pending 状态。
  **必须写在 form 的子组件里**（本项目拆成 `app/(root)/optimistic/SubmitButton.tsx`），写在 form 所在组件里永远拿到 `false`。

### 4.20 拦截路由（Intercepting Routes）★ 新增

`app/(root)/intercepting/` 完整演示了「软导航弹窗 / 硬导航全屏」这套经典模式：

```text
app/(root)/intercepting/
├─ layout.tsx                 接收 children 与 modal 两个 prop
├─ page.tsx                   触发器页面
├─ photo/[id]/page.tsx        真实页面（硬导航时显示）
└─ @modal/
   ├─ default.tsx             slot 兜底（空）
   └─ (.)photo/[id]/page.tsx  拦截路由（软导航时显示）
```

**标记含义**：

| 标记 | 含义 |
|---|---|
| `(.)` | 同层级 |
| `(..)` | 上一层级 |
| `(..)(..)` | 上上层级 |
| `(...)` | 根目录 `app/` |

**行为对照**：

- 从 `/intercepting` 点 `<Link>` 到 `/intercepting/photo/1` → 命中拦截页（遮罩弹窗）
- 在地址栏直接输入 `/intercepting/photo/1` 或刷新 → 命中真实页面（全屏）

> 硬性前提：拦截路由必须放在**平行路由 slot** 里，且该 slot 必须有 `default.tsx` 兜底。

### 4.21 响应后任务：after()

```tsx
import { after } from "next/server";

export default function AfterPage() {
  after(() => {
    console.log("[after] 响应已发出，这条日志在响应之后才打印");
  });
  return <div>...</div>;
}
```

`after()` 不阻塞首字节响应，适合埋点上报、写审计日志、清理临时资源。
可在 Server Component / Route Handler / Server Action 中使用。

### 4.22 流式响应：Route Handler + ReadableStream

`app/api/stream/route.ts` 返回 SSE：

```ts
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 5; i++) {
        controller.enqueue(encoder.encode(`data: 第 ${i} 条消息\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
```

前端用 `fetch` + `ReadableStream` 手动读（比 `EventSource` 更灵活，可带请求头与 POST body），
见 `app/(root)/stream/page.tsx`。

> **流式与缓存互斥**：给 SSE 接口加 `revalidate` / `"use cache"` 都没有意义。

### 4.23 导航 Hooks 与 metadata

`app/(root)/hooks/` 一次性演示五个客户端导航 Hook：
`usePathname` / `useSearchParams` / `useParams` / `useSelectedLayoutSegment` / `useSelectedLayoutSegments`。

> ⚠️ `useSearchParams` 在静态预渲染页面里**必须**包在 `<Suspense>` 里，
> 否则 `next build` 直接报 `useSearchParams() should be wrapped in a suspense boundary`。

`app/(root)/seo/page.tsx` 演示完整 metadata 体系：
`title` 模板、`openGraph`、`twitter`、`robots`、`icons`，以及**必须单独导出**的 `viewport`。

### 4.24 SEO 约定文件与动态图片

| 约定文件 | 产出 | 说明 |
|---|---|---|
| `app/sitemap.ts` | `/sitemap.xml` | 构建期执行，返回 `MetadataRoute.Sitemap` |
| `app/robots.ts` | `/robots.txt` | 返回 `MetadataRoute.Robots` |
| `app/manifest.ts` | `/manifest.webmanifest` | PWA 应用清单 |
| `app/icon.tsx` | `/icon` | 用 `ImageResponse` 把 JSX 渲染成 PNG，无需手工备图 |
| `app/opengraph-image.tsx` | `/opengraph-image` | 社交分享卡片，同样构建期生成 |

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", background: "#000", color: "#fff" }}>N</div>,
    { ...size },
  );
}
```

### 4.25 Route Handler 进阶：CORS / redirect / rewrite / Cookie

新增三个可点开的接口：

| 接口 | 演示内容 |
|---|---|
| `/api/cors` | 手写 `OPTIONS` 预检 + 动态白名单 Origin。**实测：不写 OPTIONS 时 Next 16 返回 405 Method Not Allowed（带 `Allow` 头），既不是预检该有的 2xx，也不带 CORS 头，浏览器照样拦截** |
| `/api/redirect` | `NextResponse.redirect`（地址栏变） vs `NextResponse.rewrite`（地址栏不变，内部改写） |
| `/api/cookies` | `response.cookies.set()` 写 Cookie，含 `httpOnly` / `secure` / `sameSite` / `maxAge`；另加 `export const maxDuration = 30` |

```ts
// app/api/cors/route.ts
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request.headers.get("origin")),
  });
}
```

### 4.26 字体优化与监控钩子

- `app/(root)/font/page.tsx` —— `next/font/google`，构建期下载并自托管字体，零布局偏移、不泄露访客 IP。
  ⚠️ 首次构建需要网络（字体缓存在 `.next/cache`，之后可离线构建）。
- `app/instrumentation.ts` —— 约定文件，两个导出：
  - `register()`：服务启动钩子（可按 `process.env.NEXT_RUNTIME` 区分 nodejs / edge）
  - `onRequestError(error, request, context)`：服务端错误统一上报，能拿到「哪条路由、什么方法、什么错误」

### 4.27 实测坑点：PPR 模式下 notFound() 返回 200

这是本轮**实测复现**（`next build` + `pnpm start` + `curl -I`，干净实例）出来的高价值结论：

| 路由 | 构建产物形态 | HTTP 状态码 | 页面内容 |
|---|---|---|---|
| `/notfound` | `○ Static`（静态预渲染） | **200 OK** | 404 界面 |
| `/notfound-dynamic` | `◐` PPR 壳子（含 `await connection()`） | **200 OK** | 404 界面 |
| `/ssg/999`（数据不存在） | `◐` PPR 壳子 / ISR | **200 OK** | 404 界面 |
| `/no-such-route`（路由未匹配） | — | **404 Not Found** ✅ | 404 界面 |

```bash
curl -I http://127.0.0.1:3000/notfound
# HTTP/1.1 200 OK
# x-nextjs-cache: HIT
# Cache-Control: s-maxage=31536000
```

**Next 官方的真实规则**：

- 响应**尚未开始流式输出**时调用 `notFound()` → 框架可以把状态码设成 **404**；
- 响应**已经开始流式输出**（预渲染壳子 / PPR 壳子已随首字节发出）→ 状态码**锁定 200**，
  404 界面只能作为后续流内容追加进去。

在 Cache Components（PPR）模式下，几乎所有页面路由都会先输出一个预渲染壳子，
所以**页面里的 `notFound()` 基本都会得到「200 + 404 界面」**。

> ⚠️ 常见误解：以为「先 `await connection()` 再 `notFound()`」就能拿到 404 —— **不能**，
> 实测 `/notfound-dynamic` 依然是 200（响应头带 `x-nextjs-postponed: 1`）。

**工程建议**：

1. 依赖 HTTP 状态码的 404 场景 → 在 **Route Handler** 里显式返回
   （本项目示例：`app/api/notfound/route.ts`）。
2. 纯展示型「内容不存在」→ 页面里 `notFound()` 即可，视觉上没有任何问题。
3. SEO 敏感（不希望搜索引擎收录这些页）→ 配合 `robots` 元信息，
   并注意框架级「路由未匹配」仍然会正确返回 404。

## 五、AI 能力专区（AI 潮流达人视角）

### 5.1 现状盘点

依赖里已经装齐了 **Vercel AI SDK 6** 全家桶：

```
ai@6.0.39            ← 核心（streamText / generateText / 工具调用 / Agent）
@ai-sdk/react@3.0.41 ← 前端 hooks（useChat / useCompletion）
@ai-sdk/deepseek@2.0.8 ← DeepSeek 模型适配（deepseek-chat / deepseek-reasoner）
```

但 **`app/api/chat/route.ts` 与 `api/register` 仅是占位 501 接口（尚未通电）**，`register` 同理。也就是说：接线位已挖好，AI 能力**尚未通电**。下面给出可直接落地的补全方案。

### 5.2 推荐实现：流式对话（DeepSeek 版）

**① 服务端 `app/api/chat/route.ts`**（当前是 501 占位，替换成）：

```ts
import { deepseek } from "@ai-sdk/deepseek";
import { streamText, convertToModelMessages } from "ai";

export const maxDuration = 60;               // 允许长推理（deepseek-reasoner 较慢）

export async function POST(req: Request) {
  const { messages } = await req.json();     // useChat 自动按 UIMessage 格式发
  const result = streamText({
    model: deepseek("deepseek-chat"),        // 想用推理模型换 deepseek-reasoner
    system: "你是 next16-sass 的实验助手，回答简洁、可运行。",
    messages: convertToModelMessages(messages),
  });
  return result.toUIMessageStreamResponse();  // AI SDK 6：用 UIMessage 流返回
}
```

**② 前端 `app/chat/page.tsx`**（新建）：

```tsx
"use client";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, sendMessage, status, stop, error } = useChat({ api: "/api/chat" });
  return (
    <div className="mx-auto max-w-2xl p-4">
      {messages.map((m) => (
        <div key={m.id}>
          <b>{m.role === "user" ? "我" : "AI"}：</b>
          {m.parts.map((p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null))}
        </div>
      ))}
      <textarea
        placeholder={status === "streaming" ? "生成中…" : "说点什么"}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const input = e.currentTarget.value.trim();
            if (input) { sendMessage({ text: input }); e.currentTarget.value = ""; }
          }
        }}
      />
      {status === "streaming" && <button onClick={stop}>停止</button>}
      {error && <p className="text-red-500">{error.message}</p>}
    </div>
  );
}
```

> 流式响应的服务端写法与本仓库 `/api/stream`（SSE）同源，可对照 [4.22](#422-流式响应route-handler--readablestream)。

### 5.3 AI SDK 6 的关键变化

| 旧版（v3/v4） | v6 现状 | 说明 |
|---|---|---|
| `import { useChat } from 'ai/react'` | `import { useChat } from '@ai-sdk/react'` | hooks 拆到独立包 |
| `data` / `input` / `handleInputChange` | `messages` / `sendMessage` / `status` | 组件 API 全面 UIMessage 化 |
| `result.toDataStreamResponse()` | `result.toUIMessageStreamResponse()` | 数据流格式升级 |
| Agent 靠手写循环 | `maxSteps` 多步 + `ToolLoopAgent` | 工具调用自循环开箱即用 |

### 5.4 进阶工程建议（把玩具变产品）

| 能力 | 做法 |
|---|---|
| **成本控制** | 用 `experimental_telemetry` 上报 token；设 `maxTokens`；对非流式请求 `generateText` 替代 `streamText` |
| **速率限制** | proxy.ts 里对 `/api/chat` 加 Redis/内存限流，防刷爆额度 |
| **RAG / 私有知识** | 接 `@ai-sdk/openai` 的 embeddings + 向量库（pgvector/Milvus），`retrieve` 工具回灌上下文 |
| **深度推理** | `deepseek-reasoner` 会在 `parts` 里返回 `reasoning` 段，前端可单独渲染思考过程 |
| **多步 Agent** | `useChat({ maxSteps: 5 })` + 在 `streamText` 里注册 `tools`，实现「查库→计算→回答」自循环 |
| **流式不能缓存** | `"use cache"` / `revalidate` 对 SSE 流式无效，别试图给 `/api/chat` 套缓存 |

### 5.5 一句话总结

这套依赖选型非常「潮」——AI SDK 6 + DeepSeek 是 2026 年性价比最高的对话底座。把 5.2 的两段代码填进空文件、配上 `DEEPSEEK_API_KEY`，你的 next16-sass 就瞬间从「教学仓库」升级为「带 AI 的 SaaS 实验台」。

## 六、next.config.ts 逐项拆解

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ① React Compiler（需装 babel-plugin-react-compiler）
  reactCompiler: true,

  // ② Turbopack 开发期文件系统缓存（错乱时删 .next 重来）
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },

  // ③ 缓存组件（Next 16 主打；已开启，"use cache" / cacheLife / PPR 全部生效）
  cacheComponents: true,

  // ④ 图片优化
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'eo-img.521799.xyz', pathname: '/i/pc/**' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ⑤ 纯静态导出（全 SSG，需所有页面可静态化；当前注释）
  // output: "export",
  // distDir: "dist",
  // trailingSlash: true,

  // ⑥ MDX 支持（当前注释，取消后 /mdx-page 才生效）
  // pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

export default nextConfig;
```

| 编号 | 配置 | 状态 | 作用 |
|---|---|---|---|
| ① | `reactCompiler` | ✅ 开 | 自动 memo/useMemo，减少手写性能优化 |
| ② | `turbopackFileSystemCacheForDev` | ✅ 开 | dev 加速；错乱就删 `.next` |
| ③ | `cacheComponents` | ✅ 开 | Cache Components 总开关；`"use cache"`、`cacheLife`、PPR 全部生效（**代价**：段级 `dynamic`/`revalidate`/`dynamicParams` 不可用） |
| ④ | `images.*` | ✅ 配 | 图片优化白名单/格式/尺寸档位 |
| ⑤ | `output: export` | ❌ 注释 | 导出纯静态站，无服务端运行时 |
| ⑥ | `pageExtensions` | ❌ 注释 | 让 `.mdx` 成为路由页面 |

## 七、架构师 Review：已知问题与 TODO

以下是 15 点真实缺陷清单（含反模式、待办与本轮已修复项）。

| # | 问题 | 位置 | 严重度 | 修复建议 |
|---|---|---|---|---|
| 1 | 鉴权只有手写 Cookie 一套 | `api/login` | 🟡 中 | 生产统一用 Clerk 等成熟方案。Clerk 的备份文件（`proxyBackup.ts`/`layoutBackup.tsx`）本轮已清理，只留依赖与 `/sign-in` 占位路由 |
| 2 | `proxy.ts` 曾残留 Next 15 写法 `export { auth as middleware }` | `proxy.ts` | ✅ 已修复 | 已删除该行，仅保留具名 `proxy` 导出 |
| 3 | 首页若干 `<Link>` 指向**不存在的路由**（`/page`、`/xm`、`/daman`、`/page/1`），点进去直接 404 | `app/(root)/page.tsx` | 🟡 中 | 教学演示遗留。要么补对应路由，要么把链接指向真实页面 |
| 4 | 客户端守卫写在 `useEffect` 里 `redirect()` | `(root)/home/page.tsx` | 🟡 中 | 改在 `proxy.ts`（请求级）或服务端 layout 鉴权 |
| 5 | `server/page.tsx` 模块级 MySQL 连接池 + 硬编码凭据 + 相对路径读文件 | ~~`server/page.tsx`~~ | ✅ 已处理 | 该页与 `data.json` 均已移除（依赖 `mysql2` 也已卸载），§4.5 仅保留代码快照作反模式对照 |
| 6 | `api/books/[id]` 的 `params` 未用 Promise 写法（旧版） | `api/books/[id]/route.ts` | ✅ 已修复 | 现为 `params: Promise<{id:string}>` + `await context.params` |
| 7 | `api/chat` 与 `api/register` 改为占位 501 接口（非空文件） | `api/chat`、`api/register` | 🟢 低 | 按 5.2 补全对话接口，或保留占位 |
| 8 | Clerk 依赖保留但未接线（备份文件已清理，只剩 `/sign-in` 占位路由） | `package.json` | 🟢 低 | 生产启用 Clerk（配 NEXT_PUBLIC_CLERK_*）或移除其依赖 |
| 9 | MDX 路由未真正启用（`pageExtensions` 注释） | `next.config.ts` | 🟢 低 | 需要 MDX 时取消注释并用 `withMDX()` 包裹 |
| 10 | `components.json` 配了 `"hooks": "@/hooks"` 但无 `hooks/` 目录 | `components.json` | 🟢 低 | 创建 `hooks/` 或移除该别名 |

**本轮新增并已修复的缺陷**：

| # | 问题 | 位置 | 状态 |
|---|---|---|---|
| 11 | `error.tsx` 只渲染一个静态「error」字样，不接 `error` / `reset` prop —— 拿不到错误信息、也无法重试 | `app/(root)/error.tsx`、`app/basic/error.tsx` | ✅ 已修复 |
| 12 | `global-error.tsx` 没有输出 `<html><body>`，一旦触发根级错误页面全白 | `app/global-error.tsx` | ✅ 已修复 |
| 13 | PPR 模式下页面里 `notFound()` 返回 HTTP **200**，404 页会被搜索引擎当正常页收录 | `app/(root)/notfound/page.tsx` | ⚠️ 已加对照实验 + Route Handler 正确写法（`app/api/notfound/route.ts`） |
| 14 | `albums` 用 `export const dynamic` 强制动态，与 Cache Components 冲突 | `app/(root)/albums/page.tsx` | ✅ 已迁移为 `await connection()` |
| 15 | `api/db.ts` 用**模块级数组**冒充数据库：进程重启即丢、多实例不共享、`PUT` 时 `books[index] = book` 未防 `index === -1` 越界 | `app/api/db.ts`、`app/api/books/[id]/route.ts` | 🔴 高 | 换成真实数据库；写入前校验 `index` 有效性 |

**额外提示**：

- 拦截路由**已补齐**：`app/(root)/intercepting/@modal/(.)photo/[id]`（见 [4.20](#420-拦截路由intercepting-routes-新增)）
- `"use cache"` 已**全面生效**（`cacheComponents: true`），真实示例见 `app/mycache/CachedPart.tsx`；原占位组件 `components/MyComponent.tsx` 已删除
- `generateStaticParams` / `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` **均已补齐并实测通过**
- 完整索引见运行时页面 [`/knowledge`](http://localhost:3000/knowledge)

## 八、13 天学习路径

按依赖顺序排，每天啃一章、跑一遍对应路由：

| Day | 主题 | 动手实验 |
|---|---|---|
| 1 | **约定文件 + 路由组** | 跑 `/basic/a`、`/basic/b`，看 loading/error；删掉 `app/@team/default.tsx` 体会 slot 兜底消失 |
| 2 | **平行路由** | 对比 `@team/page.tsx` 与 `@team/default.tsx`；删 default 看软/硬导航差异 |
| 3 | **动态路由三兄弟** | 访问 `/slug/foo`、`/slug/a/b`、`/slugs`、`/slugs/a/b`，打印 `useParams()` |
| 4 | **RSC vs Client** | 看 `client`/`server`/`serveronly` 控制台输出；让客户端 import `serveronly` 看构建失败 |
| 5 | **流式 + PPR** | `/mysuspense`；观察 `next build` 输出里的 `◐` 标记 |
| 6 | **Cache Components** | 反复刷新 `/mycache`：上面那块 `use cache` 的随机数不变，下面 `connection()` 的每次都变 |
| 7 | **SSG + ISR** | `pnpm build` 看 `/ssg/1~3` 变成 `○ Static`；`curl -I` 看 `x-nextjs-cache: HIT` |
| 8 | **按需失效** | 打开 `/revalidate` 点三个按钮，再访问 `/ssg/1` 看缓存被清 |
| 9 | **Server Actions 演进** | 依次走 `mylogin` → `serverlogin` → `serverzodlogin` → `/optimistic`，体会样板代码递减 |
| 10 | **拦截路由** | `/intercepting` 软导航看弹窗，刷新地址栏看全屏 |
| 11 | **SEO 约定文件** | 访问 `/sitemap.xml`、`/robots.txt`、`/manifest.webmanifest`、`/icon`、`/opengraph-image` |
| 12 | **404 状态码坑点** | `curl -I /notfound`（200）与 `curl -I /notfound-dynamic`（404）对比 |
| 13 | **鉴权 + AI 实战** | 配 GitHub OAuth 跑通登录；按第五章把 AI 对话接上 |

> 提示：`/knowledge` 页面是**全仓库索引**，九大主题、五十多个知识点都带跳转链接，
> 不记得某个知识点在哪一页时，从它进最省事。

## 九、速查附录

### 9.1 知识点覆盖清单

| 知识点 | 验证入口 |
|---|---|
| Cache Components / `"use cache"` / `cacheLife` / `cacheTag` | `/mycache`、`/ssg/1` |
| `connection()` 显式动态渲染 | `/mycache`、`/notfound-dynamic` |
| `generateStaticParams` + ISR（stale / revalidate / expire） | `/ssg`、`/ssg/1` |
| `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` | `/revalidate` |
| `useOptimistic` / `useFormStatus`（React 19） | `/optimistic` |
| 拦截路由 `(.)` + 平行路由 slot 兜底 | `/intercepting` |
| `notFound()` 与 404 状态码坑点 | `/notfound`、`/notfound-dynamic` |
| `after()` 响应后任务 | `/after` |
| 导航 Hooks（usePathname / useSearchParams / useParams / useSelectedLayoutSegment(s)） | `/hooks` |
| 完整 metadata + viewport | `/seo` |
| `sitemap.ts` / `robots.ts` / `manifest.ts` | `/sitemap.xml`、`/robots.txt` |
| `icon.tsx` / `opengraph-image.tsx`（ImageResponse 动态 PNG） | `/icon` |
| `next/font` 字体优化 | `/font` |
| `instrumentation.ts`（register / onRequestError） | — |
| SSE 流式响应 | `/stream`、`/api/stream` |
| CORS 预检 / `rewrite` / `response.cookies` / `maxDuration` | `/api/cors`、`/api/redirect`、`/api/cookies` |
| 约定文件七件套 + 平行路由 `default.tsx` 兜底 | `/basic/a`、`/` |
| 动态路由三兄弟（`[id]` / `[...id]` / `[[...id]]`） | `/slug/foo`、`/slug/a/b`、`/slugs` |
| RSC vs Client / `server-only` | `/client`、`/serveronly` |
| `next/image` 三形态 + sizes | `/myimage` |
| Suspense 流式渲染 | `/mysuspense` |
| Server Actions 演进链（fetch → FormData → useActionState+Zod） | `/mylogin` → `/serverlogin` → `/serverzodlogin` |
| `proxy.ts`（Next 16 重命名） | — |
| Tailwind v4 CSS-first 配置 | `app/globals.css` |
| MDX 即路由页面 | `/mdx-page`（需先启用 `pageExtensions`） |

> 运行时还有一份可点击的同款清单：<http://localhost:3000/knowledge>

### 9.2 自测命令速查

```bash
pnpm build      # 看路由表：○ 静态 / ◐ PPR / ƒ 动态
pnpm start      # 启动生产实例
pnpm lint
```

```bash
# ISR 是否命中缓存
curl -I http://127.0.0.1:3000/ssg/1          # x-nextjs-cache: HIT

# Cache Components 是否生效（Revalidate 1h / Expire 1d）
pnpm build | grep mycache

# 404 状态码坑点（详见 4.27）
curl -I http://127.0.0.1:3000/notfound          # 200（页面却是 404 界面）
curl -I http://127.0.0.1:3000/notfound-dynamic  # 仍是 200（PPR 壳子已发出）
curl -I http://127.0.0.1:3000/no-such-route     # 404 ✅
curl -I http://127.0.0.1:3000/api/notfound      # 404 ✅（Route Handler 自控状态码）

# 平行路由 slot 的硬导航行为（详见 4.2）
curl -s http://127.0.0.1:3000/dashboard/users/1 | grep -o "team default"  # 命中 default.tsx
curl -s http://127.0.0.1:3000/ | grep -o "Team page"                       # 命中 page.tsx

# SEO 约定文件
curl -I http://127.0.0.1:3000/sitemap.xml
curl -I http://127.0.0.1:3000/robots.txt
curl -I http://127.0.0.1:3000/manifest.webmanifest
```

### 9.3 初始化备忘

```bash
pnpm i babel-plugin-react-compiler@latest   # React Compiler
npx shadcn@latest init                      # shadcn/ui
```

### 9.4 调试：`api.http` 用法

仓库根目录的 `api.http` 是 VS Code **REST Client** 插件（`humao.rest-client`）的请求草稿。规则：

- `#` 开头 = 注释行（**不是**请求分隔符）
- `###` = 请求之间的分隔符
- 示例：`GET http://localhost:3000/api/user/886 HTTP/1.1` 正好对应 `api/user/[id]/route.ts`

### 9.5 关键版本号

```text
next            16.3.8
react           19.3.0
react-dom       19.3.0
tailwindcss     4.1.18
zod             4.3.5
ai              6.0.39
@ai-sdk/react   3.0.41
@ai-sdk/deepseek 2.0.8
@clerk/nextjs   6.36.5
typescript      5.9.3
eslint          9.39.2
```

> 版本号以 `package.json` 为准。

## 十、doc/ 教学文档（25 课体系）

`doc/` 目录是本文档的**教学化拆解** —— 一次一个知识点，配可动手验证的实验步骤。

| 课 | 主题 | 你会学到 |
|---|---|---|
| 01 | 项目总览与运行方式 | 仓库定位、三种构建标记（`○`/`◐`/`ƒ`）、启动坑 |
| 02 | 路由约定文件八件套 | 八个文件名各自的契约与硬性规则 |
| 03 | 路由组与平行路由 | `(folder)` vs `@folder`、`default.tsx` 的实测行为 |
| 04 | 动态路由三兄弟 | `[id]` / `[...id]` / `[[...id]]`、`params` 是 Promise |
| 05 | layout 与 template | 状态保留 vs 归零的对照实验 |
| 06 | 错误边界与 404 状态码 | 错误边界层级、**PPR 下 `notFound()` 返回 200 的真相** |
| 07 | RSC 与客户端组件边界 | `"use client"` 的真实含义、服务端壳 + 客户端岛 |
| 08 | server-only 约束 | 编译期护栏 |
| 09 | Suspense 与流式渲染 | `loading.tsx` 是语法糖、`connection()` |
| 10 | Cache Components | `"use cache"` / `cacheLife` / `cacheTag` |
| 11 | 静态生成与 ISR | `generateStaticParams`、`x-nextjs-cache` |
| 12 | 按需失效四件套 | `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` |
| 13 | Server Actions 三阶段 | fetch → Server Action → useActionState + Zod |
| 14 | 乐观更新与表单状态 | `useOptimistic`、`useFormStatus` |
| 15 | 响应后任务 `after()` | 埋点不阻塞首屏 |
| 16 | Route Handlers 基础 | 方法导出、请求体五种解析、**不写 OPTIONS → 405** |
| 17 | Cookie 读写与会话 | `httpOnly`/`secure`/`sameSite` |
| 18 | CORS / 重定向 / 改写 | 预检流程、`redirect` vs `rewrite` |
| 19 | 流式响应 SSE | `ReadableStream` 逐块推送 |
| 20 | 元数据与 SEO 约定文件 | `metadata`/`generateMetadata`/`viewport` + 六个约定文件 |
| 21 | 客户端导航与 Hooks | `Link` vs `useRouter`、五个导航 Hook |
| 22 | 图片与字体优化 | `next/image` 三种来源、`sizes`、`next/font` |
| 23 | proxy 与 instrumentation | Next 16 的 `middleware.ts` → `proxy.ts` 改名 |
| 24 | 环境变量与样式体系 | `NEXT_PUBLIC_` 可见性、Tailwind v4 CSS-first、`cn()` |
| 25 | 实测踩坑与学习路线 | 12 条**实测复现**的坑 + 24 天路线 + 毕业自检 |

**入口**：[`doc/README.md`](doc/README.md)

> 每课都基于**仓库里的真实代码**，并给出可在浏览器里立刻复现的实验步骤。
> 最后一课把全部**实测复现**的结论浓缩成速查表 —— 那些和直觉相反的行为都在那里。
>
> **正确性由四道关卡保证**（详见 [`doc/README.md`](doc/README.md)）：
> ① 代码块与全仓源码**逐行比对**；② 用 TypeScript 探针把文档提到的每个 API
> **按文档签名调用一遍**（`tsc` 零错误）；③ 所有反直觉结论都在生产实例上
> **`curl` 实测复现**；④ 标题锚点用官方 `github-slugger` 复算、内部链接逐个核对。


## 十一、MDX 与内容目录（目录即内容源）

> **先回答一个常见疑问**：`@next/mdx` 支不支持「把写好的 markdown 放进某个目录，自动解析成文章」？
>
> **答：`@next/mdx` 本身不做目录扫描。** 它是一个**编译期 loader**，
> 把 `.mdx` 文件编译成 React 组件，配合 `pageExtensions` 把它纳入 Next 的**文件式路由**。
> 也就是说它遵循的是「**一个文件 = 一个路由**」：
>
> ```text
> app/posts/hello.mdx   →   /posts/hello      ← 文件即路由，放进去就有路由
> ```
>
> 但它**不会**帮你做这三件事：① 扫描任意目录生成列表页；② 解析 YAML frontmatter；
> ③ 让你把文章放在 `app/` 之外的目录。
>
> 本仓库在 `app/posts/` 做了一套**「目录即内容源」**的实现，把这三件事补齐了。

### 11.1 两种 MDX 模式的对比

| | 模式 A：`@next/mdx` 文件式路由 | 模式 B：动态路由 + 目录扫描（本仓库 `/posts`） |
|---|---|---|
| 文章放哪 | 必须在 `app/` 的路由目录里 | 任意目录（这里是 `content/`） |
| URL | 由文件所在目录决定 | 由你写代码决定（这里是 `/posts/<slug>`） |
| 列表页 | 要自己写 | 自动扫描生成 |
| frontmatter | 不支持 YAML，用 `export const metadata` | 同左 |
| 加一篇文章 | 放进目录即可，但要 rebuild | 同左（构建期扫描 → 要 rebuild） |
| 适合 | 少量、结构化的长文页面 | 博客 / 文档站 / 内容多的站点 |

### 11.2 本仓库的实现：三个关键点

**① 开启 MDX**（`next.config.ts`）—— 注意 `extension` 决定支持哪些扩展名：

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

> `pageExtensions` 必须**包含** `md` / `mdx`，Next 才会把它们当作页面文件处理。

**② 扫描目录**（`lib/posts.ts`）：

```ts
const POSTS_DIR = path.join(process.cwd(), "content");
const POST_EXT = /\.(md|mdx)$/;

export function getPostFiles(): PostFile[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => POST_EXT.test(file))
    .map((file) => ({ slug: file.replace(POST_EXT, ""), file }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}
```

**③ 动态 import 渲染**（`app/posts/[slug]/page.tsx`）：

```tsx
export function generateStaticParams() {
  return getPostFiles().map((p) => ({ slug: p.slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getPostFiles().find((p) => p.slug === slug);
  if (!entry) notFound();

  const { default: Post, metadata } = await import(`@/content/${entry.file}`);
  return <article>{/* … */}<Post /></article>;
}
```

### 11.3 ⚠️ 三个实测踩到的坑

**坑 1：动态 import 的 key 必须是「含扩展名的完整文件名」**

```tsx
await import(`@/content/${slug}.mdx`)   // ❌ 写死 .mdx → .md 文件找不到
await import(`@/content/${entry.file}`)  // ✅ entry.file = "hello.mdx" / "pure-markdown.md"
```

原因：动态 import 表达式会被打包器编译成「该目录下**所有匹配扩展名的文件**」的
context map，key 是**完整路径**。写死 `.mdx` 就等于在 map 里只查 `.mdx` 那一类。

> 报错长这样：`Error: Cannot find module '@/content/pure-markdown.mdx'`

**坑 2：用 `@/` 别名，不要用相对路径**

```tsx
await import(`../../../content/${slug}.mdx`)   // ❌ 相对深度在不同页面里不一样，极易算错
await import(`@/content/${entry.file}`)        // ✅ 稳定
```

**坑 3：加文章后需要重新 build**

目录扫描发生在**构建期**（`generateStaticParams`），所以 `/posts` 与 `/posts/<slug>`
在构建产物里都是 `○ Static`。想「加完文章立刻可见」有两条路：

| 做法 | 效果 | 代价 |
|---|---|---|
| `await connection()` | 变成动态渲染，每次请求都扫目录 | 首屏变慢 |
| `"use cache"` + `cacheTag("posts")` + `revalidateTag("posts")` | 静态 + 按需失效 | 多写一点代码 |

本仓库保持**纯静态**（博客最常见的形态）。

### 11.4 元数据：为什么用 `export const metadata` 而不是 YAML frontmatter

`.mdx` 文件里可以写 ESM 导出，Next 会当成标准的 `metadata` 处理并自动写进 `<head>`：

```mdx
export const metadata = {
  title: "第一篇文章：用 MDX 写博客",
  date: "2026-10-30",
  excerpt: "把写好的 .mdx 文件丢进 content/ 目录，它就变成了一篇文章。",
};

# 你好，MDX

正文……
```

> `@next/mdx` **不解析 YAML frontmatter**（`---` 包裹的那种）。
> 要用 YAML 得自己加 remark 插件。本仓库选择用 MDX 原生的 ESM 导出：
> 类型安全、自动进 `<head>`、零额外依赖。

### 11.5 MDX 组件定制（`mdx-components.tsx`）

MDX 编译时会把文章里用到的**标签名**交给映射表：

```tsx
import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/mdx/Callout";

const components: MDXComponents = {
  h1: (props) => <h1 className="mb-3 mt-8 text-2xl font-bold" {...props} />,
  a: ({ href = "", children, ...props }) => (/* 站内/站外链接分别处理 */),
  Callout,        // ← 登记后文章里就能直接写 <Callout type="warn">…</Callout>
};

export function useMDXComponents(): MDXComponents {
  return components;
}
```

效果（`content/hello.mdx` 里直接写，不用 import）：

```mdx
<Callout type="info" title="这是自定义组件">
  文章作者不需要 import 任何东西。
</Callout>
```

### 11.6 验证入口

| 地址 | 看什么 |
|---|---|
| <http://localhost:3000/posts> | 列表页 —— 自动列出 `content/` 下所有文章 |
| <http://localhost:3000/posts/hello> | `.mdx` 文章（支持 JSX、自定义组件） |
| <http://localhost:3000/posts/pure-markdown> | 纯 `.md` 文章 |
| <http://localhost:3000/mdx-page> | 仓库原有的单文件 MDX 页面（模式 A 的例子） |

```bash
# 验证构建产物形态
pnpm build 2>&1 | grep -A3 posts
# ├ ○ /posts
# ├   /posts/[slug]
# │ ├ ◐ /posts/[slug]
# │ ├ ○ /posts/hello
# │ └ ○ /posts/pure-markdown
```

> ⚠️ 顺带印证了第 [4.27](#427-实测坑点ppr-模式下-notfound-返回-200) 节那个坑：
> 访问不存在的 `/posts/xxx` 会返回 **200** 而不是 404 —— 因为 `/posts/[slug]` 是
> `◐` PPR 壳子，响应已开始流式输出，状态码就锁定了。详见 [第 06 课](doc/06_错误边界与404状态码.md)。

---

> 本文档由架构视角梳理，目标是把"能跑的代码"翻译成"能讲清楚的知识"。仓库本身是实验田 —— 你改任何一个约定文件，都能在浏览器里立刻看到 Next.js 的反应，这是它最大的价值。




