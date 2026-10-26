# 第 11 课 · 静态生成与 ISR

> **学习目标**：掌握 `generateStaticParams` 与 `cacheLife` 如何组合出「静态生成 + 增量静态再生」。
> **对应代码**：`app/(root)/ssg/[id]/page.tsx`、`app/(root)/ssg/page.tsx`
> **预计耗时**：35 分钟

---

## 一、核心概念

| 概念 | 含义 |
|---|---|
| **SSG**（静态生成） | 构建期就把 HTML 生成好，部署后直接吐静态文件 |
| **ISR**（增量静态再生） | 静态页过期后，后台重新生成，用户不等待 |
| `generateStaticParams` | 告诉 Next「构建期要预渲染哪些具体路径」 |
| `cacheLife` | 决定这些静态页多久过期一次 |

三者的关系：

```text
generateStaticParams  →  哪些路径被预渲染
cacheLife             →  这些页面多久过期
cacheTag              →  内容变了怎么精准失效（第 12 课）
```

---

## 二、真实代码

`app/(root)/ssg/[id]/page.tsx`（关键片段）：

```tsx
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

const posts = [
  { id: "1", title: "第一篇：App Router 入门", body: "约定文件就是路由。" },
  { id: "2", title: "第二篇：缓存模型全景", body: "use cache / connection() 两分天下。" },
  { id: "3", title: "第三篇：流式渲染", body: "Suspense 让首屏不再干等。" },
];

/**
 * 构建期执行：告诉 Next 哪些 id 需要被静态生成。
 */
export function generateStaticParams() {
  return posts.map((post) => ({ id: post.id }));
}

/**
 * dynamicParams 在 Cache Components 模式下【不可配置】：
 *   开启 cacheComponents 后，Next 16 会报
 *   Route segment config "dynamicParams" is not compatible with nextConfig.cacheComponents。
 *   实际行为固定为 fallback: blocking —— 访问没预生成的路径时，运行时按需生成（而不是 404）。
 *   如果确实要「路径必须来自数据库」，请关掉 cacheComponents 再用 dynamicParams = false。
 */

/**
 * 取数函数带 "use cache" → 这条数据会被缓存。
 * cacheLife 三段语义：
 *   stale: 30     客户端在 30s 内可无网络验证地直接用旧值
 *   revalidate: 60 服务端 60s 内可返回旧值，但后台会重算
 *   expire: 3600  超过 1h 必须重新计算
 */
async function getPost(id: string) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  cacheTag(`post-${id}`);
  return posts.find((post) => post.id === id);
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  // 找不到就抛 404 —— 由 app/not-found.tsx 接管
  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl p-6">
      <p className="text-xs opacity-60">id = {id}</p>
      <h1 className="mt-1 text-2xl font-bold">{post.title}</h1>
      <p className="mt-3">{post.body}</p>
      <div className="mt-4 flex gap-3 text-sm">
        {posts.map((p) => (
          <Link key={p.id} href={`/ssg/${p.id}`} className="underline">
            /ssg/{p.id}
          </Link>
        ))}
        <Link href="/ssg/999" className="underline opacity-60">
          /ssg/999（未预生成）
        </Link>
      </div>
    </article>
  );
}
```

---

## 三、构建产物与运行时验证

### 3.1 构建产物

```bash
pnpm build 2>&1 | sed -n '/Route (app)/,/Proxy/p'
```

你会看到：

```text
├   /ssg/[id]
│ ├ ◐ /ssg/[id]
│ ├ ○ /ssg/1      1m      1h      ← ○ 表示已预渲染为静态页
│ ├ ○ /ssg/2      1m      1h
│ └ ○ /ssg/3      1m      1h
```

- `/ssg/1~3` 是 **`○`（Static）** —— 构建期就生成了 HTML
- `1m` / `1h` 就是 `cacheLife({ revalidate: 60, expire: 3600 })` 的翻译

### 3.2 运行时响应头

```bash
pnpm start
curl -I http://127.0.0.1:3000/ssg/1
```

**预期**：

```text
x-nextjs-cache: HIT          ← 命中缓存
x-nextjs-stale-time: 30      ← 30 秒内可无网络验证地直接用旧值
```

`x-nextjs-cache` 的取值：

| 值 | 含义 |
|---|---|
| `HIT` | 命中缓存，直接返回 |
| `MISS` | 缓存过期了，这次重新生成（并写回缓存） |
| `STALE` | 命中了过期缓存，同时触发后台重算 |

---

## 四、动手实验

### 实验 1：确认三条路径被预渲染

```bash
pnpm build 2>&1 | grep -A5 "ssg"
```

**预期**：看到 `/ssg/1`、`/ssg/2`、`/ssg/3` 三个 `○` 静态页。

### 实验 2：观察缓存命中

```bash
pnpm start
curl -I http://127.0.0.1:3000/ssg/1 | grep -i x-nextjs
```

重复几次，**第一次可能是 `MISS`**（生成后写入缓存），之后都是 `HIT`。

### 实验 3：观察未预生成的路径

访问 <http://localhost:3000/ssg/999>：

- 页面显示 404 界面（数据不存在 → `notFound()`）
- 但 **HTTP 状态码是 200** —— 这是第 06 课讲过的 PPR 坑点

```bash
curl -I http://127.0.0.1:3000/ssg/999 | head -3
```

### 实验 4：改缓存时长

把 `cacheLife({ stale: 30, revalidate: 60, expire: 3600 })` 改成
`cacheLife({ stale: 30, revalidate: 10, expire: 60 })`，重新 build：

```bash
pnpm build 2>&1 | grep -A5 "ssg"
```

**预期**：`Revalidate` 从 `1m` 变成 `10s`。

### 实验 5：亲手触发 ISR 再生

```bash
pnpm start
curl -I http://127.0.0.1:3000/ssg/1 | grep -i x-nextjs-cache   # HIT
sleep 65                                                        # 等过 revalidate
curl -I http://127.0.0.1:3000/ssg/1 | grep -i x-nextjs-cache   # 可能变成 MISS / STALE
```

**观察**：过期后第一次请求会触发重新生成（MISS），之后又是 HIT。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| `generateStaticParams` 返回空数组 | 没有任何静态页 | 确认返回值格式是 `[{ param: value }]` |
| 忘了 `await params` | 静默 NaN | 见第 04 课 |
| 在 `generateStaticParams` 里用 `cookies()` | 构建期报错 | 构建期没有请求上下文 |
| `cacheLife` 没写 | 用默认档位（可能过长） | 显式指定过期策略 |
| 以为 ISR 会在访问时同步等待重新生成 | 首次访问变慢 | ISR 是后台重算，用户拿旧值不阻塞 |

---

## 六、自检

1. `generateStaticParams` 在什么时机执行？返回什么结构？
2. `cacheLife` 的 `revalidate: 60` 意味着什么？
3. 怎么用 curl 确认一个页面命中了缓存？
4. `dynamicParams` 在 Cache Components 模式下能配置吗？

---

## 七、小结 & 下一步

- `generateStaticParams` 决定「哪些路径被预渲染」，`cacheLife` 决定「多久过期」。
- 两者组合 = SSG + ISR：先静态生成，过期后后台重算，用户不阻塞。
- 缓存要精准失效，就得上标签 —— 见下一课。

**下一课** → [第 12 课 · 按需失效四件套](12_按需失效四件套.md)
