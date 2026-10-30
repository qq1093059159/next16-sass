import fs from "node:fs";
import path from "node:path";

/**
 * 「目录即内容源」——扫描 content/ 下的文章。
 *
 * 这是本仓库新增的一个博客式示例：
 *   content/*.mdx  →  /posts/<文件名>
 *
 * ⚠️ 注意这里用的是【运行时扫描 + 动态 import】，不是 @next/mdx 的文件式路由。
 * 两者区别见 README 第十一章。
 */

const POSTS_DIR = path.join(process.cwd(), "content");

/** 支持的扩展名：.mdx（可用 JSX）与 .md（纯 Markdown） */
const POST_EXT = /\.(md|mdx)$/;

/** 文章元数据（由 MDX 里的 `export const metadata` 提供） */
export type PostMeta = {
  title: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
};

/** 一篇文章的源文件：slug 用于 URL，file 用于 import */
export type PostFile = {
  /** URL 用的短名（文件名去掉扩展名） */
  slug: string;
  /** 磁盘上的完整文件名（含扩展名），动态 import 时用它当 key */
  file: string;
};

/** 列出 content/ 下所有文章源文件 */
export function getPostFiles(): PostFile[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => POST_EXT.test(file))
    .map((file) => ({ slug: file.replace(POST_EXT, ""), file }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** 只要 slug 列表 */
export function getPostSlugs(): string[] {
  return getPostFiles().map((p) => p.slug);
}

/**
 * 读出单篇文章的元数据。
 *
 * 关键点：动态 import 表达式 —— Turbopack / webpack 会把它编译成
 * 「包含该目录下所有文件」的 context module，所以运行时按 slug 取文件很快。
 * 实测路径别名 `@/content/xxx.mdx` 在这里可用（比相对路径更稳健）。
 */
export async function getPostMeta(slug: string): Promise<PostMeta | null> {
  const entry = getPostFiles().find((p) => p.slug === slug);
  if (!entry) return null;
  try {
    // ⚠️ 这里必须用【含扩展名的完整文件名】当 key：
    //    动态 import 表达式会被编译成「该目录下所有匹配扩展名的文件」的 context map，
    //    key 是完整路径。写死 .mdx 就找不到 .md 文件了。
    const mod = await import(`@/content/${entry.file}`);
    return (mod.metadata ?? { title: slug }) as PostMeta;
  } catch {
    return null;
  }
}

/** 读出全部文章的元数据，按日期倒序 */
export async function getAllPostMeta(): Promise<(PostMeta & { slug: string })[]> {
  const slugs = getPostSlugs();
  const metas = await Promise.all(
    slugs.map(async (slug) => ({ slug, ...((await getPostMeta(slug)) ?? { title: slug }) })),
  );
  return metas.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
