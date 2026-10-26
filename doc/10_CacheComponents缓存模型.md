# 第 10 课 · Cache Components 缓存模型

> **学习目标**：掌握 Next 16 的新缓存模型 —— 用 `"use cache"` 声明缓存、用 `connection()` 声明动态，理解它为什么取代了旧的段级配置。
> **对应代码**：`next.config.ts`、`app/mycache/`、`app/(root)/ssg/[id]/page.tsx`
> **预计耗时**：50 分钟

---

## 一、核心概念

Next 16 的 **Cache Components** 把「这段要不要缓存」从**隐式推断**变成**显式声明**。

| | 声明缓存 | 声明动态 |
|---|---|---|
| 指令 | `"use cache"` | `await connection()` |
| 作用范围 | 一个函数 / 组件 | 一个组件 / 代码段 |
| 配套 API | `cacheLife()` `cacheTag()` | —— |

---

## 二、开关与代价

`next.config.ts`（**本仓库已开启**）：

```ts
const nextConfig: NextConfig = {
  // 开启reactCompiler
  reactCompiler: true,
  // 控制Turbopack 开发服务器文件系统缓存,觉得缓存错误时，删掉.next，重新编译
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  // 开启缓存
  // cacheComponents: true // 启用缓存组件
  cacheComponents: true, // 缓存组件(关闭或者不配置)
  images: {
    remotePatterns: [
      {
        protocol: 'https', // 协议
        hostname: 'eo-img.521799.xyz', // 主机名
        pathname: '/i/pc/**', // 路径
        port: '', // 端口
      },
    ],
    formats: ['image/avif', 'image/webp'], //默认是 ['image/webp']
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 设备尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 图片尺寸
  },
  // 配置SSG全静态站点
  // output: "export", // 导出静态站点
  // distDir: "dist", // 导出目录
  // trailingSlash: true, // 添加尾部斜杠，生成 /about/index.html 而不是 /about.html
  // 支持MDX
  // pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

export default nextConfig;
```

### ⚠️ 开启后的强制约束

开启 `cacheComponents` 后，**段级配置全部被禁用**（构建期直接报错，不是警告）：

| 被禁用的写法 | 报错原文 | 现代替代 |
|---|---|---|
| `export const dynamic = "force-dynamic"` | `Route segment config "dynamic" is not compatible with nextConfig.cacheComponents` | `await connection()` |
| `export const revalidate = 5` | 同上（revalidate） | `"use cache"` + `cacheLife()` |
| `export const dynamicParams = false` | 同上（dynamicParams） | 固定为 fallback: blocking |

> ⚠️ 反过来也成立：**关掉 `cacheComponents`，本仓库直接构建失败** ——
> 因为 `app/mycache/CachedPart.tsx` 和 `app/(root)/ssg/[id]/page.tsx` 用了 `"use cache"`：
> ```text
> To use "use cache", please enable the feature flag `cacheComponents` in your Next.js config.
> ```
> **本仓库的缓存开关已经不可逆。**

---

## 三、真实代码：同页对照

`app/mycache/page.tsx` 把两块内容放在同一张页面：

```tsx
import { Suspense } from "react";
import CachedPart from "./CachedPart";
import DynamicPart from "./DynamicPart";

/**
 * 缓存知识点的「同页对照组」。
 *
 * 开启 Cache Components（next.config.ts: cacheComponents: true）后，
 * 页面默认走「部分预渲染」：静态壳子先出，动态部分流式追加。
 *
 * 旧时代写法对照（Cache Components 开启后【不可用】，构建期会直接报错）：
 *   export const dynamic = "force-dynamic";   // ❌ 与 cacheComponents 冲突
 *   export const revalidate = 5;              // ❌ 同样不再支持
 * 新时代写法：
 *   "use cache" + cacheLife() + cacheTag()    // ✅ 声明式缓存
 *   await connection()                        // ✅ 声明式动态
 */
export default async function Home() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <h1>缓存 · 缓存组件 vs 动态渲染</h1>
      <p className="text-sm opacity-70">
        下面两块内容在同一张页面里，唯一差别是：上面那块声明了「use cache」，
        下面那块声明了 connection()。
      </p>

      <Suspense fallback={<div>缓存部分 Loading...</div>}>
        <CachedPart />
      </Suspense>

      <Suspense fallback={<div>动态部分 Loading...</div>}>
        <DynamicPart />
      </Suspense>
    </div>
  );
}
```

### 3.1 缓存侧 `app/mycache/CachedPart.tsx`

```tsx
import { cacheLife, cacheTag } from "next/cache";

/**
 * 「use cache」= Next 16 Cache Components 的核心指令。
 *
 * 它必须写在 **函数体第一行**（或文件顶层），把整个函数变成「缓存组件」：
 *  - 函数的参数与返回值必须是 **可序列化**的；
 *  - 缓存键由函数本身的标识 + 参数共同决定；
 *  - 缓存生命周期由 cacheLife() 控制；
 *  - 缓存可用 cacheTag() 打标签，配合 revalidateTag() 按需失效。
 *
 * 注意：需要开启 next.config.ts 的 cacheComponents: true 才生效。
 */
async function getCachedName() {
  "use cache";

  // 预设档位：seconds | minutes | hours | days | weeks | max
  cacheLife("hours");

  // 打标签，之后可以用 revalidateTag("mycache-demo") 精准失效这一条缓存
  cacheTag("mycache-demo");

  // 故意用随机数：被缓存后，多次刷新页面这个值【不会变】，
  // 这正是「缓存命中」最直观的证据（对照 DynamicPart 每次都变）。
  return { name: `随机名字-${Math.random().toString(36).slice(2, 8)}`, at: Date.now() };
}

export default async function CachedPart() {
  const data = await getCachedName();
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-950">
      <h2 className="text-lg font-semibold">① 「use cache」缓存组件</h2>
      <p>名称：{data.name}</p>
      <p className="text-xs opacity-70">生成时间：{new Date(data.at).toLocaleString("zh-CN")}</p>
      <p className="text-xs opacity-70">
        ↻ 反复刷新本页，这个「名称」不会变 —— 因为它被缓存了（cacheLife: hours）。
      </p>
    </div>
  );
}
```

### 3.2 动态侧 `app/mycache/DynamicPart.tsx`

```tsx
/* eslint-disable react-hooks/purity */
import { connection } from "next/server";

/**
 * connection() = Next 16 显式的「进入动态渲染」开关。
 *
 * 在开启 Cache Components 之后，旧的 `export const dynamic = "force-dynamic"`
 * 已经不被允许（构建期直接报错），取而代之的就是 connection()：
 * 框架会保证这个子树在【每次请求时】才渲染，而不是在构建期预渲染。
 */
export default async function DynamicPart() {
  // 显式声明：这一段不要预渲染，等真实请求来了再算
  await connection();

  const name = `随机名字-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950">
      <h2 className="text-lg font-semibold">② connection() 动态渲染</h2>
      <p>名称：{name}</p>
      <p className="text-xs opacity-70">生成时间：{new Date().toLocaleString("zh-CN")}</p>
      <p className="text-xs opacity-70">
        ↻ 反复刷新本页，这个「名称」每次都变 —— 因为它绕过了缓存。
      </p>
    </div>
  );
}
```

---

## 四、`cacheLife()` 的三段语义

```tsx
"use cache";
cacheLife({
  stale: 30,      // 客户端可无网络验证地使用 30s（不发请求直接用）
  revalidate: 60, // 服务端 60s 内可返回旧值，但后台重算
  expire: 3600,   // 硬过期：超过 1h 必须重新计算
});
```

类比 Cache-Control：`max-age=stale`、`s-max-age=revalidate`、
`stale-while-revalidate=expire-revalidate`。

| 字段 | 含义 | 谁在用 |
|---|---|---|
| `stale` | 客户端在这段时间内可以直接用旧值，不发请求也不校验 | 浏览器 |
| `revalidate` | 服务端在这段时间内可以返回旧值，但后台会重算 | 服务端 |
| `expire` | 硬过期，超过就必须重新计算 | 服务端 |

**预设档位**（Next 16.3.8 实测）：

```ts
cacheLife("default" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "max");
```

本仓库实测对照：

| 写法 | 构建输出 |
|---|---|
| `cacheLife("hours")` | `Revalidate 1h` / `Expire 1d` |
| `cacheLife({stale:30, revalidate:60, expire:3600})` | `Revalidate 1m` / `Expire 1h` |

---

## 五、动手实验

### 实验 1：最直观的缓存验证

访问 <http://localhost:3000/mycache>，然后**反复刷新**（F5）。

**观察**：

- 上面绿色框（`CachedPart`）的「随机名字」**永远不变** —— 因为它被缓存了
- 下面橙色框（`DynamicPart`）的「随机名字」**每次都变** —— 因为它绕过了缓存

不需要看任何日志，刷新几次就懂了。

### 实验 2：看构建产物的缓存参数

```bash
pnpm build 2>&1 | grep -A2 mycache
```

**预期**：

```text
├ ◐ /mycache                           1h      1d
```

`◐` = Partial Prerender（静态壳子 + 流式动态内容），
`1h` = Revalidate，`1d` = Expire。

再跑一次完整输出，你会看到**全站大量 `◐`** —— 这就是 Cache Components 的默认形态。

### 实验 3：改 cacheLife 看构建输出变化

把 `app/mycache/CachedPart.tsx` 里的 `cacheLife("hours")` 改成 `cacheLife("minutes")`：

```bash
pnpm build 2>&1 | grep mycache
```

**预期**：`Revalidate` 从 `1h` 变成 `1m`。

### 实验 4：亲眼看到「段级配置被禁用」

在 `app/mycache/page.tsx` 顶部加一行：

```tsx
export const dynamic = "force-dynamic";
```

```bash
pnpm build
```

**预期**：构建失败，报错：

```text
Error: Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. Please remove it.
```

**删掉那行**再继续。

### 实验 5：验证「use cache 需要开关」

把 `next.config.ts` 里的 `cacheComponents: true` 改成 `false`，然后 `pnpm build`。

**预期**：构建失败：

```text
To use "use cache", please enable the feature flag `cacheComponents` in your Next.js config.
```

**改回 `true`**。

### 实验 6：验证可序列化约束

把 `getCachedName` 的参数改成接收一个函数：

```tsx
async function getCachedName(fn: () => void) {
  "use cache";
  return { name: "x" };
}
```

**预期**：TypeScript 报错 —— `"use cache"` 函数的参数必须可序列化。

---

## 六、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 忘了开 `cacheComponents` | 构建失败 | 开关是 `"use cache"` 的硬前提 |
| 开了开关还用 `export const dynamic` | 构建失败 | 改用 `await connection()` |
| `"use cache"` 放在函数体中间 | 指令失效 / 报错 | 必须是函数体**第一行** |
| `"use cache"` 函数接收函数参数 | TS 报错 | 参数必须可序列化 |
| 以为 `"use cache"` 函数里能读 `cookies()` | 报错 | 需要请求态就别缓存 |
| 缓存了含用户隐私的数据 | **严重安全问题** | 按用户维度打 tag，或干脆别缓存 |

---

## 七、自检

1. 开启 `cacheComponents` 后，三个段级配置分别被什么替代？
2. `cacheLife` 的 `stale` / `revalidate` / `expire` 分别是谁在用？
3. 为什么 `"use cache"` 函数里不能传函数作为参数？
4. `cacheLife("hours")` 对应构建输出里的哪两个数字？

---

## 八、小结 & 下一步

- Cache Components = **显式声明**缓存还是动态，取代旧的段级配置。
- `"use cache"` + `cacheLife()` / `cacheTag()` 声明缓存；`await connection()` 声明动态。
- 开启后**不能再用** `dynamic` / `revalidate` / `dynamicParams`。
- 全站默认形态是 `◐`（PPR）。

**下一课** → [第 11 课 · 静态生成与 ISR](11_静态生成与ISR.md)
