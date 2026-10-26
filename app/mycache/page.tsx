import { Suspense } from "react";
import CachedPart from "./CachedPart";
import DynamicPart from "./DynamicPart";

/**
 * 缓存知识点的「同页对照组」。
 *
 * 开启 Cache Components（next.config.ts: cacheComponents: true）后，
 * 页面默认走「部分预渲染」：静态壳子先出，动态部分流式追加。
 *
 * 旧时代写法对照（Cache Components 开启后【不可用】，构建期会直接报错）：
 *   export const dynamic = "force-dynamic";   // ❌ 与 cacheComponents 冲突
 *   export const revalidate = 5;              // ❌ 同样不再支持
 * 新时代写法：
 *   "use cache" + cacheLife() + cacheTag()    // ✅ 声明式缓存
 *   await connection()                        // ✅ 声明式动态
 */
export default async function Home() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h1>缓存 · 缓存组件 vs 动态渲染</h1>
      <p className="text-sm opacity-70">
        下面两块内容在同一张页面里，唯一差别是：上面那块声明了「use cache」，
        下面那块声明了 connection()。
      </p>

      <Suspense fallback={<div>缓存部分 Loading...</div>}>
        <CachedPart />
      </Suspense>

      <Suspense fallback={<div>动态部分 Loading...</div>}>
        <DynamicPart />
      </Suspense>

      <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm dark:border-blue-700 dark:bg-blue-950">
        <h3 className="font-semibold">Cache Components 的四层手段速查</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            <b>组件级</b>：<code>{"'use cache'"}</code> + <code>cacheLife()</code> /{" "}
            <code>cacheTag()</code>
          </li>
          <li>
            <b>请求级</b>：<code>{"fetch(url, { next: { revalidate, tags } })"}</code>
          </li>
          <li>
            <b>路径级</b>：<code>revalidatePath(&apos;/path&apos;)</code> /{" "}
            <code>revalidateTag(&apos;tag&apos;)</code>（按需失效）
          </li>
          <li>
            <b>段级（旧）</b>：<code>export const revalidate = 60</code> —— Cache
            Components 模式下已废弃
          </li>
        </ol>
      </div>
    </div>
  );
}
