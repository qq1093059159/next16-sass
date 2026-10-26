import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

/**
 * 静态生成（SSG）+ 增量静态再生（ISR）示例。
 *
 * 三个知识点：
 *  1. generateStaticParams —— 构建期为动态路由【预渲染】出哪些具体路径；
 *  2. dynamicParams —— 运行时访问未预生成的路径时，是实时渲染（true）还是直接 404（false）；
 *  3. "use cache" + cacheLife —— 决定这些静态页面多久过期一次（ISR）。
 */

const posts = [
  { id: "1", title: "第一篇：App Router 入门", body: "约定文件就是路由。" },
  { id: "2", title: "第二篇：缓存模型全景", body: "use cache / connection() 两分天下。" },
  { id: "3", title: "第三篇：流式渲染", body: "Suspense 让首屏不再干等。" },
];

/**
 * 构建期执行：告诉 Next 哪些 id 需要被静态生成。
 */
export function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));
}

/**
 * dynamicParams 在 Cache Components 模式下【不可配置】：
 *   开启 cacheComponents 后，Next 16 会报
 *   Route segment config "dynamicParams" is not compatible with nextConfig.cacheComponents。
 *   实际行为固定为 fallback: blocking —— 访问没预生成的路径时，运行时按需生成（而不是 404）。
 *   如果确实要「路径必须来自数据库」，请关掉 cacheComponents 再用 dynamicParams = false。
 */

/**
 * 取数函数带 "use cache" → 这条数据会被缓存。
 * cacheLife 三段语义：
 *   stale: 30     客户端在 30s 内可无网络验证地直接用旧值
 *   revalidate: 60 服务端 60s 内可返回旧值，但后台会重算
 *   expire: 3600  超过 1h 必须重新计算
 */
async function getPost(id: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag(`post-${id}`);
  return posts.find((post) => post.id === id);
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  // 找不到就抛 404 —— 由 app/not-found.tsx 接管
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl p-6">
      <p className="text-xs opacity-60">id = {id}</p>
      <h1 className="mt-1 text-2xl font-bold">{post.title}</h1>
      <p className="mt-3">{post.body}</p>

      <div className="mt-8 rounded-lg border border-violet-300 bg-violet-50 p-4 text-sm dark:border-violet-700 dark:bg-violet-950">
        <h2 className="font-semibold">本页在做什么</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            构建期：<code>generateStaticParams()</code> 返回了 {posts.length}{" "}
            条路径，它们被预渲染为静态 HTML。
          </li>
          <li>
            运行时：<code>dynamicParams=true</code>，所以 <code>/ssg/999</code>{" "}
            也能打开（数据不存在 → 触发 <code>notFound()</code> → 404）。
          </li>
          <li>
            过期策略：<code>cacheLife</code> 设定 stale 30s / revalidate 60s /
            expire 1h，这就是 ISR 的「增量静态再生」。
          </li>
        </ul>
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        {posts.map((p) => (
          <Link key={p.id} href={`/ssg/${p.id}`} className="underline">
            /ssg/{p.id}
          </Link>
        ))}
        <Link href="/ssg/999" className="underline opacity-60">
          /ssg/999（未预生成）
        </Link>
      </div>
    </article>
  );
}
