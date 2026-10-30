# 第 07 课 · RSC 与客户端组件的边界

> **学习目标**：搞清楚「代码到底跑在服务端还是浏览器」，以及怎么用「服务端壳 + 客户端岛」把 JS 体积压到最小。
> **对应代码**：`app/client/page.tsx`、`app/serveronly/page.tsx`、`components/navigation/navbar/index.tsx`、`components/DarkMode.tsx`
> **预计耗时**：45 分钟
> **前置知识**：第 01、02 课

---

## 一、核心概念

Next.js App Router 里，组件默认是**服务端组件（RSC）**。

| | 服务端组件（RSC） | 客户端组件（`"use client"`） |
|---|---|---|
| 默认？ | ✅ 是 | 需显式声明 |
| 能用 `useState`/`useEffect` | ❌ | ✅ |
| 能用 `document`/`window` | ❌ | ✅ |
| 能访问数据库 / 文件系统 / 密钥 | ✅ | ❌ |
| 代码进浏览器包 | ❌ | ✅ |
| 参与 SSR 生成首屏 HTML | ✅ | ✅（也会） |

**关键理解**：`"use client"` **不是**「这段代码只在浏览器跑」，而是
**「这个组件及其 import 的整棵子树都要进浏览器包」**。

---

## 二、证据链：三个页面

### 证据一：`app/client/page.tsx` —— 代码确实被下载到浏览器了

```tsx
"use client";
import { useEffect, useState } from "react";
console.log("client");
export default function ClientPage() {
  const [count, setCount] = useState(0);
  console.log("client X");
  useEffect(() => {
    console.log(document, window);
  }, []);
  return (
    <div>
      <h1>Server Page</h1>
      <button onClick={() => setCount(count + 1)}>点击</button>
      <p>{count}</p>
    </div>
  );
}
```

打开 <http://localhost:3000/client>，打开浏览器控制台：

- `"client"` 在**服务端终端**和**浏览器控制台**都打印了一次
  —— 说明客户端组件**也会参与 SSR**（生成首屏 HTML），之后才由浏览器 hydrate 接管
- `"client X"` 每次渲染都打印
- `useEffect` 里能拿到 `document`、`window`

> 注意这个文件的 h1 写的是 "Server Page" —— 这是仓库里的一个笔误，
> 但不影响演示效果（它确实是客户端组件）。

### 证据二：服务端组件能做什么

`app/(root)/albums/page.tsx`：

```tsx
import React from "react";
import { connection } from "next/server";

/**
 * 服务端组件（无 "use client"）直接 fetch 外部接口 —— 请求发生在服务端，
 * 不占用客户端带宽，也不会有跨域问题。
 *
 * Next 16 + Cache Components：旧的 `export const dynamic = "force-dynamic"`
 * 与 cacheComponents 冲突（构建期报错），改用 connection() 显式声明动态渲染。
 */
export default async function Albums() {
  // 显式声明「这一段要实时数据」，框架就不会在构建期预渲染它
  await connection();

  let albums: { id: number; title: string }[] = [];
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/albums");
    if (response.ok) {
      albums = await response.json();
    }
  } catch {
    // 外部接口不可用时兜底，避免整页 500
    albums = [];
  }

  return (
    <div className="p-6">
      <h1>Albums（服务端取数）</h1>
      {albums.length === 0 ? (
        <p className="text-sm opacity-70">外部接口未连通，已使用空数据兜底。</p>
      ) : (
        albums.map((album) => (
          <div key={album.id}>
            {album.id}----{album.title}
          </div>
        ))
      )}
    </div>
  );
}
```

服务端组件可以直接 `fetch` 外部接口、读数据库、读文件 —— 这些在浏览器里根本做不到。

### 证据三：`app/serveronly/page.tsx` —— 编译期就把误用打死

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

细节见下一课。

---

## 三、最佳实践：服务端壳 + 客户端岛

### 3.1 服务端壳

`components/navigation/navbar/index.tsx`（**没有** `"use client"`）：

```tsx
import Link from "next/link";
import React from "react";
import Image from "next/image";
import ThemeToggle from "@/components/theme/ThemeToggle";
const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-lignt-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/globe.svg" width={23} height={23} alt="logo"></Image>
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Flow</span>
        </p>
      </Link>
      <Link
        href="/search"
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        搜索
      </Link>
      <div className="flex-between gap-5">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
```

### 3.2 客户端岛

`components/theme/ThemeToggle.tsx`（**有** `"use client"`）：

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      title="切换亮色 / 暗色模式"
      className={
        "relative inline-flex h-8 w-8 items-center justify-center rounded-md border " +
        "border-gray-300 transition hover:bg-gray-100 " +
        "dark:border-gray-700 dark:hover:bg-gray-800 " +
        className
      }
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换亮色 / 暗色模式</span>
    </button>
  );
}
```

> ⚠️ 为什么图标不用 React state 控制？服务端渲染时读不到 `localStorage`，
> 首帧必然与客户端不一致 → hydration mismatch。
> 双图标都在 DOM 里、靠 CSS 的 `scale/rotate` 切换 → 服务端与客户端 HTML 完全一致。
> 详见 [第 27 课 · 零依赖主题切换](27_零依赖主题切换.md)。

> 另有一个**三态版本**（浅色 / 深色 / 跟随系统）在 `components/DarkMode.tsx`，
> 用 shadcn 的 DropdownMenu 实现，同样不依赖 `next-themes`。

**整个 Navbar 里只有 `ThemeToggle` 这一小块是客户端的** —— 只有它的 JS 会被下发。
Navbar 本身、Logo 图片、链接全是服务端渲染的。

### 3.3 原则

> **把 `"use client"` 尽可能推向叶子节点。**

一个组件标了 `"use client"`，它 import 的**整棵子树**都会被拖进浏览器包。

反例（本仓库的历史遗留，见 `app/(root)/home/page.tsx`）：

```tsx
"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
const checkLogin = async () => {
  const res = await fetch("/api/login");
  const data = await res.json();
  if (data.code === 1) {
    return true;
  } else {
    redirect("/");
  }
};
export default function HomePage() {
  useEffect(() => {
    checkLogin();
  }, []);
  return <div className="pt-30">你已经登录进入home页面</div>;
}
```

这个反模式有**两个**问题：

1. 整个页面成了客户端组件（能用，但没必要）
2. **鉴权在客户端做 = 没有鉴权** —— 用户直接访问就能拿到内容。
   正确做法是在 `proxy.ts`（请求级）或服务端 layout 里做。

---

## 四、动手实验

### 实验 1：看 console.log 出现在哪

1. `pnpm dev`，终端保持可见
2. 打开 <http://localhost:3000/client>
3. 浏览器控制台里看到 `"client"` 和 `"client X"`
4. **服务端终端**里也看到 `"client"` 和 `"client X"`

**结论**：客户端组件也参与 SSR。这是 Next.js 里最容易误解的一点。

### 实验 2：验证「子树被拖进浏览器包」

新建 `app/client/child.tsx`：

```tsx
"use client";
export default function Child() {
  console.log("CHILD MODULE LOADED");
  return <div>child</div>;
}
```

在 `app/client/page.tsx` 里 import 它。

**观察**：控制台出现 `CHILD MODULE LOADED`。

再把 `"use client"` 从 child.tsx 里删掉（让它变成服务端组件），
但仍然从客户端组件里 import 它 —— 此时 `Child` 会被当成**客户端组件**渲染
（因为父级是客户端的），只是它自己不再额外打包。

**结论**：边界是**单向传导**的 —— 客户端组件可以 import 服务端组件，
但服务端组件不能 import 客户端组件后还能用 hooks。

### 实验 3：验证 server-only 的编译期拦截

1. 新建 `app/client/bad-import.tsx`：

```tsx
"use client";
import ServerOnly from "@/app/serveronly/page";
export default function Bad() {
  return <ServerOnly />;
}
```

2. 在 `app/client/page.tsx` 里 import 它
3. `pnpm build`

**预期**：构建失败，报错类似：

```text
You're importing a component that needs "server-only".
That only works in a Server Component which is not supported in the pages/ directory.
```

4. 删掉 `bad-import.tsx` 并恢复 `page.tsx`

### 实验 4：对比 JS 体积

```bash
pnpm build
# 看输出里的 First Load JS
```

对比 `/`（Navbar 只有一个客户端岛）和 `/client`（整页客户端）两个路由的
First Load JS 差别。差别不大是因为这个仓库很小，但概念是真实的：
客户端组件越多、它 import 的子树越大，下发的 JS 越多。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 在页面顶部随手加 `"use client"` | 整页进浏览器包，props 不能传函数 | 只在真正需要交互的叶子节点加 |
| 服务端组件里用 `useState` | 编译报错 | 加 `"use client"`，或把状态提到客户端子组件 |
| 客户端组件里读 `process.env.SECRET` | 拿到 `undefined` | 密钥只能在服务端读 |
| 在客户端组件里做鉴权 | 等于没鉴权 | 放 `proxy.ts` 或服务端 layout |
| 服务端组件给客户端组件传函数 prop | 序列化报错 | 传 Server Action |

---

## 六、自检

1. `"use client"` 到底意味着「代码只在浏览器跑」吗？正确说法是什么？
2. 为什么客户端组件也会出现在服务端终端的日志里？
3. `components/DarkMode.tsx` 是客户端组件，那 `components/navigation/navbar/index.tsx` 呢？
4. 为什么在 `useEffect` 里做鉴权是无效的？

---

## 七、小结 & 下一步

- 默认是服务端组件；`"use client"` 会把**整棵子树**拖进浏览器包。
- 客户端组件**也参与 SSR** —— 日志会在服务端和浏览器各出现一次。
- 最佳实践：服务端壳 + 客户端岛，把 `"use client"` 推向叶子节点。

**下一课** → [第 08 课 · server-only 与编译期约束](08_server-only与编译期约束.md)
