import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostFiles } from "@/lib/posts";

/**
 * 文章详情页 —— 动态路由 + 动态 import。
 *
 * 两件事：
 *  1. generateStaticParams() 在【构建期】扫描 content/ 目录，
 *     把每个文件名变成一条具体路由（构建产物里是 ○ Static）。
 *  2. 运行时按 slug 动态 import 对应的 .mdx 文件并渲染。
 *
 * 元数据来源：MDX 文件里的 `export const metadata` —— Next 原生支持，
 * 会自动进 <head>，不需要额外解析 frontmatter。
 */
export function generateStaticParams() {
  return getPostFiles().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPostFiles().find((p) => p.slug === slug);
  if (!entry) return { title: slug };
  const mod = await import(`@/content/${entry.file}`);
  return mod.metadata ?? { title: slug };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getPostFiles().find((p) => p.slug === slug);

  // 目录里没有这个文件 → 走 404 流程
  if (!entry) {
    notFound();
  }

  const { default: Post, metadata } = await import(`@/content/${entry.file}`);

  return (
    <article className="mx-auto max-w-2xl p-6">
      <header className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-3xl font-bold">{metadata?.title ?? slug}</h1>
        {metadata?.date ? (
          <p className="mt-1 text-sm opacity-60">{metadata.date}</p>
        ) : null}
      </header>
      <div className="prose prose-neutral dark:prose-invert mt-6 max-w-none leading-7">
        <Post />
      </div>
      <footer className="mt-10 border-t border-gray-200 pt-4 text-sm opacity-60 dark:border-gray-700">
        <Link href="/posts" className="underline">
          ← 返回文章列表
        </Link>
      </footer>
    </article>
  );
}
