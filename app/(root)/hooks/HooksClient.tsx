"use client";
import {
  useParams,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";

/**
 * 客户端导航 Hooks 全景。
 *
 * 注意：useSearchParams 在静态预渲染的页面里必须包在 Suspense 里，
 * 否则 next build 会直接报 useSearchParams() should be wrapped in a suspense boundary。
 */
export default function HooksClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const segment = useSelectedLayoutSegment();
  const segments = useSelectedLayoutSegments();

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Item name="usePathname()" value={pathname} note="当前 URL 路径（不含 query）" />
      <Item
        name="useSearchParams()"
        value={searchParams.toString()}
        note="查询字符串，需 Suspense 包裹"
      />
      <Item name="useParams()" value={JSON.stringify(params)} note="当前路由段的动态参数" />
      <Item
        name="useSelectedLayoutSegment()"
        value={segment ?? "(null)"}
        note="最近 layout 下一层的段名 —— 面包屑/导航高亮神器"
      />
      <Item
        name="useSelectedLayoutSegments()"
        value={JSON.stringify(segments)}
        note="最近 layout 以下的所有段名（数组）"
      />
    </div>
  );
}

function Item({ name, value, note }: { name: string; value: string; note: string }) {
  return (
    <div className="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700">
      <code className="font-semibold">{name}</code>
      <p className="mt-1 break-all font-mono text-xs opacity-80">{value}</p>
      <p className="mt-1 text-xs opacity-60">{note}</p>
    </div>
  );
}
