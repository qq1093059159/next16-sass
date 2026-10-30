# next16-sass 教学文档

> 这是 `next16-sass` 仓库的**教学化拆解** —— 27 课，一次一个知识点。
> 每一课都基于**仓库里的真实代码**，配可动手验证的实验步骤。

---

## 这套文档怎么保证「学不到错的」

写教学文档最大的风险是**把错的教出去**。这套文档用四道关卡守住正确性：

**① 代码逐字核对**
所有标注「真实代码」的代码块都逐行取自仓库源码；写完后用脚本把每个代码块与全仓源码
做逐行比对，低匹配项**逐个人工判读**（教学引导用的新文件、刻意写错的反例、换行展示均已确认）。

**② API 时效性验证**
用 TypeScript 探针把文档提到的**每一个** API 全部导入并按文档里的签名调用一遍，
`tsc` **零错误**通过。覆盖 `"use cache"`、`cacheLife`、`cacheTag`、`revalidatePath`、
`revalidateTag`、`updateTag`、`refresh`、`after`、`connection`、`useOptimistic`、
`useFormStatus`、`useActionState`、`ImageResponse`、`Link` 的 `onNavigate`、
`next/script` 的四种 `strategy`、`next/font` 的全部选项等。

**③ 行为实测复现**
文档里所有反直觉的结论（PPR 下 `notFound()` 返回 200、不写 `OPTIONS` 返回 405、
`middleware.ts` 与 `proxy.ts` 冲突…）都是在生产实例上用 `curl` **实测复现**的，不是文档推断。

**④ 锚点与链接校验**
用官方 `github-slugger` 复算全部标题锚点；文档内引用的文件路径经多前缀解析逐个核对存在性；
`doc/` 内部链接全部有效。

> 文档中标注「节选」的代码块表示为了聚焦重点做了裁剪，其余均为**完整逐字**引用。

---

## 怎么用这套文档

| 你的角色 | 怎么做 |
|---|---|
| **学生（你）** | 按 01 → 25 顺序推进。每课先读概念，再照着「动手实验」改代码、刷新浏览器看变化，最后做「自检」。 |
| **老师（我）** | 每课我讲解原理 + 你现场复现 + 我纠错。实验做不出来就是环境或理解有问题，当场查。 |

**核心方法论**：这个仓库的价值不在「读懂」，在「**改一行 → 刷新 → 看框架反应**」。
每课的实验环节都是为你设计的可验证动作。

### 单独阅读某一课

每课开头都标注了 **前置知识**，所以从中间某一课开始读也没问题 —— 只要先补上前置那几课。
每课都是**自包含**的：概念、代码、实验、自检都在同一篇里。

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

| 课 | 主题 | 一句话速览 |
|---|---|---|
| [01](01_项目总览与运行方式.md) | 项目总览与运行方式 | 仓库定位、三种构建标记、启动坑 |
| [02](02_路由约定文件八件套.md) | 路由约定文件八件套 | 八个文件名各自的契约与硬性规则 |
| [03](03_路由组与平行路由.md) | 路由组与平行路由 | `(folder)` vs `@folder`、`default.tsx` 的实测行为 |
| [04](04_动态路由三兄弟.md) | 动态路由三兄弟 | 三种动态段、`params` 是 Promise |
| [05](05_layout与template的状态实验.md) | layout 与 template | 状态保留 vs 归零的对照实验 |

### 第二部分 · 渲染模型（第 06~12 课）

| 课 | 主题 | 一句话速览 |
|---|---|---|
| [06](06_错误边界与404状态码.md) | 错误边界与 404 状态码 | 边界层级、**PPR 下 `notFound()` 返回 200 的真相** |
| [07](07_RSC与客户端组件的边界.md) | RSC 与客户端组件边界 | `"use client"` 的真实含义、服务端壳 + 客户端岛 |
| [08](08_server-only与编译期约束.md) | server-only 约束 | 编译期护栏、为什么比运行时报错好 |
| [09](09_Suspense与流式渲染.md) | Suspense 与流式渲染 | `loading.tsx` 是语法糖、`connection()` |
| [10](10_CacheComponents缓存模型.md) | Cache Components | `"use cache"` / `cacheLife` / `cacheTag` |
| [11](11_静态生成与ISR.md) | 静态生成与 ISR | `generateStaticParams`、`x-nextjs-cache` |
| [12](12_按需失效四件套.md) | 按需失效四件套 | `revalidatePath` / `revalidateTag` / `updateTag` / `refresh` |

### 第三部分 · 数据变更（第 13~15 课）

| 课 | 主题 | 一句话速览 |
|---|---|---|
| [13](13_ServerActions三阶段演进.md) | Server Actions 三阶段 | fetch → Server Action → useActionState + Zod |
| [14](14_乐观更新与表单状态.md) | 乐观更新与表单状态 | `useOptimistic`、`useFormStatus`（必须拆子组件） |
| [15](15_响应后任务after.md) | 响应后任务 `after()` | 埋点/日志不阻塞首屏 |

### 第四部分 · Route Handlers（第 16~19 课）

| 课 | 主题 | 一句话速览 |
|---|---|---|
| [16](16_RouteHandlers基础.md) | Route Handlers 基础 | 方法导出、请求体五种解析、**不写 OPTIONS → 405** |
| [17](17_Cookie读写与会话.md) | Cookie 读写与会话 | 两种写法、`httpOnly`/`secure`/`sameSite` |
| [18](18_CORS重定向与改写.md) | CORS / 重定向 / 改写 | 预检流程、`redirect` vs `rewrite` |
| [19](19_流式响应SSE.md) | 流式响应 SSE | `ReadableStream` 逐块推送、`no-transform` 为何不能少 |

### 第五部分 · 元数据与客户端能力（第 20~24 课）

| 课 | 主题 | 一句话速览 |
|---|---|---|
| [20](20_元数据与SEO约定文件.md) | 元数据与 SEO 约定文件 | `metadata`/`generateMetadata`/`viewport` + 六个约定文件 |
| [21](21_客户端导航与Hooks.md) | 客户端导航与 Hooks | `Link` vs `useRouter`、五个导航 Hook |
| [22](22_图片与字体优化.md) | 图片与字体优化 | `next/image` 三种来源、`sizes`、`next/font` |
| [23](23_proxy与instrumentation.md) | proxy 与 instrumentation | Next 16 的 `middleware.ts` → `proxy.ts` 改名 |
| [24](24_环境变量与样式体系.md) | 环境变量与样式体系 | `NEXT_PUBLIC_` 可见性、Tailwind v4 CSS-first、`cn()` |

### 第六部分 · 复习（第 25 课）

| 课 | 主题 | 一句话速览 |
|---|---|---|
| [25](25_实测踩坑与学习路线.md) | 实测踩坑与学习路线 | 12 条**实测复现**的坑 + 24 天路线 + 毕业自检 |
| [26](26_MDX与内容目录.md) | MDX 与内容目录（**扩展课**） | `@next/mdx` 做什么与不做什么；「目录即内容源」的实现；**内容引擎基座的完整拆解**（SEO / TOC / 归档 / 相关文章） |
| [27](27_零依赖主题切换.md) | 零依赖主题切换（**扩展课**） | 弃用 `next-themes`；`.dark` 类 + CSS 变量 + 防闪烁脚本；**hydration mismatch 的三种解法** |

---

## 相关文档

| 文档 | 用途 |
|---|---|
| 仓库根目录 `README.md` | 唯一项目说明文档（技术栈、路由全景、27 个知识点主题、缺陷清单） |
| 本目录 `doc/` | 教学拆解（27 课） |
| `/knowledge` 运行时页面 | 可点击的知识点地图，带代码位置 |
