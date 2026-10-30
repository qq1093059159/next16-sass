import fs from "node:fs";
import path from "node:path";

/**
 * 「目录即内容源」——递归扫描 content/ 下的文章。
 *
 * 本仓库的博客式示例：
 *   content/hello.mdx            →  /posts/hello
 *   content/tech/nested.mdx      →  /posts/tech/nested      （tech 是分类）
 *   content/life/intro.md        →  /posts/life/intro
 *
 * ⚠️ 这里用的是【递归扫描 + 动态 import】，不是 @next/mdx 的文件式路由。
 *    两者区别见 README 第十一章。
 *
 * ── 元数据的两条来源 ──────────────────────────────────────────
 * 1. `.mdx` 文件里的 `export const metadata = {...}`（Next 原生，最优雅）
 * 2. 同名的 `.json` 旁路文件（`intro.md` ↔ `intro.json`）—— **.md 文件必须用这个**，
 *    因为 `.md` 走纯 CommonMark 解析，**不启用 MDX 语法**，ESM 导出会被当正文渲染。
 */

const POSTS_DIR = path.join(process.cwd(), "content");

/** 支持的扩展名：.mdx（可用 JSX）与 .md（纯 Markdown） */
const POST_EXT = /\.(md|mdx)$/;

/** 元数据文件（下划线开头）会被跳过，不当作文章 */
const META_PREFIX = "_";

/** 文章元数据 */
export type PostMeta = {
  title: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
};

/** 分类元数据（来自分类目录下的 _meta.json） */
export type CategoryMeta = {
  /** 展示名称，默认用目录名 */
  name?: string;
  description?: string;
};

/** 一篇文章的源文件 */
export type PostFile = {
  /** URL 路径（不含扩展名），如 "tech/nested-post" */
  slug: string;
  /** URL 路径拆成数组，给 catch-all 动态段的 params 用 */
  slugParts: string[];
  /** 磁盘上的相对路径（含扩展名），动态 import 时用它当 key */
  file: string;
  /** 同名 .json 旁路元数据文件（若有） */
  jsonFile?: string;
  /** 所在分类（顶层子目录名）；顶层文章为 undefined */
  category?: string;
  /** 不含分类的文件名 */
  baseSlug: string;
};

/**
 * 递归列出 content/ 下所有文章源文件。
 *
 * ⚠️ 两个实测踩到的点：
 *
 * 1. `readdirSync(dir, { recursive: true })` 在 **Windows 上返回的是反斜杠路径**
 *    （如 `tech\nested-post.mdx`），必须统一转成 `/`，否则拼出来的 import key
 *    与打包器生成的 context map 对不上，会报 `Cannot find module`。
 *
 * 2. 用 `recursive: true` 时，返回值里会混有目录名本身（Buffer | string 联合类型），
 *    要先过滤掉非字符串项。
 */
export function getPostFiles(): PostFile[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const all = fs
    .readdirSync(POSTS_DIR, { recursive: true })
    .filter((entry): entry is string => typeof entry === "string")
    // Windows 的反斜杠统一成正斜杠
    .map((file) => file.split(path.sep).join("/"));

  const jsonFiles = new Set(all.filter((f) => f.endsWith(".json")));

  return all
    .filter((file) => POST_EXT.test(file))
    // 下划线开头的文件是元数据文件（如 _meta.json），不是文章
    .filter((file) => !file.split("/").some((seg) => seg.startsWith(META_PREFIX)))
    .map((file) => {
      const slug = file.replace(POST_EXT, "");
      const parts = slug.split("/");
      const baseSlug = parts[parts.length - 1];
      // 顶层子目录 = 分类；多级目录时取第一段
      const category = parts.length > 1 ? parts[0] : undefined;
      // 同名 .json 旁路（把扩展名换成 .json）
      const jsonCandidate = file.replace(POST_EXT, ".json");
      return {
        slug,
        slugParts: parts,
        file,
        jsonFile: jsonFiles.has(jsonCandidate) ? jsonCandidate : undefined,
        category,
        baseSlug,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** 只要 slug 列表 */
export function getPostSlugs(): string[] {
  return getPostFiles().map((p) => p.slug);
}

/** 读旁路 .json 元数据文件 */
function readJsonMeta(file: string): Partial<PostMeta> {
  try {
    const full = path.join(POSTS_DIR, file);
    return JSON.parse(fs.readFileSync(full, "utf-8")) as Partial<PostMeta>;
  } catch {
    return {};
  }
}

/**
 * 读出单篇文章的元数据。
 *
 * 合并优先级：**.json 旁路 > MDX 的 ESM export**。
 * 旁路优先是为了让 `.md` 文件也能带元数据 —— 它的 ESM 导出根本不生效。
 *
 * 关键点：动态 import 表达式 —— Turbopack / webpack 会把它编译成
 * 「包含该目录下所有文件（含子目录）」的 context module，所以运行时按 slug 取文件很快。
 * 实测路径别名 `@/content/xxx.mdx` 在这里可用（比相对路径更稳健）。
 */
export async function getPostMeta(slug: string): Promise<PostMeta | null> {
  const entry = getPostFiles().find((p) => p.slug === slug);
  if (!entry) return null;

  let meta: Partial<PostMeta> = {};

  // ① MDX 编译产物里的元数据
  try {
    // ⚠️ 这里必须用【含扩展名的完整相对路径】当 key：
    //    动态 import 表达式会被编译成「该目录下所有匹配扩展名的文件」的 context map，
    //    key 是完整路径。写死 .mdx 就找不到 .md 文件了。
    const mod = await import(`@/content/${entry.file}`);

    // 两条来源，frontmatter 优先：
    //   mod.frontmatter —— YAML frontmatter（remark-mdx-frontmatter 转换而来）
    //                     ★ .md 与 .mdx 都有效，这是最通用的写法
    //   mod.metadata    —— 手写的 export const metadata（Next 原生识别，自动进 <head>）
    meta = {
      ...((mod.frontmatter ?? {}) as Partial<PostMeta>),
      ...((mod.metadata ?? {}) as Partial<PostMeta>),
    };
  } catch {
    // 编译产物异常时不应让整个列表页挂掉，退化成「只有 slug」
  }

  // ② .json 旁路（优先级最高，适合放编译链读不到的字段）
  if (entry.jsonFile) {
    meta = { ...meta, ...readJsonMeta(entry.jsonFile) };
  }

  return { title: entry.baseSlug, ...meta };
}

/** 读出全部文章的元数据，按日期倒序 */
export async function getAllPostMeta(): Promise<
  (PostMeta & { slug: string; category?: string })[]
> {
  const files = getPostFiles();
  const metas = await Promise.all(
    files.map(async (f) => ({
      slug: f.slug,
      category: f.category,
      ...((await getPostMeta(f.slug)) ?? { title: f.baseSlug }),
    })),
  );
  return metas.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/** 列出所有分类名（顶层子目录），按文章数倒序 */
export function getCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const f of getPostFiles()) {
    if (!f.category) continue;
    map.set(f.category, (map.get(f.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** 读分类的元数据（分类目录下的 _meta.json） */
export function getCategoryMeta(category: string): CategoryMeta {
  const file = `${category}/_meta.json`;
  try {
    const full = path.join(POSTS_DIR, file);
    return JSON.parse(fs.readFileSync(full, "utf-8")) as CategoryMeta;
  } catch {
    return {};
  }
}
