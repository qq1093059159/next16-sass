# 第 15 课 · 响应后任务 after()

> **学习目标**：学会把「埋点、日志、清理」这类不必让用户等待的工作，挪到响应发出之后再执行。
> **对应代码**：`app/(root)/after/page.tsx`
> **预计耗时**：20 分钟

---

## 一、核心概念

`after()` 让你在**响应已经发给用户之后**再执行一段逻辑。

```tsx
import { after } from "next/server";

export default function Page() {
  after(() => {
    console.log("响应已发出，这条日志在响应之后才打印");
  });
  return <div>...</div>;
}
```

**为什么要这样**：如果把埋点写在组件里直接 `await`，用户就要多等这一段时间才能看到首屏。
`after()` 让它变成「响应送出去了我再慢慢做」。

**可用位置**：Server Component / Route Handler / Server Action。

---

## 二、真实代码

`app/(root)/after/page.tsx`：

```tsx
import { after } from "next/server";

/**
 * after() —— 响应【结束后】再执行的任务。
 *
 * 典型用途：
 *  - 埋点上报（不阻塞首字节）
 *  - 写日志 / 审计
 *  - 清理临时资源
 *
 * 它比「在渲染函数里 await」更好：不占用用户的等待时间。
 * 可用在 Server Component / Route Handler / Server Action 里。
 */
export default function AfterPage() {
  // 注意：这里【没有 await】，函数会立即返回，任务在响应发完后才跑
  after(() => {
    console.log("[after] 响应已发出，这条日志在响应之后才打印");
  });

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>响应后任务 · after()</h1>
      <p className="mt-2 text-sm opacity-70">
        打开这个页面的【服务端终端】看日志：页面内容早已返回，但日志会在稍后才出现。
      </p>
    </div>
  );
}
```

---

## 三、动手实验

### 实验 1：看日志的时序

```bash
pnpm dev
```

打开 <http://localhost:3000/after>，同时盯着**服务端终端**。

**预期**：页面内容立刻出现（浏览器已经渲染好了），
终端里的 `[after] 响应已发出...` 日志**稍后**才打印。

### 实验 2：对比 await 的写法

把组件里改成：

```tsx
console.log("[同步] 组件开始渲染");
await new Promise((resolve) => setTimeout(resolve, 2000));
console.log("[同步] 等了 2 秒才继续");
```

**观察**：页面**等了 2 秒**才显示内容。**改回来**。

### 实验 3：在 Route Handler 里用

```ts
import { after } from "next/server";

export async function GET() {
  after(() => {
    console.log("[after] 响应后写埋点");
  });
  return Response.json({ ok: true });
}
```

```bash
curl -s http://127.0.0.1:3000/api/your-test-route
```

**预期**：JSON 立刻返回，终端日志稍后出现。

---

## 四、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 在 `after()` 里 `await` 长时间任务 | 平台可能在任务完成前杀掉进程 | 任务要短；长任务交给队列 |
| 在 `after()` 里返回 JSX / 抛错 | 无效 | 里面只做副作用，不产出 UI |
| 把关键业务逻辑放进 `after()` | 用户可能看不到结果 | 关键逻辑要在响应前完成 |
| 以为 `after()` 是「延后执行」 | 语义误解 | 它是「响应后执行」，且不阻塞响应 |

---

## 五、自检

1. `after()` 解决的是哪个性能问题？
2. `after()` 里的回调需要 `await` 吗？
3. 哪些场景**不该**放进 `after()`？
4. `after()` 能在客户端组件里用吗？

---

## 六、小结 & 下一步

- `after()` = 响应发出后再执行，不阻塞用户。
- 适合：埋点、日志、审计、清理。
- 不适合：关键业务逻辑、长耗时任务。

**下一课** → [第 16 课 · Route Handlers 基础](16_RouteHandlers基础.md)
