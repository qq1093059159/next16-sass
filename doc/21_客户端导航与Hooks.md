# 第 21 课 · 客户端导航与 Hooks

> **学习目标**：掌握 `Link` 与 `useRouter` 的分工，以及五个导航 Hook 的用法与约束。
> **对应代码**：`app/(root)/page.tsx`、`app/(root)/hooks/page.tsx`、`app/(root)/hooks/HooksClient.tsx`
> **预计耗时**：40 分钟

---

## 一、Link vs useRouter

| | `<Link>` | `useRouter()` |
|---|---|---|
| 触发方式 | 渲染一个 `<a>` | 编程式调用 |
| 默认行为 | 软导航（保留布局与状态） | `push` 也是软导航 |
| 典型用途 | 页面里的普通链接 | 「登录成功后跳走」这类命令式场景 |

### 1.1 `<Link>` 的真实代码 `app/(root)/page.tsx`（节选）

```tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script"; //引入Script组件
export default function Home() {
  const arr = [1, 2, 3, 4, 5];
  const router = useRouter();
  return (
    <div>
      <Link href="/about">跳转About页面</Link>
      <Link href={{ pathname: "/about", query: { name: "张三" } }}>
        跳转About并且传入参数
      </Link>
      <Link href="/page" prefetch={true}>预获取page页面</Link>
      <Link href="/xm" scroll={true}>保持滚动位置</Link>
      <Link href="/daman" replace={true}>替换当前页面</Link>

      {arr.map((item) => (
        <Link key={item} href={`/page/${item}`}>动态渲染的Link{item}</Link>
      ))}

      <button onClick={() => router.push("/page")}>跳转page页面</button>
      <button onClick={() => router.replace("/page")}>替换当前页面</button>
      <button onClick={() => router.back()}>返回上一页</button>
      <button onClick={() => router.forward()}>跳转下一页</button>
      <button onClick={() => router.refresh()}>刷新当前页面</button>
      <button onClick={() => router.prefetch("/about")}>预获取about页面</button>

      <Script src="https://unpkg.com/vue@3/dist/vue.global.js" />
    </div>
  );
}
```

> ⚠️ **注意**：这个首页里的部分 `<Link>` 指向**不存在的路由**
> （`/page`、`/xm`、`/daman`、`/page/1`），点进去是 404。
> 这是仓库已记录的真实缺陷（缺陷清单 #3），教学时别以为是 bug 复现。

### 1.2 `<Link>` 的常用 props

| prop | 作用 |
|---|---|
| `href` | 目标地址，字符串或对象 `{ pathname, query }` |
| `prefetch` | 是否预取。`true`（默认，prod）/ `false` 关闭 |
| `scroll` | 导航后是否滚到顶部。默认 `true`；`false` 可保持滚动位置 |
| `replace` | 用 `replaceState` 代替 `pushState`，不留下历史记录 |
| `onNavigate` | 导航**前**的拦截回调（Next 15.3+） |

### 1.3 `useRouter()` 的方法

| 方法 | 作用 |
|---|---|
| `push(url)` | 软导航，**留下**历史记录 |
| `replace(url)` | 软导航，**替换**当前记录 |
| `back()` / `forward()` | 历史导航 |
| `refresh()` | 重新请求当前路由的服务器数据（不重新加载整个页面） |
| `prefetch(url)` | 手动预取 |

### 1.4 `next/script` 的四种加载策略

```tsx
<Script src="..." strategy="beforeInteractive" />  {/* 必须在 hydration 前 */}
<Script src="..." strategy="afterInteractive" />   {/* 默认，hydration 后立即 */}
<Script src="..." strategy="lazyOnload" />          {/* 浏览器空闲时 */}
<Script src="..." strategy="worker" />              {/* Web Worker 里执行 */}
```

---

## 二、五个导航 Hook

### 2.1 真实代码 `app/(root)/hooks/HooksClient.tsx`

```tsx
"use client";
import {
  useParams,
  usePathname,
  useSearchParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
} from "next/navigation";

export default function HooksClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const segment = useSelectedLayoutSegment();
  const segments = useSelectedLayoutSegments();

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Item name="usePathname()" value={pathname} note="当前 URL 路径（不含 query）" />
      <Item
        name="useSearchParams()"
        value={searchParams.toString()}
        note="查询字符串，需 Suspense 包裹"
      />
      <Item name="useParams()" value={JSON.stringify(params)} note="当前路由段的动态参数" />
      <Item
        name="useSelectedLayoutSegment()"
        value={segment ?? "(null)"}
        note="最近 layout 下一层的段名 —— 面包屑/导航高亮神器"
      />
      <Item
        name="useSelectedLayoutSegments()"
        value={JSON.stringify(segments)}
        note="最近 layout 以下的所有段名（数组）"
      />
    </div>
  );
}
```

### 2.2 容器 `app/(root)/hooks/page.tsx`

```tsx
import { Suspense } from "react";
import HooksClient from "./HooksClient";

/**
 * 客户端导航 Hooks。
 *
 * 关键点：useSearchParams 会让整页变成「动态渲染」，
 * 所以在静态预渲染的页面里必须用 <Suspense> 把它隔离出去，
 * 否则 next build 直接报错。
 */
export default function HooksPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1>客户端导航 Hooks</h1>
      <Suspense fallback={<div>读取中...</div>}>
        <HooksClient />
      </Suspense>
    </div>
  );
}
```

### 2.3 ⚠️ `useSearchParams` 必须包 Suspense

在静态预渲染的页面里直接用 `useSearchParams()`，`next build` 会直接报：

```text
useSearchParams() should be wrapped in a suspense boundary at page "/hooks"
```

原因：`useSearchParams` 让整页变成「依赖请求」的动态渲染，
而静态预渲染阶段没有请求上下文。`<Suspense>` 把它隔离出去，
让壳子仍能静态预渲染。

### 2.4 `useSelectedLayoutSegment(s)` 的用途

它返回**最近一层 layout 之下**的段名：

- 做面包屑
- 做「导航高亮」（当前在哪个分类下）
- 做「移动端显示/隐藏某个 tab」

**注意**：它读的是 layout 上下文，所以必须放在**某个 layout 之内**的组件里。

---

## 三、动手实验

### 实验 1：五个 Hook 的输出

访问 <http://localhost:3000/hooks>，页面上直接显示每个 Hook 的返回值。

**改 URL 观察变化**：

- <http://localhost:3000/hooks?a=1&b=2> → `useSearchParams()` 变成 `a=1&b=2`
- <http://localhost:3000/dashboard/users/7> → `useParams()` 变成 `{"id":"7"}`

### 实验 2：验证 Suspense 的必要性

把 `app/(root)/hooks/page.tsx` 里的 `<Suspense>` 去掉，直接渲染 `<HooksClient />`，
然后 `pnpm build`。

**预期**：构建失败，报 `useSearchParams() should be wrapped in a suspense boundary`。

**改回来**。

### 实验 3：对比 push 和 replace

首页点「跳转page页面」（`router.push`），然后点浏览器后退 → 回到首页。

再点「替换当前页面」（`router.replace`），然后点浏览器后退 → **不会**回到首页
（它替换了当前历史记录）。

### 实验 4：观察 prefetch

DevTools → Network，鼠标悬停在首页的 `<Link href="/about">` 上等 1 秒 ——
Network 里会出现 `/about` 的预取请求。

### 实验 5：观察软导航 vs 硬导航

首页 → 点链接到 `/about`（软导航）：页面**不会**重新加载（没有新的文档请求）。

直接刷新 `/about`（硬导航）：整页重新加载。

**观察页面顶部的状态计数器**（`/basic/a` 那组）—— 软导航时 layout 的计数保留，
硬刷新时归零（见第 05 课）。

---

## 四、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 静态页直接用 `useSearchParams` | 构建失败 | 包 `<Suspense>` |
| 在服务端组件里用这些 Hook | 报错 | 加 `"use client"` |
| `useSelectedLayoutSegment` 组件不在 layout 内 | 拿不到值 | 放到 layout 之下 |
| 用原生 `<a>` 做内部跳转 | 整页刷新，丢状态 | 用 `<Link>` |
| 把 `router.refresh()` 当成刷新页面 | 误解 | 它只重新取服务器数据 |

---

## 五、自检

1. `<Link>` 和 `useRouter().push()` 都能软导航，区别在哪？
2. `router.replace()` 和 `push()` 的区别？
3. 五个导航 Hook 分别返回什么？
4. 为什么 `useSearchParams` 必须包 `<Suspense>`？

---

## 六、小结 & 下一步

- `<Link>` 用于页面里的链接，`useRouter` 用于命令式跳转。
- 五个 Hook 覆盖路径、query、动态参数、layout 段名。
- **`useSearchParams` 在静态页必须包 Suspense**。

**下一课** → [第 22 课 · 图片与字体优化](22_图片与字体优化.md)
