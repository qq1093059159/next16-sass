/**
 * 拦截路由。
 *
 * 目录名里的 (.) 是「同层级」的意思：
 *   app/(root)/intercepting/@modal/(.)photo/[id]
 *                            ↑↑↑ 与 @modal 同级的 photo/[id]
 *
 * 行为对照：
 *  - 从 /intercepting 用 <Link> 软导航到 /intercepting/photo/1
 *      → 渲染【这个】拦截页（弹窗形态），不替换整页
 *  - 直接在地址栏输入 /intercepting/photo/1（硬导航）
 *      → 拦截失效，渲染真正的 photo/[id]/page.tsx（全屏形态）
 *
 * 其它标记：
 *   (..)      上一层级
 *   (..)(..)  上上层级
 *   (...)     根目录 app/
 */
export default async function InterceptedPhoto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
        <h2 className="text-lg font-bold">这是【拦截页】（弹窗形态）</h2>
        <p className="mt-2 text-sm opacity-70">
          你从 /intercepting 软导航过来，所以命中了 @modal/(.)photo 拦截路由。
        </p>
        <p className="mt-1 text-sm opacity-70">
          如果把地址栏里的路径直接刷新一下，会看到完全不同的全屏页面。
        </p>
        <p className="mt-4 text-xs opacity-50">photo id = {id}</p>
      </div>
    </div>
  );
}
