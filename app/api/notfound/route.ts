/**
 * Route Handler 里显式返回 404 —— 依赖 HTTP 状态码时的正确做法。
 *
 * 页面里的 notFound() 在 PPR 模式下往往只能给你「200 + 404 界面」，
 * 而 Route Handler 是自己写 Response，状态码由你说了算。
 */
export async function GET() {
  return new Response(
    JSON.stringify({ error: "NOT_FOUND", message: "该资源不存在" }),
    {
      status: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    },
  );
}
