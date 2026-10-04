import "server-only";

export default function ServerOnlyPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Server Only</h1>
      <p>
        本模块顶部带有 <code>import &quot;server-only&quot;</code>。它只能在服务端组件（RSC）中使用；
        一旦被客户端组件导入，构建期即报错，从而把不该跨边界的代码锁死在服务端。
      </p>
    </main>
  );
}
