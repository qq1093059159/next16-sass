"use client";

/**
 * 全局错误边界 —— 根 layout 都救不回来时才生效。
 *
 * ⚠️ 关键区别：global-error.tsx 会【替换掉根 layout】，
 *    所以它必须自己输出 <html> 和 <body>，
 *    否则浏览器会拿到一个没有 html/body 的文档，页面全白。
 *
 * ⚠️ 它也必须是 "use client"。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          padding: "3rem",
          color: "#111",
          background: "#fff",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", color: "#dc2626" }}>全局错误（global-error）</h1>
        <p style={{ marginTop: "0.75rem" }}>
          根 layout 已经渲染失败，这里是最后一道兜底 —— 注意本页自带{" "}
          <code>&lt;html&gt;</code> / <code>&lt;body&gt;</code>。
        </p>
        <pre
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#f5f5f5",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            whiteSpace: "pre-wrap",
          }}
        >
          {error.message}
          {error.digest ? `\ndigest: ${error.digest}` : ""}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            background: "#111",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          重试
        </button>
      </body>
    </html>
  );
}
