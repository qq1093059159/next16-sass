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
