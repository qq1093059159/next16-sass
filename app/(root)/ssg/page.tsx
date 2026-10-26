import Link from "next/link";

/**
 * 静态生成（SSG）索引页。
 *
 * 打开本页再点进 /ssg/1，会发现：
 *  - 构建产物里 /ssg/1 是【静态页】（构建输出显示 ○ Static）
 *  - 超过 cacheLife 的 revalidate 时间后，Next 在后台重新生成它（ISR）
 */
export default function SsgIndex() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>静态生成 · generateStaticParams</h1>
      <p className="mt-2 text-sm opacity-70">
        下面 3 条路径在 <code>next build</code> 阶段就被预渲染成了静态 HTML。
      </p>

      <ul className="mt-6 flex flex-col gap-2">
        {[1, 2, 3].map((id) => (
          <li key={id}>
            <Link href={`/ssg/${id}`} className="underline">
              /ssg/{id}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/ssg/999" className="underline opacity-60">
            /ssg/999（未预生成，运行时兜底 → 数据不存在 → 404）
          </Link>
        </li>
      </ul>

      <div className="mt-8 rounded-lg border border-violet-300 bg-violet-50 p-4 text-sm dark:border-violet-700 dark:bg-violet-950">
        <h2 className="font-semibold">怎么验证它是静态的</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            运行 <code>pnpm build</code>，看输出里 <code>/ssg/1</code> 前面是 ○（Static）。
          </li>
          <li>
            运行 <code>pnpm start</code> 后访问 <code>/ssg/1</code>，看响应头{" "}
            <code>x-nextjs-cache</code>：HIT 表示命中缓存，MISS 表示刚重新生成。
          </li>
          <li>
            打开 <Link href="/revalidate" className="underline">/revalidate</Link>，
            点「按标签失效」后再访问，缓存就会被清掉。
          </li>
        </ol>
      </div>
    </div>
  );
}
