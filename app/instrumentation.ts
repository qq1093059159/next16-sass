import type { InstrumentationOnRequestError } from "next/dist/server/instrumentation/types";

/**
 * app/instrumentation.ts —— 约定文件，服务启动时执行一次。
 *
 * 两个导出：
 *  - register()            服务启动钩子（每个 runtime 各执行一次）
 *  - onRequestError(...)   服务端错误钩子（出错的请求都会走这里）
 *
 * 典型用途：APM 探针注册（OpenTelemetry / Sentry）、全局错误上报。
 *
 * 注意：register() 里要区分 runtime ——
 *   process.env.NEXT_RUNTIME === "nodejs"  → Node.js runtime
 *   process.env.NEXT_RUNTIME === "edge"    → Edge runtime
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[instrumentation] 服务已启动 · Node.js runtime");
  } else if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[instrumentation] 服务已启动 · Edge runtime");
  }
}

/**
 * 服务端报错时统一上报。
 * 在这里打点，就能拿到「哪条路由、什么方法、什么错误」三元组。
 */
export const onRequestError: InstrumentationOnRequestError = (
  error,
  request,
  context,
) => {
  console.error(
    `[onRequestError] ${request.method} ${request.path} | ` +
      `routeType=${context.routeType} renderSource=${context.renderSource ?? "-"}`,
  );
  console.error(error);
};
