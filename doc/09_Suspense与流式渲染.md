# 第 09 课 · Suspense 与流式渲染

> **学习目标**：搞懂 `loading.tsx` 与 `<Suspense>` 的关系，以及 PPR（部分预渲染）是怎么把首屏变快的。
> **对应代码**：`app/basic/loading.tsx`、`app/basic/a/page.tsx`、`app/mysuspense/page.tsx`、`app/loading.tsx`
> **预计耗时**：35 分钟

---

## 一、核心概念

### 1.1 三种边界

| 边界 | 触发方式 | 粒度 | 是客户端组件吗 |
|---|---|---|---|
| `loading.tsx` | 约定文件 | 整个路由段 | 否（服务端） |
| `<Suspense>` | 手写 React API | 任意子树 | 否 |
| `error.tsx` | 抛异常 | 整个路由段 | **是** |

### 1.2 `loading.tsx` 就是 Suspense 语法糖

`app/basic/loading.tsx`：

```tsx
export default function Loading() {
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
}
```

框架会自动把整个段包成：

```tsx
<Suspense fallback={<Loading />}>
  {children}
</Suspense>
```

**关键理解**：它包住的是**这一段里的所有可能挂起的东西**，
所以哪怕你不用 `loading.tsx`，页面里有 `await` 也会先显示它。

---

## 二、真实代码

### 2.1 一个真的慢 5 秒的页面

`app/basic/a/page.tsx`：

```tsx
import Link from "next/link";
const getData = async () => {
  //触发异步会自动跳转到loading组件 异步结束正常返回页面
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("数据");
    }, 5000);
  });
};
export default async function APage() {
  const data = await getData();
  console.log(data);
  //遇到异常会自动跳转到error组件
  // throw new Error("错误");
  return (
    <div>
      <h1>A Page</h1>
      <Link href="/basic/b">跳转B</Link>
    </div>
  );
}
```

对照 `app/basic/b/page.tsx`（同步、立即返回）：

```tsx
import Link from "next/link";
export default function BPage() {
  return (
    <div>
      <h1>B Page</h1>
      <Link href="/basic/a">跳转A</Link>
    </div>
  );
}
```

**这两个页面构成对照组**：一个挂起 5 秒，一个秒回。

### 2.2 手写 Suspense：`app/mysuspense/page.tsx`

```tsx
/* eslint-disable react-hooks/purity */
import { Suspense } from "react";
import { connection } from "next/server";

const DynamicContent = async () => {
  await connection(); //使用connection表示不要预渲染这部分
  const random = Math.random();
  const now = Date.now();
  console.log(random, now);
  return (
    <div>
      <h2>动态内容</h2>
      <main>
        <ul>
          <li>名称：{random}</li>
          <li>时间：{now}</li>
        </ul>
      </main>
    </div>
  );
};
export default async function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Suspense fallback={<div>动态内容Loading...</div>}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
```

**这就是 PPR（Partial Prerendering）的基础形态**：

```text
构建期：<h1>Home</h1> 这部分静态内容被预渲染
运行时：DynamicContent 在真实请求时才算，流式追加到页面末尾
```

用户不用等最慢的那块数据。

---

## 三、`connection()` 是什么

> **`connection()` 是 Next 16 的稳定 API**（Next 15 时代以实验特性存在）：
> 显式告诉框架「从这里开始依赖真实请求，别预渲染我」。
> 过去靠读取 `cookies()` / `headers()` 隐式触发动态渲染，现在有了显式的表达手段。

```tsx
import { connection } from "next/server";

export default async function Page() {
  await connection();   // ← 这一段不在构建期预渲染
  return <div>{Math.random()}</div>;
}
```

它是**第 10 课（缓存模型）的基础**：`"use cache"` 声明缓存，
`connection()` 声明动态，两者互补。

---

## 四、动手实验

### 实验 1：看 loading 出现

访问 <http://localhost:3000/basic/a>：

1. 立刻看到 `basic/loading.tsx` 的「Loading...」
2. 5 秒后内容替换进来

再访问 <http://localhost:3000/basic/b> —— **不会**看到 loading。

### 实验 2：看清 Suspense 的作用范围

改 `app/mysuspense/page.tsx`，把 `<Suspense>` 去掉：

```tsx
export default async function Home() {
  return (
    <div>
      <h1>Home</h1>
      <DynamicContent />
    </div>
  );
}
```

访问 <http://localhost:3000/mysuspense>。

**预期**：`<h1>Home</h1>` 也不再immediate出现 —— 整个页面都要等
`DynamicContent`（因为没有 Suspense 边界把它隔离出去）。

**这说明**：Suspense 的作用不只是「显示 loading」，
而是**把挂起的部分从整页渲染中摘出来**，让其余部分能先出来。

### 实验 3：在浏览器里观察流式到达

打开 DevTools → Network → 找到 `mysuspense` 请求 → Response 标签页。

你会看到响应是**分块到达**的：先来一段 HTML（含 `<h1>Home</h1>` 和 fallback），
再来一段（真实内容）。

命令行也能看：

```bash
curl -N http://127.0.0.1:3000/mysuspense | head -c 2000
```

`-N` 表示不要缓冲。

### 实验 4：改 fallback 文案

把 `<Suspense fallback={<div>动态内容Loading...</div>}>` 里的文案改掉，
刷新页面 —— 你会看到新的 fallback 先出现，然后被真实内容替换。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 在 layout 里 `await` 慢数据 | 整页都等 | 用 Suspense 把慢数据隔离出去 |
| 忘了 `<Suspense>` 包裹 | 整个页面一起等 | 每个慢数据源单独包一个边界 |
| 在 Suspense 里放 `useState` | 报错（Suspense 边界内只能是服务端组件） | 客户端逻辑放独立的客户端组件 |
| 用 `loading.tsx` 代替 `<Suspense>` | 粒度太粗 | `loading.tsx` 只能包整段 |

---

## 六、自检

1. `loading.tsx` 和 `<Suspense>` 是什么关系？
2. 为什么去掉 `<Suspense>` 后连 `<h1>Home</h1>` 都不显示了？
3. `connection()` 的作用是什么？它和 `await` 有什么本质区别？
4. PPR 的「部分」指的是什么？

---

## 七、小结 & 下一步

- `loading.tsx` = 自动包一层 Suspense（整段粒度）。
- `<Suspense>` = 手写边界（任意子树粒度），是 PPR 的基础。
- `connection()` 显式声明「这段要实时渲染」。

**下一课** → [第 10 课 · Cache Components 缓存模型](10_CacheComponents缓存模型.md)
