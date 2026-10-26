# 第 08 课 · server-only 与编译期约束

> **学习目标**：学会用编译期约束把「不该跨边界的东西」锁死在服务端。
> **对应代码**：`app/serveronly/page.tsx`
> **预计耗时**：20 分钟
> **前置知识**：第 07 课

---

## 一、核心概念

`server-only` / `client-only` 是两个**只有一句话**的包：

- `server-only` —— 被**客户端组件** import 时，**构建直接失败**
- `client-only` —— 被**服务端组件** import 时，**构建直接失败**

它们不含任何逻辑，纯粹是「一句报错」，用来在**编译期**（而不是运行时）
把不该跨边界的东西挡住。

```
服务端组件 ──import──▶ server-only 模块   ✅ 允许
客户端组件 ──import──▶ server-only 模块   ❌ 构建失败
```

**为什么重要**：运行时才发现「这里不能用 `fs`」已经太晚了 ——
用户已经拿到了一个 500 页面。编译期失败意味着**你根本发不出去**。

---

## 二、真实代码

`app/serveronly/page.tsx`：

```tsx
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
```

整个文件只有一行 `import "server-only"` 起作用，其余是普通的服务端组件。

> 📦 这个包**不需要单独安装** —— Next.js 已经内置了。
> 你只要 `import "server-only"` 就行。

---

## 三、典型用法

给「只能跑在服务端」的模块加上这行：

> 下面是**典型用法示意**，不是仓库里的代码：

```ts
// lib/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();
```

这样一来，任何客户端组件想 import 它，构建就炸。

同理：

> 下面是**密钥模块的典型用法示意**，不是仓库里的代码：
```ts
// lib/secrets.ts
import "server-only";
export const API_KEY = process.env.SOME_SECRET_KEY;
```

---

## 四、动手实验

### 实验 1：触发编译期拦截

新建 `app/client/bad-import.tsx`：

```tsx
"use client";
import ServerOnly from "@/app/serveronly/page";
export default function Bad() {
  return <ServerOnly />;
}
```

在 `app/client/page.tsx` 顶部加：

```tsx
import Bad from "./bad-import";
```

然后 `pnpm build`。

**预期**：构建失败，报错类似：

```text
You're importing a component that needs "server-only".
That only works in a Server Component which is not supported in the pages/ directory.
```

**注意错误信息里没有你的文件名**，只有一句「需要 server-only」——
这是有意为之，避免泄露内部结构。

### 实验 2：验证服务端组件可以正常用

把 `app/client/page.tsx` 里刚加的 `import Bad from "./bad-import";` 删掉，
并删掉 `app/client/bad-import.tsx`。

```bash
pnpm build
```

**预期**：构建通过。`app/serveronly/page.tsx` 被正常渲染。

### 实验 3：对比运行时才发现问题的痛苦

假设没有 `server-only`，你在客户端组件里写了：

```tsx
"use client";
import fs from "node:fs";        // ← 浏览器里根本没有 fs
export default function Bad() {
  return <div>{fs.readFileSync("x.txt", "utf-8")}</div>;
}
```

**预期**：构建**不会**报错（`fs` 的 import 在客户端会报别的错，但假设能过），
而是在浏览器控制台报 `fs is not defined` —— 用户看到的是白屏。

**对比**：有 `server-only` 时，问题在**构建期**暴露，你连部署都发不出去。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 忘了加 `server-only` | 运行时才炸 | 给「只能服务端跑」的模块加上 |
| 给纯展示组件加 `server-only` | 客户端想复用时构建失败 | 只加在真正含服务端依赖的模块上 |
| 以为 `server-only` 是加密 | 毫无安全作用 | 它只是编译期标记 |
| 在 `lib/` 里放密钥但不加 `server-only` | 可能被误 import 进客户端包 | 密钥模块一律加 |

---

## 六、自检

1. `server-only` 这个包实际做了什么？
2. 为什么「编译期失败」比「运行时失败」好？
3. 哪些模块应该加 `server-only`？给两个例子。
4. `server-only` 能保护密钥不被泄漏吗？

---

## 七、小结 & 下一步

- `server-only` 是**编译期护栏**，不是运行时保护。
- 含数据库连接、密钥、文件系统访问的模块都应该加。
- 它不需要安装，Next.js 内置。

**下一课** → [第 09 课 · Suspense 与流式渲染](09_Suspense与流式渲染.md)
