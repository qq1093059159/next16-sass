import React, { Suspense } from "react";
// 设置动态meta
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `User #${id}`,
    description: `User detail page for user ${id}`,
  };
}

/**
 * ⚠️ 页面组件【不能直接 await params】——
 *
 * Next 16 开了 `cacheComponents`（Cache Components / PPR）后，
 * 在 <Suspense> 之外访问 params 属于「运行时数据」，这条路由就无法预渲染：
 *
 *   Error: Route "/dashboard/users/[id]": Next.js encountered runtime data
 *   during prerendering or a navigation.
 *
 * 正确姿势：① 页面组件不 await params，只把 Promise 往下传；
 *         ② 真正 await params 的 async 子组件放在 <Suspense> 内部。
 */
export default function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm opacity-60">加载用户…</div>}>
      <UserDetailContent params={params} />
    </Suspense>
  );
}

/** 真正读 params 的部分 —— 必须在 <Suspense> 内部 */
async function UserDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Showing UserDetail for user #{id}</div>;
}
