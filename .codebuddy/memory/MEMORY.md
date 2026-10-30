# 项目长期记忆 (MEMORY.md)

## 工作流约定（用户明确要求）
- **每次改完工作区就主动 `git add` + `commit`**，不要等用户单独说才提交。
- **但不要 `git push`** —— 2026-10-26 用户明确指示「不 push 了，本地做好即可」。本仓库的 remote 是 `https://qq1093059159@github.com/qq1093059159/next16-sass.git`，本机 Git Credential Manager 只存了另一个账号（非交互环境弹不出凭据框，用它推会得到 `Permission denied 403`）。**本地提交完成即视为交付完成，不要反复尝试 push。**
- 提交范围按用户一贯偏好「全部提交」：包括文档、`.codebuddy/memory` 等项目内改动一并纳入，不留未提交项。
- 用户允许直接执行命令（含风险操作），无需反复询问确认（见 always_applied_user_rules）。

## next16-sass 项目事实
- Next.js 16 (Turbopack) + React 19 + Tailwind v4 的**教学/演示仓库**，部署目标 Vercel (github.com/qq1093059159/next16-sass)。
- `next build` 默认跑 **TypeScript 检查 + 静态预渲染**，两关都会阻断部署：
  - 页面必须是合法 React 组件（server-only 演示页 `app/serveronly/page.tsx` 的 default 导出不能是返回 Response/WebSocket 的普通函数）。
  - Route Handler 的 `params` 必须是 `Promise<{...}>`（Next 16 要求）。
  - 构建期静态预渲染**禁止硬编码 `localhost` 或依赖外部网络 fetch**：server component 应直接 import 数据源；外部 fetch 页面需 `export const dynamic = "force-dynamic"` + 容错兜底。
- 已移除 `next-auth` 与 `mysql2`（next-auth 未接线、mysql2 仅 `app/server` 演示用）；`@clerk/nextjs` 依赖仍在，会自动生成 `/sign-in/[[...sign-in]]` 占位路由（未接线，不影响构建）。
- 依赖升级策略：每个依赖**当前 major 内升最新，绝不跨 major**（避免 AI SDK 7 / Clerk 7 / TS 7 / ESLint 10 等破坏性大版本）。npmmirror 镜像无 audit 端点，故 `pnpm audit` 不可用。
- pnpm v10 需 `package.json#pnpm.onlyBuiltDependencies` 白名单（`@clerk/shared`、`unrs-resolver`），否则 `pnpm lint` 因 unrs-resolver 未构建而失败。安装收尾遇 `ERR_PNPM_SYMLINK_FAILED` 用 `pnpm install --config.safeDeleteThreshold=1000000` 解决。

## Vercel 部署
- 项目：`supercandy/next16-sass`（Vercel CLI `vercel link` 创建，team=supercandy）。`vercel env pull` 已把环境变量拉到 `.env.local`（已被 gitignore 忽略，不会误提交）。
- **GitHub 仓库连接失败**：当前 Vercel 账号对 `qq1093059159/next16-sass` 无 admin/write 权限，故 `git push` 不会自动触发部署。需在**有 GitHub 写权限的账号**下 `vercel git connect`（或 Vercel 控制台连接）才能启用 push→deploy 自动化。这是部署后首页 404 的根因（访问的是从未成功部署/回退的空项目）。
- 临时部署用 `vercel deploy --prod --yes`（CLI 直接部署，不依赖 Git 连接）。生产别名：`https://next16-sass-beta.vercel.app`。
- Next.js 16 把 `proxy.ts` 当作 middleware 文件名，且与 `middleware.ts` **互斥**（构建报 "Please use ./proxy.ts only"）。本项目所有 middleware 逻辑统一放 `proxy.ts`（含 CORS 与 `/welcome` 读 global config）。
- **本地网络无法直连 `*.vercel.app`**（curl 返回 000，疑似墙/代理限制），无法本地 curl 验证部署，需浏览器访问确认。
- `@vercel/global-config` 的 `get('greeting')` 读的是 Vercel 项目级 Global Config（不是常规 env 变量），需在 Vercel 控制台配置，否则 `/welcome` 返回 `null`。

## Cache Components（2026-10-26 已开启，本仓库硬依赖）
- `next.config.ts` 的 `cacheComponents: true` **已开启**，且**不可关闭** —— `app/mycache/CachedPart.tsx` 与 `app/(root)/ssg/[id]/page.tsx` 用了 `"use cache"`，关掉开关构建会直接报 `To use "use cache", please enable the feature flag 'cacheComponents'`。
- 开启后**段级配置全部被禁用**（构建期报错，非警告）：`export const dynamic` / `revalidate` / `dynamicParams`。
  - 替代：`await connection()`（next/server）、`"use cache"` + `cacheLife()` / `cacheTag()`。
- `revalidateTag(tag, profile)` 在 Next 16.3.8 是**两个参数**（`profile: string | {expire}`），写一个参数会报 `Expected 2 arguments, but got 1`。`updateTag(tag)` 是 Next 16 新增（只能 Server Action 内调用，实现读己所写）；`refresh()` 刷新客户端 Router Cache。
- `generateStaticParams` 在 Cache Components 下可用；`dynamicParams` 不可配置，固定为 fallback: blocking。
- 构建产物标记：`○`=全静态，`◐`=Partial Prerender（静态壳子+流式动态），`ƒ`=全动态。开启后**页面路由基本没有 `ƒ`**，全是 `○`/`◐`。

## 实测坑点（已在仓库内做成对照示例）
- **PPR 下页面里 `notFound()` 返回 HTTP 200**（页面是 404 界面但状态码是 200，SEO 不友好）。已验证 `/notfound`（○静态）与 `/notfound-dynamic`（◐ PPR + `await connection()`）**都是 200** —— 加 connection() 救不回来。根因是响应一开始流式输出（预渲染壳子已发首字节），状态码就锁定 200。
  - 稳定拿到 404 只有两条路：① 框架级「路由未匹配」；② Route Handler 显式 `new Response(..., {status:404})`（示例 `app/api/notfound/route.ts`）。
- `useSearchParams` 在静态预渲染页面里必须包 `<Suspense>`，否则构建报 `should be wrapped in a suspense boundary`。
- `error.tsx` 必须接 `error` / `reset` 两个 prop；`global-error.tsx` 会替换根 layout，**必须自己输出 `<html><body>`**。

## 本机环境坑（Windows / Git Bash）
- **IDE 的批量删除保护会拦截 `next build` 清理 `.next`**（报 `SAFE_DELETE_BULK_CONFIRM_REQUIRED`，count=500）。解决：命令前加 `CODEBUDDY_SAFE_DELETE_ENABLED=0`。
- `git push` 到 `qq1093059159/next16-sass` **无法自动完成**：remote URL 里内嵌了用户名 `qq1093059159`，而本机 Git Credential Manager 只存了另一个账号（`1256807020`），用它推会得到 `Permission denied ... 403`。非交互环境无法弹窗输入凭据 → 需用户手动 push 或先配置该账号凭据。
- Git Credential Manager 弹出 **"TLS certificate verification has been disabled!"** 警告 —— 该仓库 git 配置关掉了 TLS 证书校验，属于安全隐患，建议开启。
- Git Bash 的 `/tmp` 实际是 `C:\Users\Administrator\AppData\Local\Temp`，但 **Windows Python 解析 `/tmp/xxx` 会当成 `C:\tmp\xxx`**（FileNotFoundError）。跨 bash/python 传临时文件路径时必须用 `cygpath -w` 转换。
- `write_to_file` 工具偶发报 `missing required argument filePath`（参数校验抖动），连续重试即可成功；大批量写文件改用 `cat > file <<'EOF'` heredoc，注意单条命令不能超过 8000 字节。

## 文档规范（本仓库唯一说明文档 = README.md）
- **只有 README.md 一份项目说明文档**。旧的 `项目分析.md`（2026-09-15 静态快照）已于 2026-10-26 合并删除 —— 信息过时且与 README 重复。
- README 结构（2026-10-26 重构后）：速览(30秒) → 目录导航 → 一~九章，第四章「核心知识点详解」27 个小节是主体。
- **写 Markdown 标题不要用 emoji**：`⚠️` 的 U+FE0F 会进入 GitHub 锚点，极脆。§4.27 已清理。
- **锚点校验必须用官方 github-slugger**，不要自制简化算法：`npm pack github-slugger@2` 取 `slug()` 复算；GitHub 规则是连续空格**逐个**转连字符、CJK 标点删除、下划线保留、重复标题追加 `-1`。

## MDX / 内容目录（2026-10-30 建立，本仓库已跑通）
- `next.config.ts` **已启用** `createMDX({ extension: /\.(md|mdx)$/ })` + `pageExtensions` 含 md/mdx。
  关掉开关构建会报 `To use "use cache"…` 类错误（因 `app/(root)/ssg/[id]` 用了 `"use cache"`）。
- **Turbopack 硬限制**：`@next/mdx` 的 `options` 必须**可序列化** → 插件**只能用字符串包名**
  （`'remark-gfm'`），传 import 进来的函数会报
  `does not have serializable options`。插件**选项**也不能含回调函数。这是 Next 官方文档要求。
- **`remark-mdx-frontmatter` 的 `name` 不能填 `metadata`** —— 该插件无条件注入导出，
  没有 frontmatter 的文件也会生成 `export const metadata = {}`，
  与手写同名导出撞名报 `Variable name conflict: metadata`。用 `name: 'frontmatter'` 再由 JS 层合并。
- **元数据三条来源**（优先级）：YAML frontmatter → 手写 `export const metadata` → 同名 `.json` 旁路。
  **frontmatter 是主流写法**，`.md` 与 `.mdx` 通用 —— 因为 frontmatter 属 remark 插件层，
  与 MDX 语法层无关。`.md` 只**不支持 JSX 与手写 ESM 导出**。
  ⚠️ 2026-10-30 早先的结论「`.md` 必须用 `.json` 旁路」**已被插件链实测推翻并修正**。
- 详情页必须走 `lib/posts.ts` 的 `getPostMeta()` 合并，**不能**直接用 `import()` 出来的 `metadata`
  （frontmatter 被编译成 `export const frontmatter`，不是 `metadata`）。
- 分类目录：`content/<分类>/` 自动成为分类（零配置），路由必须用 `[...slug]`（catch-all，
  `params.slug` 是 `string[]`），分类页在 `app/category/[category]/`。
- `fs.readdirSync(dir, { recursive: true })` 在 **Windows 返回反斜杠路径**，
  必须 `.split(path.sep).join("/")`，否则 import key 对不上 context map → `Cannot find module`。
- 本仓库已装插件链：`remark-gfm` `remark-frontmatter` `remark-mdx-frontmatter`
  `rehype-slug` `rehype-pretty-code` `shiki` `gray-matter`。

## MDX 生态现状（2026-10-30 核实，npm 实测）
- `contentlayer` **已死**（最后发布 2023-07-31）→ 用 `velite`（0.4.0，2026-06 活跃）替代。
- `next-mdx-remote`（6.0.0，2026-02 后停更，HashiCorp archive）→ 用 `next-mdx-remote-client`
  （2.1.12，2026-08 活跃，本仓库已装）。
- `fumadocs-core` 16.17.9 / `nextra` 4.6.1 —— 文档站框架，版本号跟 Next 对齐（活跃）。
- `@next/mdx` npm 最新 16.4.3（本仓库装 ^16.1.3，可升）。

## 主题（亮/暗模式）实现约定（2026-10-30 定，勿引入 next-themes）
- **零第三方依赖**：自实现 `lib/theme.ts`（applyTheme / setTheme / toggleTheme /
  themeInitScript）+ `components/theme/ThemeScript.tsx` + `ThemeToggle.tsx` + `DarkMode.tsx`。
- **机制三层**：CSS 两套变量（`:root` / `.dark`）+ `applyTheme()` 打 class +
  `<head>` 内联脚本防闪烁。`<html>` 必须 `suppressHydrationWarning`。
- **铁律：主题状态不存 React state**。服务端读不到 localStorage，`useState` 与
  `useSyncExternalStore` 都会 hydration mismatch（后者 getSnapshot 首帧即返回真实值）。
  → 图标双份都在 DOM 靠 CSS `scale/rotate` 切换；菜单当前项靠
  `:root[data-theme]` / `[data-theme-pref]` 选择器画 ✓。
- CSS 变量**必须** `.dark` 类驱动，不能写 `@media (prefers-color-scheme: dark)`
  （那样手动切换无效）。
- 排查「组件能渲染但点了没反应」的第一步：确认 React 有没有 hydrate ——
  `Object.keys(document.querySelector('button')).filter(k=>k.startsWith('__react'))` 为空即未 hydrate。
  常见原因：dev 用 `127.0.0.1` 访问被 Next 拦截 dev 资源 → 需 `allowedDevOrigins` 或用 `localhost`。

## 仓库结构（重要）
- **`web/` 是独立的 git 仓库**（有自己的 `.git`），被主仓库 `.gitignore` 忽略 ——
  主仓库保留一份供对照/回迁。**两边的改动必须分别提交**。
- 主仓库 `content/` + `lib/posts.ts` + `app/posts/` 本身就是「内容引擎基座」本体，
  `web/` 只是它的独立可运行实例。

## Cache Components 下的硬约束（2026-10-30 实测，勿踩）
- 开了 `cacheComponents` 后，`params` / `searchParams` / `cookies()` / `headers()`
  **必须在 `<Suspense>` 内读取** → 否则整条路由无法预渲染，报
  `Next.js encountered runtime data during prerendering`（Blocking Route）。
- 标准写法：**页面组件不 await params**，只把 Promise 往下传，
  真正 await 的 async 子组件放进 `<Suspense>` 内部；配同宽骨架屏防布局跳动。
- ⚠️ **build 能过、dev 才报错** —— dev 还要渲染「任意参数」的兜底版本。
  验证必须访问一个 `generateStaticParams` 里**没有**的参数（如 `/tags/zzz`）。
- 副作用：加 Suspense 后，枚举外参数的 **404 状态码变 200**（PPR 壳子锁定状态码，
  与第 06 课同一个坑）。

## 布局约定（2026-10-30 定）
- **内容站页面统一 100% 满宽**：页面容器一律去掉 `mx-auto` + `max-w-*`，只留 padding。
  涉及 posts / tags / category / author / search / archive / 详情页 / 404。
- **例外**：主仓库 `app/(root)/` 下的教学演示页与教学首页保持 `max-w-2xl` 居中 ——
  它们是逐个知识点的独立演示页，与内容站页面定位不同，不要一起改。
- 头部导航与页脚同样满宽（`app/layout.tsx` 里去掉 `mx-auto max-w-6xl`）。
