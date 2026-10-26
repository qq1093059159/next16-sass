/**
 * 真正的照片详情页（全屏形态）。
 *
 * 从 /intercepting 软导航过来时会被 @modal/(.)photo/[id] 拦截；
 * 直接访问或刷新时，渲染的就是这个页面。
 */
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
