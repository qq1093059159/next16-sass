import Link from "next/link";

/**
 * 拦截路由的「触发器」页面。
 *
 * 用 <Link> 软导航到 /intercepting/photo/1 → 命中拦截路由（弹窗）
 * 刷新页面 / 直接输入 URL         → 命中真实页面（全屏）
 */
export default function InterceptingIndex() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>拦截路由 · Intercepting Routes</h1>
      <p className="mt-2 text-sm opacity-70">
        点下面的链接（软导航）会弹出遮罩层；再刷新一下，你会看到完全不同的全屏页面。
      </p>

      <div className="mt-6 flex gap-4">
        <Link
          href="/intercepting/photo/1"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
        >
          软导航到 photo/1
        </Link>
        <Link href="/intercepting/photo/2" className="underline">
          软导航到 photo/2
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-indigo-300 bg-indigo-50 p-4 text-sm dark:border-indigo-700 dark:bg-indigo-950">
        <h2 className="font-semibold">目录约定</h2>
        <pre className="mt-2 overflow-x-auto text-xs leading-5">
{`app/(root)/intercepting/
├─ layout.tsx                 接收 children 与 modal 两个 prop
├─ page.tsx                   触发器页面
├─ photo/[id]/page.tsx        真实页面（硬导航时显示）
└─ @modal/
   ├─ default.tsx             slot 兜底（空）
   └─ (.)photo/[id]/page.tsx  拦截路由（软导航时显示）`}
        </pre>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>
            <b>(.)</b> 同层级 · <b>(..)</b> 上一层级 · <b>(..)(..)</b> 上上层级 ·{" "}
            <b>(...)</b> 根目录
          </li>
          <li>拦截路由必须放在平行路由 slot 里，并且要有 default.tsx 兜底。</li>
          <li>典型用途：图片详情弹窗、登录弹窗、购物车抽屉。</li>
        </ul>
      </div>
    </div>
  );
}
