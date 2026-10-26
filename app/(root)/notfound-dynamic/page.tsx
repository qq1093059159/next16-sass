import { connection } from "next/server";
import { notFound } from "next/navigation";

/**
 * 【坑点 B】加了 connection() 之后，状态码【依然】是 200。
 *
 * 实测（干净的生产实例，curl -I）：
 *   HTTP/1.1 200 OK
 *   x-nextjs-prerender: 1
 *   x-nextjs-postponed: 1     ← PPR 壳子已随首字节发出
 *
 * 很多人以为「先 await connection() 再 notFound()」就能拿到 404 —— 不能。
 *
 * 真正的规则（Next 官方口径）：
 *   - 响应【尚未开始流式输出】时调用 notFound() → 框架可以把状态码设成 404；
 *   - 响应【已经开始流式输出】（预渲染壳子 / PPR 壳子已发出）→ 状态码锁定 200，
 *     404 界面只能作为后续流内容追加进去。
 *
 * 在 Cache Components（PPR）模式下，几乎所有页面路由都会先输出一个预渲染壳子，
 * 所以页面里的 notFound() 基本都会得到 200 + 404 界面。
 *
 * ✅ 唯一稳定拿到 404 的场景：框架级「路由未匹配」
 *    → curl -I http://127.0.0.1:3000/no-such-route  返回 404
 *
 * ✅ 依赖状态码的业务场景：在 Route Handler 里显式返回 404
 *    （见 app/api/notfound/route.ts）
 */
export default async function NotFoundDynamicDemo() {
  // 声明动态渲染：让这一段等真实请求来了再算
  await connection();

  // 模拟：查数据库后发现记录不存在
  const postId = "999";

  if (postId === "999") {
    notFound();
  }

  return <div>永远不会渲染到这里</div>;
}
