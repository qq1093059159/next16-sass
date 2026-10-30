import Link from "next/link";
import { getAllPostMeta } from "@/lib/posts";

/**
 * 文章列表页 —— 自动扫描 content/ 目录生成。
 *
 * 你往 content/ 里丢一个 .mdx 文件，这个列表就多一条（重新 build 后）。
 *
 * ⚠️ 构建产物形态说明：
 *   content/ 的目录扫描发生在【构建期】，所以这个页面是 ○ Static。
 *   想要「加完文章立刻可见」而不必 rebuild，有两种改法：
 *     ① 加 await connection() → 变成动态渲染（每次请求都扫目录）
 *     ② 给扫描结果打 cacheTag("posts") + 用 revalidateTag("posts") 按需失效
 *   本仓库把它保持为静态 —— 博客最常见的形态。
 */
export default async function PostsIndex() {
  const posts = await getAllPostMeta();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">文章列表</h1>
      <p className="mt-2 text-sm opacity-70">
        内容源：<code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">content/</code>
        目录下的 .md / .mdx 文件 —— 放进去即成文章。
      </p>

      <ul className="mt-8 flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-600"
            >
              <h2 className="text-lg font-semibold">{post.title}</h2>
              {post.date ? (
                <p className="mt-1 text-xs opacity-60">{post.date}</p>
              ) : null}
              {post.excerpt ? (
                <p className="mt-2 text-sm opacity-75">{post.excerpt}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-950">
        <h2 className="font-semibold">这是怎么做到的</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <code>generateStaticParams()</code> 在构建期扫描 content/，把每个文件名变成一条路由。
          </li>
          <li>
            页面里用动态 <code>{'import(`@/content/${slug}.mdx`)'}</code> 按 slug 取文件并渲染。
          </li>
          <li>
            元数据来自 MDX 里的 <code>export const metadata</code> —— Next 原生支持，自动进{" "}
            <code>&lt;head&gt;</code>。
          </li>
        </ul>
      </div>
    </div>
  );
}
