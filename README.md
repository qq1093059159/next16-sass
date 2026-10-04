# next16-sass · Next.js 16 全栈实验室

> 一个把 **Next.js 16 App Router 全部核心机制跑一遍**的教学型仓库。
> 不是业务脚手架，而是一份**可点击验证的知识图谱** —— 每个目录就是一个知识点的最小可运行样本（Minimum Runnable Demo），并且大量样本被刻意做成**两两对照组**，让你亲手体会差异，而不是读文档想象。
>
> 技术底座：**Next.js 16.3.8 + React 19.3.0 + Tailwind CSS v4 + TypeScript 5**，并预置了 **AI SDK 6 / DeepSeek / Clerk** 的接线位。

---

## 目录导航

| 章节 | 内容 | 适合谁 |
|---|---|---|
| [一、项目定位与技术栈](#一项目定位与技术栈) | 这仓库是什么、不是什么；依赖分层清单 | 所有人 |
| [二、5 分钟跑起来](#二5-分钟跑起来) | 环境要求、启动、环境变量、MySQL、踩坑表 | 第一次 clone 的人 |
| [三、路由全景地图](#三路由全景地图) | 目录树 + URL 对照表 + 三个对照组 | 想快速知道「去哪看什么」 |
| [四、核心知识点详解](#四核心知识点详解) | 15 个主题逐个拆解（**本文主体**） | 系统学习 App Router |
| [五、AI 能力专区](#五ai-能力专区) | AI SDK 6 / DeepSeek 接线现状与补全方案 | 想接 AI 的人 |
| [六、next.config.ts 逐项拆解](#六nextconfigts-逐项拆解) | 每个配置项在干什么 | 配置调优 |
| [七、架构师 Review：已知问题与 TODO](#七架构师-review已知问题与-todo) | 10 个真实缺陷清单 | 想把它改造成生产基座 |
| [八、7 天学习路径](#八7-天学习路径) | 按依赖顺序排的学习路线图 | 新手 |
| [九、速查附录](#九速查附录) | 约定文件表、初始化备忘、http 调试 | 日常查阅 |

---

## 一、项目定位与技术栈

### 1.1 它是什么

一个 **"路由约定实验田"**。仓库用 30+ 个路由目录，把 App Router 的每一条约定文件规则、每一种路由符号、每一层缓存策略都做成了可运行样本。

### 1.2 它不是什么

明确边界，避免误用：

- ❌ **不是生产级 SaaS 模板** —— 路由守护写在 `useEffect`、鉴权采用 Clerk（备份未接线）+ Server Actions 双演示，均为教学便利让路
- ❌ **不是最佳实践范本** —— 代码中多处自带「仅供演示 非最佳实践」注释
- ✅ **是 Next.js 16 特性地图 + 反模式对照表** —— 连"坑"都给你准备好了，见[第七章](#七架构师-review已知问题与-todo)

### 1.3 技术栈全景

```text
┌─ 运行时 ────────────────────────────────────────────────┐
│  next 16.1.1   ·   react 19.2.3   ·   react-dom 19.2.3    │
│  typescript 5  ·   eslint 9 (Flat Config)                │
└──────────────────────────────────────────────────────────┘
┌─ 编译 / 构建 ────────────────────────────────────────────┐
│  Turbopack (dev 默认)  ·  SWC  ·  Babel React Compiler    │
│  @tailwindcss/postcss 4 (CSS-first 配置)                  │
└──────────────────────────────────────────────────────────┘
┌─ 样式 / UI ──────────────────────────────────────────────┐
│  tailwindcss 4  ·  @tailwindcss/typography                │
│  tw-animate-css  ·  shadcn/ui (new-york / RSC)            │
│  @radix-ui/react-slot  ·  @radix-ui/react-dropdown-menu   │
│  class-variance-authority  ·  clsx  ·  tailwind-merge      │
│  lucide-react  ·  next-themes (暗黑模式)                  │
└──────────────────────────────────────────────────────────┘
┌─ 数据 / 校验 ────────────────────────────────────────────┐
│  zod 4.3                                                  │
└──────────────────────────────────────────────────────────┘
┌─ 鉴权 ──────────────────────────────────────────────────┐
│  @clerk/nextjs 6.36  (备份方案，未接线)                   │
└──────────────────────────────────────────────────────────┘
┌─ AI ────────────────────────────────────────────────────┐
│  ai 6.0  ·  @ai-sdk/react 3  ·  @ai-sdk/deepseek 2.0      │
│  ⚠️ app/api/chat/route.ts 为占位 501（待实现），见第五章      │
└──────────────────────────────────────────────────────────┘
┌─ 内容 ──────────────────────────────────────────────────┐
│  @next/mdx · @mdx-js/loader · @mdx-js/react               │
│  next-mdx-remote-client · @types/mdx                      │
└──────────────────────────────────────────────────────────┘
```

### 1.4 三个值得注意的版本信号

| 信号 | 说明 |
|---|---|
| **Next 16 + React 19.2** | 踩在最前沿。`"use server"` / `useActionState` / Server Actions / Suspense 流式全部是一等公民 |
| **ESLint 9 Flat Config** | 用 `eslint.config.mjs` 而非 `.eslintrc`。Next 16 把 preset 拆成了 `core-web-vitals` 和 `typescript` 两个具名入口 |
| **Tailwind v4** | **没有 `tailwind.config.js`**。全部配置搬进 `app/globals.css`，见 [4.13](#413-样式体系-tailwind-v4-css-first) |

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
# ── Clerk（当前未接线，仅备份示例） ────────────────
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
│   ├── layoutBackup.tsx        ← 【非活跃】Clerk Provider 示例
│   │
│   ├── (auth)/                 ← 路由组：登录演示（不进 URL）
│   │   ├── mylogin/            · 传统 fetch('/api/login') + router.push
│   │   ├── serverlogin/        · Server Action + FormData + .bind()
│   │   └── serverzodlogin/     · useActionState + Zod 校验 ★最推荐
│   │
│   ├── (dashboard)/            ← 路由组：后台（不进 URL）
│   │   └── dashboard/
│   │       ├── layout.tsx      · 嵌套布局
│   │       ├── analytics/      · 普通路由（≠ @analytics slot！）
│   │       └── users/[id]/     · 动态路由 + generateMetadata
│   │
│   ├── (root)/                 ← 路由组：主站（接管根路径 /）
│   │   ├── layout.tsx          · 挂载 Navbar
│   │   ├── page.tsx            · 首页：Link / useRouter / Script 全家桶
│   │   ├── error.tsx           · 段级错误边界
│   │   ├── home/               · useEffect 客户端守卫（反模式）
│   │   ├── about/              · 最简服务端组件
│   │   ├── albums/             · async RSC 直接 fetch
│   │   ├── books/              · RSC 调用自己的 Route Handler
│   │   ├── sign-in/[[...sign-in]]/ · 可选 catch-all（Clerk）
│   │   └── pageBackup.tsx      · 【非活跃】Clerk auth()/currentUser()
│   │
│   ├── @analytics/             ← 平行路由 slot ←┐
│   │   ├── page.tsx                             ├ page 与 default 必须成对
│   │   └── default.tsx                          ←┘
│   ├── @team/                  ← 平行路由 slot
│   │   ├── page.tsx
│   │   └── default.tsx
│   │
│   ├── api/                    ← Route Handlers
│   │   ├── db.ts               · 内存假数据（模块级数组）
│   │   ├── books/route.ts      · GET
│   │   ├── books/[id]/route.ts · PUT / DELETE（旧 params 写法）
│   │   ├── user/route.ts       · GET / POST（NextRequest 全解析）
│   │   ├── user/[id]/route.ts  · GET（Promise params 新写法）
│   │   ├── login/route.ts      · cookies() 读写 + httpOnly
│   │   ├── chat/route.ts       · ⚠️ 空文件
│   │   └── register/route.ts   · ⚠️ 空文件
│   │
│   ├── basic/                  ← 约定文件实验室
│   │   ├── layout.tsx          · 状态保持（切路由不重置）
│   │   ├── template.tsx        · 状态归零（切路由重挂载）★对照组
│   │   ├── loading.tsx  error.tsx
│   │   ├── a/  b/              · a 慢 5s 触发 loading；b 立即返回
│   │   └── redirect.tsx  permanentRedirect.tsx · 全注释文档
│   │
│   ├── client/                 · "use client" 执行时机实验
│   ├── serveronly/             · server-only 编译期约束
│   ├── mycache/                · 缓存四手段（注释密度最高）★
│   ├── mysuspense/             · connection() + Suspense 流式
│   ├── myimage/                · next/image 三形态 + sizes
│   ├── env/                    · 环境变量可见性
│   ├── mdx-page/page.mdx       · MDX 即页面
│   ├── slug/[id]/              · 单段动态路由
│   ├── slug/[...id]/           · catch-all
│   └── slugs/[[...id]]/        · 可选 catch-all
│
├── components/
│   ├── DarkMode.tsx            · next-themes + shadcn Dropdown
│   ├── MyComponent.tsx         · "use cache" 指令占位 demo
│   ├── navigation/navbar/      · 服务端壳包客户端岛 ★最佳实践形态
│   └── ui/                     · shadcn: button / input / dropdown-menu
├── lib/
│   ├── actions.ts              · 全项目唯一 'use server' 文件 ★
│   └── utils.ts                · cn() = clsx + tailwind-merge
├── context/Theme.tsx           · next-themes Provider 二次封装
├── proxy.ts                    ← Next 16 新命名（原 middleware.ts）★
├── proxyBackup.ts              · 【非活跃】Clerk middleware
├── mdx-components.tsx          · MDX 全局组件映射约定
├── data.json                   · 本地示例数据（原 `/server` 页读取，该页已移除）
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
| `/dashboard` | `(dashboard)/dashboard/...` | 路由组 + 嵌套布局 |
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
| `layout.tsx` | 布局外壳，**不随导航重挂载** | `app/layout.tsx`、`(dashboard)/dashboard/layout.tsx`、`basic/layout.tsx` | 根 layout **必须**含 `<html><body>` |
| `template.tsx` | 布局外壳，**每次导航重新挂载** | `basic/template.tsx` | 与 layout 只差这一点 |
| `page.tsx` | 路由页面本体 | 到处都是 | 一个目录只能有一个；只有 `page` 才对外可见 |
| `loading.tsx` | Suspense 边界 | `app/loading.tsx`、`basic/loading.tsx` | 自动包 `<Suspense fallback>` |
| `error.tsx` | 段级错误边界 | `(root)/error.tsx`、`basic/error.tsx` | **必须是 `"use client"`** |
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
> 平行路由有一个反直觉行为：
> - **硬刷新 / 直接输入 URL** → Next 找不到 slot 匹配，走 **`not-found`**
> - **软导航（`<Link>` 点击）** → Next 保留上一次 slot 状态；若从未有过，则渲染 **`default.tsx`**
>
> 缺了 `default.tsx`，用户点链接进来就会 404。这是平行路由最高频的线上事故。`app/default.tsx`、`@team/default.tsx`、`@analytics/default.tsx` 三个文件共同构成完整兜底链。

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
// ❌ 旧写法（本项目 api/books/[id]/route.ts 里还有残留）
export async function PUT(request: Request, context: { params: { id: string } }) {
  const id = +context.params.id;   // ← 没有 await，是旧写法对照
}
```

本项目两种写法并存，正好是**版本演进的活化石**。

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
  const data = fs.readFileSync("data.json", "utf-8");
  // ...
}
```

> ⚠️ 两个反模式，生产禁用：① 连接池写在模块顶层且硬编码凭据；② `fs.readFileSync("data.json")` 用相对路径，依赖进程 CWD —— 部署到 Serverless/容器环境会直接失败。

**证据三：`serveronly/page.tsx` —— 编译期就把误用打死**

```tsx
import "server-only";
export default function ServerOnly(type: 0 | 1) {
  if (type === 0) { return fetch("https://api.github.com"); }
  else { return new WebSocket("wss://api.github.com"); }
}
```

只要任何 `"use client"` 组件 `import` 它，**构建立刻失败**，而不是等到运行时才报错。`server-only` 包本身不含逻辑，纯粹是一句话报错，用来把「不该跨边界的东西」锁死在服务端。

> 配套还有 `client-only` 包，反之亦然。

**最佳实践形态**请看 `components/navigation/navbar/index.tsx` —— **服务端壳 + 客户端岛**：

```tsx
// 服务端组件（无 "use client"）
import Image from "next/image";
import { ModeToggle } from "@/components/DarkMode";   // ← 客户端岛
export default function Navbar() {
  return (
    <nav>
      <Image src="/globe.svg" width={23} height={23} alt="logo" />
      <ModeToggle />    {/* ← 只有这一小块 JS 会被打包下发 */}
    </nav>
  );
}
```

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

> **`connection()` 是 Next 16 的新 API**：显式告诉框架「从这里开始依赖真实请求，别预渲染我」。过去靠读取 `cookies()` / `headers()` 隐式触发动态渲染，现在有了显式的表达手段。

**层次三：三种边界的分工**

| 边界 | 触发方式 | 粒度 | 客户端？ |
|---|---|---|---|
| `loading.tsx` | 约定文件 | 整个路由段 | 否（服务端） |
| `<Suspense>` | 手写 React API | 任意子树 | 否 |
| `error.tsx` | 抛异常 | 整个路由段 | **是** |

### 4.7 Next 16 缓存体系：四种互斥手段

`mycache/page.tsx` 是全仓库**注释密度最高**的文件，一页内把缓存的全部开关陈列出来（大部分注释掉，方便你逐条开实验）：

```tsx
import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
// import { cacheLife } from "next/cache";

// 使用revalidate属性，可以设置缓存时间，单位为秒
// export const revalidate = 5; // 5秒后重新更新

// 使用dynamic属性，并且设置为force-dynamic，表示将禁用缓存，每次请求都会重新获取数据
export const dynamic = "force-dynamic"; // 动态更新 缓存组件不需要使用这个 默认都是动态内容
//export const revalidate = 0 // 设置为0表示不缓存

const DynamicContent = async () => {
  // ("use cache");
  // cacheLife("hours"); //使用预设参数
  //cacheLife({stale: 30, revalidate: 1, expire: 1}) //使用自定义参数
  const data = await fetch("https://www.mocklib.com/mock/random/name");
  const cookieStore = await cookies(); //获取cookie
  await connection();
  // 使用cache属性，并且设置为no-store，表示将禁用缓存，每次请求都会重新获取数据
  const randomImage = await fetch("https://www.loliapi.com/acg/pc?type=json", { cache: "no-store" });
  // ...
};
```

**四层手段速查**：

| 层级 | 手段 | 作用域 | 适用场景 |
|---|---|---|---|
| ① **段级** | `export const revalidate = N` | 整个路由段 | ISR，N 秒后后台再生成 |
| ② **段级** | `export const dynamic = 'force-dynamic'` | 整个路由段 | 彻底禁用缓存（**本文件当前生效**） |
| ③ **fetch 级** | `fetch(url, { cache: 'no-store' })` | 单个请求 | 精确控制某一条请求 |
| ③' **fetch 级** | `fetch(url, { next: { revalidate: N, tags: [...] } })` | 单个请求 | 配合 `revalidateTag()` 按需失效 |
| ④ **组件级** | `"use cache"` + `cacheLife()` / `cacheTag()` | 单个组件/函数 | **Cache Components**（Next 16 主打） |

**`cacheLife` 的三段语义**（Next 16 新模型）：

```tsx
"use cache";
cacheLife({
  stale: 30,      // 客户端可无网络验证地使用 30s（不发请求直接用）
  revalidate: 60, // 服务端 60s 内可返回旧值，但后台重算
  expire: 3600,   // 硬过期：超过 1h 必须重新计算
});
```

预设值：`cacheLife("seconds" | "minutes" | "hours" | "days" | "weeks" | "max")`。

> **开启方式**：`"use cache"` 需要 `next.config.ts` 里 `cacheComponents: true`。本项目设为 `false`，所以 `components/MyComponent.tsx` 里的 `'use cache'` 当前**不会生效**，只是占位演示。

### 4.8 Server Actions 演进链：7 个页面的完整教学路径

`(auth)/` 目录下的 7 个登录页构成了一条**从传统到现代**的演进路线：

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
// //如果没有定义OPTIONS方法，则Next.js会自动实现OPTIONS方法
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

### 4.10 鉴权：手写 Cookie 与 Clerk 备份

仓库提供两套鉴权演示，定位不同：

| 方案 | 文件 | 状态 | 说明 |
|---|---|---|---|
| **手写 Cookie** | `api/login/route.ts` + `(root)/home` | ✅ 可用(演示级) | token 硬编码 `'123456'`，仅演示流程 |
| **Clerk** | `proxyBackup.ts`、`layoutBackup.tsx` | ❌ 未启用 | 纯备份，文件名刻意绕开约定 |

> 架构师建议：手写 Cookie 仅作流程演示，**生产务必换成 Clerk 等成熟方案**，并移除本仓库已删除的 Auth.js 相关代码。详见[第七章 #1](#七架构师-review已知问题与-todo)。

### 4.11 proxy.ts：Next 16 的破坏性变更（重点）

**Next 16 官方已把 `middleware.ts` 重命名为 `proxy.ts`**，函数导出从 `middleware` 改为 `proxy`，配置类型从 `MiddlewareConfig` 改为 `ProxyConfig`。（官方文档原话：*"The middleware file convention is deprecated and has been renamed to proxy."*）

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

**① 服务端 `/api/chat`**（替换空文件）：

```ts
// app/api/chat/route.ts
import { deepseek } from "@ai-sdk/deepseek";
import { streamText, convertToModelMessages } from "ai";

export const maxDuration = 60; // 允许长推理（DeepSeek-reasoner 较慢）

export async function POST(req: Request) {
  const { messages } = await req.json();   // 前端 useChat 自动按 UIMessage 格式发
  const result = streamText({
    model: deepseek("deepseek-chat"),       // 想用推理模型换 deepseek-reasoner
    system: "你是 next16-sass 的实验助手，回答简洁、可运行。",
    messages: convertToModelMessages(messages),
  });
  // AI SDK 6：用 UIMessage 流返回，前端 useChat 可直接消费
  return result.toUIMessageStreamResponse();
}
```

**② 前端聊天面板**（新建 `app/chat/page.tsx`）：

```tsx
"use client";
import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, sendMessage, status, stop, error } = useChat({ api: "/api/chat" });
  return (
    <div className="mx-auto max-w-2xl p-4">
      {messages.map((m) => (
        <div key={m.id} className="mb-2">
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

  // ③ 缓存组件（Next 16 主打，当前关掉；开启后 "use cache" 才生效）
  cacheComponents: false,

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
| ③ | `cacheComponents` | ❌ 关 | Cache Components 总开关，开则 `"use cache"` 生效 |
| ④ | `images.*` | ✅ 配 | 图片优化白名单/格式/尺寸档位 |
| ⑤ | `output: export` | ❌ 注释 | 导出纯静态站，无服务端运行时 |
| ⑥ | `pageExtensions` | ❌ 注释 | 让 `.mdx` 成为路由页面 |

## 七、架构师 Review：已知问题与 TODO

以下 10 点是把本仓库改造成生产基座前**必须处理**的真实缺陷清单（含反模式与待办）。

| # | 问题 | 位置 | 严重度 | 修复建议 |
|---|---|---|---|---|
| 1 | 鉴权双方案并存（手写 Cookie / Clerk 备份） | `api/login`、`proxyBackup.ts` | 🟡 中 | 生产统一用 Clerk，移除手写 Cookie 演示或正式启用 Clerk |
| 2 | `proxy.ts` 曾残留 Next 15 写法 `export { auth as middleware }` | `proxy.ts` | ✅ 已修复 | 已删除该行，仅保留具名 `proxy` 导出 |
| 3 | `(dashboard)/dashboard/users/[id]` 用相对路径 `fetch('/app/blog/1')` | `users/[id]/page.tsx` | 🔴 高 | 服务端 fetch 无 base，必须用绝对 URL 或内部 import |
| 4 | 客户端守卫写在 `useEffect` 里 `redirect()` | `(root)/home/page.tsx` | 🟡 中 | 改在 `proxy.ts`（请求级）或服务端 layout 鉴权 |
| 5 | `server/page.tsx` 模块级 MySQL 连接池 + 硬编码凭据 + 相对路径读文件 | `server/page.tsx` | 🔴 高 | 改为环境变量注入、连接池放全局单例、路径用 `process.cwd()` |
| 6 | `api/books/[id]` 的 `params` 未用 Promise 写法（旧版） | `api/books/[id]/route.ts` | 🟢 低 | 改为 `params: Promise<{id:string}>` + `await` |
| 7 | `api/chat` 与 `api/register` 改为占位 501 接口（非空文件） | `api/chat`、`api/register` | 🟢 低 | 按 5.2 补全对话接口，或保留占位 |
| 8 | Clerk 依赖保留但仅作备份未接线 | `package.json` | 🟢 低 | 生产启用 Clerk（配 NEXT_PUBLIC_CLERK_*）或移除其依赖 |
| 9 | MDX 路由未真正启用（`pageExtensions` 注释） | `next.config.ts` | 🟢 低 | 需要 MDX 时取消注释并用 `withMDX()` 包裹 |
| 10 | `components.json` 配了 `"hooks": "@/hooks"` 但无 `hooks/` 目录 | `components.json` | 🟢 低 | 创建 `hooks/` 或移除该别名 |

**额外提示**：

- 本项目**没有**拦截路由（`(.)` / `(..)` 形式），只有平行路由 —— 别把两者混淆
- `MyComponent.tsx` 的 `"use cache"` 因 `cacheComponents:false` 不生效，属占位演示
- `generateStaticParams` / `revalidatePath` / `revalidateTag` 在本仓库**均未使用**，是完整知识点地图的留白，可补一个 SSG 章节

## 八、7 天学习路径

按依赖顺序排，每天啃一章、跑一遍对应路由：

| Day | 主题 | 动手实验 |
|---|---|---|
| 1 | **约定文件 + 路由组** | 跑 `/basic/a`、`/basic/b`，看 loading/error；删掉 `basic/default.tsx` 体会 404 |
| 2 | **平行路由** | 对比 `@team/page.tsx` 与 `@team/default.tsx`；删 default 看软/硬导航差异 |
| 3 | **动态路由三兄弟** | 访问 `/slug/foo`、`/slug/a/b`、`/slugs`、`/slugs/a/b`，打印 `useParams()` |
| 4 | **RSC vs Client** | 看 `client`/`server`/`serveronly` 控制台输出；让客户端 import `serveronly` 看构建失败 |
| 5 | **流式 + 缓存** | `/mysuspense`、改 `mycache` 的 `force-dynamic` ↔ `revalidate` 对比响应 |
| 6 | **Server Actions 演进** | 依次走 `mylogin` → `serverlogin` → `serverzodlogin`，体会样板代码递减 |
| 7 | **鉴权 + AI 实战** | 配 GitHub OAuth 跑通登录；按第五章把 AI 对话接上 |

## 九、速查附录

### 9.1 App Router 约定文件速查

| 文件名 | 角色 | 客户端？ | 必须含 `<html>` |
|---|---|---|---|
| `layout.tsx` | 布局 | 否(可用 use client) | 根 layout 必须 |
| `template.tsx` | 每次重挂载布局 | 否(可用 use client) | 否 |
| `page.tsx` | 页面 | 否(可用 use client) | 否 |
| `loading.tsx` | Suspense 边界 | 否 | 否 |
| `error.tsx` | 段级错误 | **是** | 否 |
| `global-error.tsx` | 全局错误 | **是** | **是** |
| `not-found.tsx` | 404 | 否(可用 use client) | 否 |
| `default.tsx` | 平行路由兜底 | 否 | 否 |

### 9.2 初始化备忘（原 README 内容，保留）

```bash
pnpm i babel-plugin-react-compiler@latest
# 在 next.config.ts 中配置 reactCompiler: true
npx shadcn@latest init
npm install -D babel-plugin-react-compiler
```

### 9.3 调试：`api.http` 用法

仓库根目录的 `api.http` 是 VS Code **REST Client** 插件（`humao.rest-client`）的请求草稿。规则：

- `#` 开头 = 注释行（**不是**请求分隔符）
- `###` = 请求之间的分隔符
- 示例：`GET http://localhost:3000/api/user/886 HTTP/1.1` 正好对应 `api/user/[id]/route.ts`

### 9.4 关键版本号

```text
next            16.1.1
react           19.2.3
react-dom       19.2.3
tailwindcss     4
zod             4.3.5
ai              6.0.39
@ai-sdk/react   3.0.41
@ai-sdk/deepseek 2.0.8
@clerk/nextjs   6.36.5
```

---

> 本文档由架构视角梳理，目标是把"能跑的代码"翻译成"能讲清楚的知识"。仓库本身是实验田 —— 你改任何一个约定文件，都能在浏览器里立刻看到 Next.js 的反应，这是它最大的价值。




