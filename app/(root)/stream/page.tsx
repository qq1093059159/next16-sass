"use client";
import { useEffect, useRef, useState } from "react";

/**
 * 消费服务端流式响应（SSE）。
 *
 * 用 fetch + ReadableStream 手动读，而不是 EventSource，
 * 因为这样才能自定义请求头、传 POST body。
 */
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
        <button
          onClick={start}
          disabled={running}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          开始
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700"
        >
          中断
        </button>
      </div>

      <ul className="mt-4 flex flex-col gap-1 font-mono text-sm">
        {lines.map((line, i) => (
          <li key={i} className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">
            {line}
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-950">
        <p>
          注意：流式响应不能被缓存。给 /api/stream 加 revalidate /
          use cache 都没有意义 —— 数据是边生成边推的。
        </p>
      </div>
    </div>
  );
}
