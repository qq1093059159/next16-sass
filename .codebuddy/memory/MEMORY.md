# 项目长期记忆 (MEMORY.md)

## 工作流约定（用户明确要求）
- **每次改完工作区就主动 `git add` + `commit` + `push`**，不要等用户单独说 "git push" 才推。改动完成即同步远程，保持 `origin/main` 与工作区一致。
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
