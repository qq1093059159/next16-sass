# next16-sass 教学文档

> 这是 `next16-sass` 仓库的**教学化拆解** —— 25 课，一次一个知识点。
> 每一课都基于**仓库里的真实代码**，配可动手验证的实验步骤。

---

## 怎么用这套文档

| 你的角色 | 怎么做 |
|---|---|
| **学生（你）** | 按 01 → 25 顺序推进。每课先读概念，再照着「动手实验」改代码、刷新浏览器看变化，最后做「自检」。 |
| **老师（我）** | 每课我讲解原理 + 你现场复现 + 我纠错。实验做不出来就是环境或理解有问题，当场查。 |

**核心方法论**：这个仓库的价值不在「读懂」，在「**改一行 → 刷新 → 看框架反应**」。
每课的实验环节都是为你设计的可验证动作。

### 前置准备

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

同时打开两个页面：

- <http://localhost:3000/knowledge> —— 运行时知识点地图（9 大主题 50+ 条，带代码位置）
- <http://localhost:3000> —— 首页

---

## 课程目录

### 第一部分 · 路由与布局（第 01~05 课）

| 课 | 主题 | 你会学到 |
|---|---|---|
| [01](01_项目总览与运行方式.md) | 项目总览与运行方式 | 仓库定位、三种构建标记（`○`/`◐`/`ƒ`）、启动坑 |
| [02](02_路由约定文件八件套.md) | 路由约定文件八件套 | 八个文件名各自的契约与硬性规则、嵌套渲染顺序 |
| [03](03_路由组与平行路由.md) | 路由组与平行路由 | `(folder)` vs `@folder`、`default.tsx` 的实测行为 |
| [04](04_动态路由三兄弟.md) | 动态路由三兄弟 | `[id]` / `[...id]` / `[[...id]]`、`params` 是 Promise |
| [05](05_layout与template的状态实验.md) | layout 与 template | 状态保留 vs 归零的对照实验、工程选型 |

### 第二部分 · 渲染模型（第 06~12 课）

| 课 | 主题 | 你会学到 |
|---|---|---|
| [06](06_错误边界与404状态码.md) | 错误边界与 404 状态码 | 错误边界层级、**PPR 下 `notFound()` 返回 200 的真相** |
| [07](07_RSC与客户端组件的边界.md) | RSC 与客户端组件 | `"use client"` 的真实含义、服务端壳 + 客户端岛 |
| [08](08_server-only与编译期约束.md) | server-only 约束 | 编译期护栏、为什么比运行时报错好 |
| [09](09_Suspense与流式渲染.md) | Suspense 与流式渲染 | `loading.tsx` 是语法糖、`connection()`、PPR 基础 |
| [10](10_CacheComponents缓存模型.md) | Cache Components | `"use cache"` / `cacheLife` / `cacheTag`、段级配置为何被禁 |
| [11](11_静态生成与ISR.md) | 静态生成与 ISR | `generateStaticParams`、`cacheLife` 三段语义、`x-nextjs-cache` |
| [12](12_按需失效四件套.md) | 按需失效四件套 | `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` |

### 第三部分 · 数据变更（第 13~15 课）

| 课 | 主题 | 你会学到 |
|---|---|---|
| [13](13_ServerActions三阶段演进.md) | Server Actions 三阶段 | fetch → Server Action → useActionState + Zod 的取舍 |
| [14](14_乐观更新与表单状态.md) | 乐观更新与表单状态 | `useOptimistic`、`useFormStatus`（必须拆子组件） |
| [15](15_响应后任务after.md) | 响应后任务 `after()` | 埋点/日志不阻塞首屏的正确姿势 |

### 第四部分 · Route Handlers（第 16~19 课）

| 课 | 主题 | 你会学到 |
|---|---|---|
| [16](16_RouteHandlers基础.md) | Route Handlers 基础 | 方法导出、请求体五种解析、**不写 OPTIONS → 405** |
| [17](17_Cookie读写与会话.md) | Cookie 读写与会话 | 两种写法、`httpOnly`/`secure`/`sameSite` |
| [18](18_CORS重定向与改写.md) | CORS / 重定向 / 改写 | 预检流程、`redirect` vs `rewrite` |
| [19](19_流式响应SSE.md) | 流式响应 SSE | `ReadableStream` 逐块推送、`no-transform` 为何不能少 |

### 第五部分 · 元数据与客户端能力（第 20~24 课）

| 课 | 主题 | 你会学到 |
|---|---|---|
| [20](20_元数据与SEO约定文件.md) | 元数据与 SEO 约定文件 | `metadata`/`generateMetadata`/`viewport`、六个约定文件 |
| [21](21_客户端导航与Hooks.md) | 客户端导航与 Hooks | `Link` vs `useRouter`、五个导航 Hook |
| [22](22_图片与字体优化.md) | 图片与字体优化 | `next/image` 三种来源、`sizes`、`next/font` |
| [23](23_proxy与instrumentation.md) | proxy 与 instrumentation | Next 16 的 `middleware.ts` → `proxy.ts` 改名、监控钩子 |
| [24](24_环境变量与样式体系.md) | 环境变量与样式体系 | `NEXT_PUBLIC_` 可见性、Tailwind v4 CSS-first、`cn()` 工具链 |

### 第六部分 · 复习（第 25 课）

| 课 | 主题 | 你会学到 |
|---|---|---|
| [25](25_实测踩坑与学习路线.md) | 实测踩坑与学习路线 | 12 条**实测复现**的坑 + 24 天路线 + 毕业自检 |

---

## 学习建议

1. **别只读**。每课的「动手实验」做完再往下走 —— 尤其是第 05、06、10、16 课，
   那些实验结论和直觉相反。
2. **做不出来先怀疑自己**，再怀疑环境。本仓库有三个高频环境坑：
   - Turbopack 缓存错乱 → 先停 `dev`，再删 `.next`
   - 删了 `.next` 但 dev 还在跑 → 删不掉
   - 端口 3000 被占用 → 旧服务还在，提供的是**旧构建**的结果
3. **每课末尾的「自检」**要能口头答出来再往下。答不上来就回看那一课。
4. **配合运行时索引**：<http://localhost:3000/knowledge>

---

## 相关文档

| 文档 | 用途 |
|---|---|
| 仓库根目录 `README.md` | 唯一项目说明文档（技术栈、路由全景、27 个知识点主题、缺陷清单） |
| 本目录 `doc/` | 教学拆解（25 课） |
| `/knowledge` 运行时页面 | 可点击的知识点地图，带代码位置 |
