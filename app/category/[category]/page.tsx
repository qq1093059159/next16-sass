import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPostMeta, getCategories, getCategoryMeta } from "@/lib/posts";

/**
 * 分类页 —— 列出某个分类下的所有文章。
 *
 * 分类不是「写死的配置」，而是**由 content/ 下的子目录自动推导**的：
 *   content/tech/xxx.mdx  →  分类 "tech"  →  /category/tech
 *   content/life/yyy.md   →  分类 "life"  →  /category/life
 *
 * 好处：新建一个文件夹就是一个新分类，零配置。
 */
export function generateStaticParams() {
  return getCategories().map((c) => ({ category: c.name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const meta = getCategoryMeta(category);
  return {
    title: `分类：${meta.name ?? category}`,
    description: meta.description ?? `content/${category}/ 目录下的所有文章`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categories = getCategories();

  // 目录里没有这个分类 → 404
  if (!categories.some((c) => c.name === category)) {
    notFound();
  }

  const posts = (await getAllPostMeta()).filter((p) => p.category === category);
  const meta = getCategoryMeta(category);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <header className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <p className="text-xs uppercase tracking-wider opacity-60">分类</p>
        <h1 className="mt-1 text-3xl font-bold">{meta.name ?? category}</h1>
        {meta.description ? (
          <p className="mt-2 text-sm opacity-70">{meta.description}</p>
        ) : null}
        <p className="mt-2 text-sm opacity-70">
          共 {posts.length} 篇 —— 来自{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-800">
            content/{category}/
          </code>
        </p>
      </header>

      <ul className="mt-8 flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-600"
            >
              {post.date ? (
                <p className="text-xs opacity-60">{post.date}</p>
              ) : null}
              <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
              {post.excerpt ? (
                <p className="mt-2 text-sm opacity-75">{post.excerpt}</p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm">
        <Link href="/posts" className="underline">
          ← 返回全部文章
        </Link>
      </p>
    </div>
  );
}
