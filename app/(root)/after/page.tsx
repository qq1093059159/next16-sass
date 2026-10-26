import { after } from "next/server";

/**
 * after() —— 响应【结束后】再执行的任务。
 *
 * 典型用途：埋点上报、写日志、清理临时资源。
 *
 * 它比在渲染函数里 await 更好：不占用用户的等待时间。
 * 可用在 Server Component / Route Handler / Server Action 里。
 */
export default function AfterPage() {
  // 注意：这里没有 await，函数会立即返回，任务在响应发完后才跑
  after(() => {
    console.log("[after] 响应已发出，这条日志在响应之后才打印");
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>响应后任务 · after()</h1>
      <p className="mt-2 text-sm opacity-70">
        打开这个页面的服务端终端看日志：页面内容早已返回，但日志会在稍后才出现。
      </p>
      <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm dark:border-emerald-700 dark:bg-emerald-950">
        <p>
          对比：把 after() 换成 await 写在组件里，用户就要多等这一段时间才能看到首屏。
        </p>
      </div>
    </div>
  );
}
