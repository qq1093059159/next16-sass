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
