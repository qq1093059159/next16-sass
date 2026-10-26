# 第 19 课 · 流式响应 SSE

> **学习目标**：用 `ReadableStream` 在 Route Handler 里做逐块推送，并搞清「流式为什么不能缓存」。
> **对应代码**：`app/api/stream/route.ts`、`app/(root)/stream/page.tsx`
> **预计耗时**：30 分钟

---

## 一、核心概念

Server-Sent Events（SSE）= 服务端**逐块**把内容推给浏览器。

对比三种「把数据送回浏览器」的方式：

| 方式 | 方向 | 适合 |
|---|---|---|
| `fetch` + JSON | 请求-响应，一次性 | 普通接口 |
| **SSE** | 服务端 → 客户端单向流 | 实时通知、日志、AI 输出 |
| WebSocket | 双向 | 聊天室、协同编辑 |

---

## 二、真实代码

### 2.1 服务端 `app/api/stream/route.ts`

```ts
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
```

**三个头的作用**：

| 头 | 为什么必须有 |
|---|---|
| `Content-Type: text/event-stream` | 告诉浏览器这是 SSE 格式（数据块之间用空行分隔） |
| `Cache-Control: no-cache, no-transform` | `no-transform` 禁止代理压缩/缓冲，否则流会被攒起来一次性吐出 |
| `Connection: keep-alive` | 保持连接不断 |

**数据格式**：每块以 `data: ` 开头，以 `\n\n` 结尾（空行是消息分隔符）。

### 2.2 客户端 `app/(root)/stream/page.tsx`

```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function StreamPage() {
  const [lines, setLines] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function start() {
    const controller = new AbortController();
    abortRef.current = controller;
    setLines([]);
    setRunning(true);

    const res = await fetch("/api/stream", { signal: controller.signal });
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      for (const chunk of text.split("\n\n")) {
        const line = chunk.replace(/^data:\s*/, "").trim();
        if (line) setLines((prev) => [...prev, line]);
      }
    }
    setRunning(false);
  }

  function stop() {
    abortRef.current?.abort();
    setRunning(false);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>流式响应 · Route Handler + ReadableStream</h1>
      <div className="mt-4 flex gap-2">
        <button onClick={start} disabled={running}>
          开始
        </button>
        <button onClick={stop} disabled={!running}>
          中断
        </button>
      </div>
      <ul className="mt-4 flex flex-col gap-1 font-mono text-sm">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
```

**为什么用 `fetch` 而不是 `EventSource`**：

| | `EventSource` | `fetch` + `ReadableStream` |
|---|---|---|
| 自定义请求头 | ❌ 不行 | ✅ |
| POST body | ❌ 不行 | ✅ |
| 中断 | `close()` | `AbortController.abort()` |

`EventSource` 只能 GET 且不能带自定义头，所以真实项目（尤其是 AI 对话）
基本都用 `fetch` + reader。

---

## 三、动手实验

### 实验 1：浏览器里看流式到达

访问 <http://localhost:3000/stream>，点「开始」。

**观察**：5 条消息**每隔 0.8 秒逐条出现**，不是一次性全部出现。

### 实验 2：命令行看原始流

```bash
curl -N http://127.0.0.1:3000/api/stream
```

**预期**：逐块打印 `data: 第 1 条消息`、`data: 第 2 条消息` …

> `-N` 是关键 —— 不加的话 curl 会缓冲，看不出流式效果。
> 去掉 `-N` 对比一下，感受差别。

### 实验 3：验证 no-transform 的作用

把 `app/api/stream/route.ts` 的头改成：

```ts
"Cache-Control": "public, max-age=31536000",
```

重新 build + start，再 curl。

**预期**：数据被攒起来了 —— 因为缓存层把整条流当普通响应缓存了。

**改回 `no-cache, no-transform`**。

### 实验 4：测试中断

页面点「开始」后立刻点「中断」。

**观察**：服务端会在 0.8 秒后抛出 abort 错误（终端可见），客户端停止追加。

---

## 四、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 忘了 `no-transform` | 代理压缩缓冲，流式失效 | 必须写 |
| 忘了 `text/event-stream` | 浏览器不按 SSE 解析 | 必须写 |
| curl 不加 `-N` | 看不到流式效果 | 加 `-N` |
| 给 SSE 接口加 `revalidate` / `"use cache"` | 无意义 | **流式与缓存互斥** |
| 客户端不处理 `\n\n` 分隔 | 多条消息粘在一起 | 按空行切分 |

---

## 五、自检

1. SSE 的响应头必须有哪些？为什么 `no-transform` 不能少？
2. `EventSource` 的两个限制是什么？
3. 为什么流式响应不能被缓存？
4. SSE 的数据块用什么分隔？

---

## 六、小结 & 下一步

- `ReadableStream` + `text/event-stream` = 服务端逐块推送。
- 必须写 `no-cache, no-transform` 防缓冲。
- 客户端用 `fetch` + `reader` 比 `EventSource` 灵活。

**下一课** → [第 20 课 · 元数据与 SEO 约定文件](20_元数据与SEO约定文件.md)
