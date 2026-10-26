/**
 * Route Handler 返回流式响应（SSE）。
 *
 * 三个要点：
 *  1. 用 ReadableStream 手动分块推送；
 *  2. 响应头必须写 text/event-stream，并且禁止缓冲（no-cache, no-transform）；
 *  3. Route Handler 默认不会把流式响应缓存住 —— 流式与缓存互斥。
 */
export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 5; i++) {
        controller.enqueue(encoder.encode(`data: 第 ${i} 条消息\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
