import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentPosts, getPostFiles, getPostMeta } from "@/lib/posts";

/**
 * 文章详情页 —— catch-all 动态路由 + 动态 import。
 *
 * 为什么用 `[...slug]` 而不是 `[slug]`？
 *   content/tech/nested-post.mdx  →  /posts/tech/nested-post
 * `[slug]` 只匹配**一段**路径，分类目录下的文章根本匹配不上；
 * `[...slug]` 才能接住多段（catch-all），拿到 ["tech", "nested-post"]。
 *
 * 三件事：
 *  1. generateStaticParams() 在【构建期】递归扫描 content/，
 *     把每个文件的相对路径变成一条具体路由（产物里是 ○ Static）。
 *  2. 运行时按 slug 动态 import 对应的 .mdx 文件并渲染。
 *  3. 元数据来源：MDX 文件里的 `export const metadata` —— Next 原生支持，
 *     会自动进 <head>，不需要额外解析 frontmatter。
 */
export function generateStaticParams() {
  return getPostFiles().map((p) => ({ slug: p.slugParts }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // ⚠️ 必须走 getPostMeta()，它会把 .mdx 的 ESM export 与 .md 的 .json 旁路合并。
  //    直接用 import 出来的 metadata 会漏掉 .json 旁路。
  const meta = await getPostMeta(slug.join("/"));
  return meta ?? { title: slug.join("/") };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const entry = getPostFiles().find((p) => p.slug === slug.join("/"));

  // 目录里没有这个文件 → 走 404 流程
  if (!entry) {
    notFound();
  }

  const { default: Post } = await import(`@/content/${entry.file}`);
  // 元数据统一从 getPostMeta 取（合并 frontmatter / 手写 export / .json 旁路）
  const metadata = await getPostMeta(entry.slug);
  // 上一篇 / 下一篇（按日期排序后取相邻）
  const { prev, next } = await getAdjacentPosts(entry.slug);

  return (
    <article className="mx-auto max-w-2xl p-6">
      <header className="border-b border-gray-200 pb-4 dark:border-gray-700">
        {entry.category ? (
          <p className="mb-2 text-xs uppercase tracking-wider opacity-60">
            <Link href={`/category/${entry.category}`} className="underline">
              {entry.category}
            </Link>
          </p>
        ) : null}
        <h1 className="text-3xl font-bold">{metadata?.title ?? entry.baseSlug}</h1>
        {metadata?.date ? (
          <p className="mt-1 text-sm opacity-60">{metadata.date}</p>
        ) : null}
      </header>

      <div className="prose prose-neutral dark:prose-invert mt-6 max-w-none leading-7">
        <Post />
      </div>

      {/* 标签 */}
      {metadata?.tags && metadata.tags.length > 0 ? (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider opacity-60">标签</span>
          {metadata.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}

      <footer className="mt-10 border-t border-gray-200 pt-4 text-sm dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            {prev ? (
              <Link href={`/posts/${prev.slug}`} className="group block">
                <span className="text-xs opacity-50">← 上一篇</span>
                <span className="block truncate underline underline-offset-4">
                  {prev.title}
                </span>
              </Link>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 text-right">
            {next ? (
              <Link href={`/posts/${next.slug}`} className="group block">
                <span className="text-xs opacity-50">下一篇 →</span>
                <span className="block truncate underline underline-offset-4">
                  {next.title}
                </span>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs opacity-60">
          <Link href="/posts" className="underline">
            ← 返回文章列表
          </Link>
          {entry.category ? (
            <Link href={`/category/${entry.category}`} className="underline">
              更多「{entry.category}」→
            </Link>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
