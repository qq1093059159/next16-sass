/* eslint-disable react-hooks/purity */
import { connection } from "next/server";

/**
 * connection() = Next 16 显式的「进入动态渲染」开关。
 *
 * 在开启 Cache Components 之后，旧的 `export const dynamic = "force-dynamic"`
 * 已经不被允许（构建期直接报错），取而代之的就是 connection()：
 * 框架会保证这个子树在【每次请求时】才渲染，而不是在构建期预渲染。
 */
export default async function DynamicPart() {
  // 显式声明：这一段不要预渲染，等真实请求来了再算
  await connection();

  const name = `随机名字-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
      <h2 className="text-lg font-semibold">② connection() 动态渲染</h2>
      <p>名称：{name}</p>
      <p className="text-xs opacity-70">生成时间：{new Date().toLocaleString("zh-CN")}</p>
      <p className="text-xs opacity-70">
        ↻ 反复刷新本页，这个「名称」每次都变 —— 因为它绕过了缓存。
      </p>
    </div>
  );
}
