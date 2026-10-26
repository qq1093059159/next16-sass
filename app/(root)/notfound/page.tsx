import { notFound } from "next/navigation";

/**
 * 【坑点 A】静态预渲染路由里调用 notFound()。
 *
 * 实测（干净的生产实例，curl -I）：
 *   HTTP/1.1 200 OK
 *   x-nextjs-cache: HIT
 *   Cache-Control: s-maxage=31536000
 *
 * 现象：页面【看起来】是 404 界面，但 HTTP 状态码是 200。
 * 原因：整条路由在构建期就被预渲染成了静态产物，404 界面被固化进这个产物，
 *      于是它以「一个正常的缓存页面」被返回 —— 搜索引擎会把它当正常页收录。
 *
 * 对照组：/notfound-dynamic（加了 connection() 也仍然是 200，原因见该页）
 */
export default function NotFoundStaticDemo() {
  // 构建期就能确定「内容不存在」→ 构建期就抛出 404
  const postId = "";

  if (!postId) {
    notFound();
  }

  return <div>永远不会渲染到这里</div>;
}
