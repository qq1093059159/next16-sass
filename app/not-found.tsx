import Link from "next/link";

/**
 * 404 页面。
 *
 * 触发方式：
 *  1. 路由没匹配上（比如 /nonexistent）
 *  2. 组件里调用了 notFound()（本项目在 /notfound 和 /ssg/[id] 演示）
 *
 * 层级：越靠近的 not-found.tsx 优先级越高。
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl font-black opacity-20">404</p>
      <h1 className="mt-2 text-2xl font-bold">页面不存在</h1>
      <p className="mt-2 text-sm opacity-70">
        你访问的地址没有对应的路由，或者内容被 notFound() 主动判定为不存在。
      </p>
      <Link
        href="/knowledge"
        className="mt-6 rounded-md bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        回到知识点地图
      </Link>
    </div>
  );
}
