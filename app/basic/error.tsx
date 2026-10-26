"use client";

import { useEffect } from "react";

/**
 * basic 段的错误边界。
 *
 * 演示：把 app/basic/a/page.tsx 里那行 `throw new Error("错误")` 的注释打开，
 * 访问 /basic/a 就会命中这里（而不是 (root)/error.tsx）——
 * 错误边界按「最近的祖先段」生效。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[basic error boundary]", error);
  }, [error]);

  return (
    <div>
      <h1 className="text-red-600">Error（basic 段）</h1>
      <p className="mt-2 text-sm opacity-70">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-3 rounded-md border border-gray-300 px-3 py-1 text-sm dark:border-gray-700"
      >
        重试
      </button>
    </div>
  );
}
