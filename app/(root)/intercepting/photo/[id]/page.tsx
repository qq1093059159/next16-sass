import { Suspense } from "react";

/**
 * 真正的照片详情页（全屏形态）。
 *
 * 从 /intercepting 软导航过来时会被 @modal/(.)photo/[id] 拦截；
 * 直接访问或刷新时，渲染的就是这个页面。
 *
 * ⚠️ 页面组件【不能直接 await params】——
 *    Next 16 开了 cacheComponents 后，在 <Suspense> 之外访问 params
 *    会让这条路由无法预渲染（Blocking Route 报错）。
 *    正确姿势：页面组件不 await params，只把 Promise 往下传，
 *    真正 await 的 async 子组件放进 <Suspense>。
 */
export default function PhotoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm opacity-60">加载照片…</div>}>
      <PhotoContent params={params} />
    </Suspense>
  );
}

/** 真正读 params 的部分 —— 必须在 <Suspense> 内部 */
async function PhotoContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <article className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">照片详情页（真实页面）</h1>
      <p className="mt-2 text-sm opacity-70">
        这是 /intercepting/photo/[id] 的正式页面。软导航时它被拦截成弹窗，
        硬导航（刷新 / 直接输入 URL）时它才是你现在看到的全屏页面。
      </p>
      <p className="mt-4 text-sm">photo id = {id}</p>
    </article>
  );
}
