"use client";

import { useEffect } from "react";

/**
 * 段级错误边界。
 *
 * 硬性规则：
 *  1. 必须是 "use client" —— 错误边界要靠 state / 事件处理函数工作；
 *  2. 会接收两个 prop：
 *       error —— 抛出的错误对象（服务端错误会带 digest 哈希，不泄露堆栈）
 *       reset —— 重新渲染该段的按钮回调
 *  3. 它只捕获【同级及以下】的错误；根级错误要用 global-error.tsx。
 *
 * 捕获顺序（就近原则）：
 *   app/global-error.tsx  →  兜底
 *   app/(root)/error.tsx  →  (root) 路由组内
 *   app/basic/error.tsx   →  basic 段内
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报到日志系统（生产环境换成 Sentry 之类）
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-red-600">段级错误边界</h1>
      <p className="mt-2 text-sm opacity-70">
        这一段（(root) 路由组）里发生了错误，页面被替换成了这个错误界面。
      </p>
      <p className="mt-4 rounded-md bg-red-50 p-3 font-mono text-xs dark:bg-red-950">
        {error.message}
        {error.digest ? ` (digest: ${error.digest})` : ""}
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        重试
      </button>
    </div>
  );
}
