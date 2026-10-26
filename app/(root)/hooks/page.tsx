import { Suspense } from "react";
import HooksClient from "./HooksClient";

/**
 * 客户端导航 Hooks。
 *
 * 关键点：useSearchParams 会让整页变成动态渲染，
 * 所以在静态预渲染的页面里必须用 Suspense 把它隔离出去，
 * 否则 next build 直接报错。
 */
export default function HooksPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1>客户端导航 Hooks</h1>
      <p className="mt-2 text-sm opacity-70">
        下面这些 Hook 只能在客户端组件里用；其中 useSearchParams
        必须被 Suspense 包裹，否则构建期会报错。
      </p>
      <Suspense fallback={<div>读取中...</div>}>
        <HooksClient />
      </Suspense>
    </div>
  );
}
