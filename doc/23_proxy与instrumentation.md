# 第 23 课 · proxy.ts 与 instrumentation.ts

> **学习目标**：掌握 Next 16 重命名后的中间件约定文件，以及服务启动/错误监控钩子。
> **对应代码**：`proxy.ts`、`app/instrumentation.ts`
> **预计耗时**：35 分钟

---

## 一、proxy.ts：Next 16 的破坏性变更

**Next 16 官方已把 `middleware.ts` 重命名为 `proxy.ts`**：

| | 旧 | 新 |
|---|---|---|
| 文件名 | `middleware.ts` | `proxy.ts` |
| 导出函数名 | `middleware` | `proxy` |
| 配置类型 | `MiddlewareConfig` | `ProxyConfig` |

> 两者**仍都从 `next/server` 导出**，新代码用 `ProxyConfig`。

### 1.1 官方警告原文（Next 16.3.8 构建时打印）

```text
The "middleware" file convention is deprecated. Please use "proxy" instead.

  To migrate automatically, run:
  npx @next/codemod@canary middleware-to-proxy .

  Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

### 1.2 同时存在两个文件会直接构建失败

**实测原文**：

```text
Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
Please use "./proxy.ts" only. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

### 1.3 本仓库的真实代码 `proxy.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { ProxyConfig } from "next/server";
import { get } from "@vercel/global-config";
export async function proxy(request: NextRequest) {
  // /welcome：返回 Vercel Global Config 中的 greeting
  if (request.nextUrl.pathname === "/welcome") {
    let greeting: unknown = null;
    try {
      greeting = await get("greeting");
    } catch {
      greeting = null;
    }
    return NextResponse.json(greeting ?? null);
  }
  // 此时会拦截项目中所有的请求，包括静态资源、API请求、页面请求等
  console.log(request.url, 'url');
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  })
  return response;
}
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
//配置匹配路径
export const config: ProxyConfig = {
  // matcher: '/api/:path*',
  matcher: ['/api/:path*', '/home/:path*', '/welcome'],
  //matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'], 同样支持正则表达式匹配
}
```

### 1.4 `matcher` 的三种写法

| 写法 | 示例 | 适用 |
|---|---|---|
| 单条字符串 | `'/api/:path*'` | 单个路径段 |
| 数组（本仓库用） | `['/api/:path*', '/home/:path*', '/welcome']` | 多个路径段 |
| 负向前瞻正则 | `'/((?!api\|_next/static\|.*\\.png$).*)'` | 排除静态/内部路径 |

**`matcher` 极其重要** —— 它决定了哪些请求会进入你的代理函数。
不写 `matcher` 的话，**所有**请求（包括静态资源、API、页面）都会进来，性能很差。

### 1.5 proxy 里能做什么

| 能力 | 例子 |
|---|---|
| 加响应头（CORS） | 本仓库的 `corsHeaders` |
| 重定向 | `NextResponse.redirect(new URL('/mylogin', request.url))` |
| 鉴权（读 Cookie / Header） | `request.cookies.get('token')` |
| 改写请求 | `NextResponse.rewrite(...)` |
| 直接返回数据 | `/welcome` 那段直接 `NextResponse.json()` |

### 1.6 ⚠️ 本仓库 proxy 里的两处「演示级」问题

1. **`Access-Control-Allow-Origin: '*'`** —— 需要带 Cookie 时不能这么写（浏览器会拦），
   而且这里和 `app/api/cors/route.ts` 的动态白名单逻辑重复了。
2. **`/welcome` 依赖 `@vercel/global-config`** —— 它读的是 **Vercel 项目级 Global Config**，
   不是常规环境变量。在 Vercel 控制台没配的话，`/welcome` 返回 `null`。

---

## 二、instrumentation.ts

### 2.1 真实代码 `app/instrumentation.ts`

```ts
import type { InstrumentationOnRequestError } from "next/dist/server/instrumentation/types";

/**
 * app/instrumentation.ts —— 约定文件，服务启动时执行一次。
 *
 * 两个导出：
 *  - register()            服务启动钩子（每个 runtime 各执行一次）
 *  - onRequestError(...)   服务端错误钩子（出错的请求都会走这里）
 *
 * 典型用途：APM 探针注册（OpenTelemetry / Sentry）、全局错误上报。
 *
 * 注意：register() 里要区分 runtime ——
 *   process.env.NEXT_RUNTIME === "nodejs"  → Node.js runtime
 *   process.env.NEXT_RUNTIME === "edge"    → Edge runtime
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("[instrumentation] 服务已启动 · Node.js runtime");
  } else if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[instrumentation] 服务已启动 · Edge runtime");
  }
}

/**
 * 服务端报错时统一上报。
 * 在这里打点，就能拿到「哪条路由、什么方法、什么错误」三元组。
 */
export const onRequestError: InstrumentationOnRequestError = (
  error,
  request,
  context,
) => {
  console.error(
    `[onRequestError] ${request.method} ${request.path} | ` +
      `routeType=${context.routeType} renderSource=${context.renderSource ?? "-"}`,
  );
  console.error(error);
};
```

### 2.2 两个导出的用途

| 导出 | 时机 | 用途 |
|---|---|---|
| `register()` | 服务启动时（每个 runtime 一次） | 注册 APM 探针、初始化 SDK |
| `onRequestError(error, request, context)` | 服务端出错时 | 统一错误上报 |

`onRequestError` 的 `context` 里能拿到：

```ts
type RequestErrorContext = {
  routerKind: 'Pages Router' | 'App Router';
  routePath: string;
  routeType: 'render' | 'route' | 'action' | 'proxy';
  renderSource?: 'react-server-components' | 'react-server-components-payload' | 'server-rendering';
  revalidateReason: 'on-demand' | 'stale' | undefined;
};
```

`routeType` 能区分错误发生在**页面渲染 / 路由处理 / Server Action / proxy** —— 排查问题非常有用。

---

## 三、动手实验

### 实验 1：看 proxy 的拦截范围

```bash
pnpm dev
```

依次访问 <http://localhost:3000/api/user>、<http://localhost:3000/about>、
<http://localhost:3000/welcome>，观察**服务端终端**的日志。

**预期**：

- `/api/user` → 有日志（匹配了 `matcher`）
- `/about` → **没有**日志（不在 `matcher` 里）
- `/welcome` → 直接返回 JSON `null`（本机没配 Vercel Global Config）

### 实验 2：亲手触发 middleware/proxy 冲突

新建 `middleware.ts`：

```ts
import { NextResponse } from "next/server";
export function middleware() {
  return NextResponse.next();
}
```

```bash
pnpm build
```

**预期**：构建失败，报错原文：

```text
Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected.
Please use "./proxy.ts" only. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

**删掉 `middleware.ts`** 恢复正常。

### 实验 3：看 instrumentation 的启动日志

```bash
pnpm build && pnpm start
```

**预期**：启动时终端打印 `[instrumentation] 服务已启动 · Node.js runtime`。

### 实验 4：触发 onRequestError

打开 `app/basic/a/page.tsx`，把 `// throw new Error("错误");` 的注释打开，
访问 <http://localhost:3000/basic/a>。

**预期**：终端打印：

```text
[onRequestError] GET /basic/a | routeType=render renderSource=react-server-components
```

**关掉 throw**。

---

## 四、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| `middleware.ts` 和 `proxy.ts` 同时存在 | 构建失败 | 只留 `proxy.ts` |
| 忘了写 `matcher` | 所有请求都进代理，性能差 | 一定要写 `matcher` |
| 在 proxy 里 `await` 慢操作 | 拖慢所有请求 | proxy 要快 |
| `Allow-Origin` 写 `*` 但要带 Cookie | 浏览器拦截 | 换具体源 |
| `register()` 里同步做重活 | 拖慢启动 | 用动态 import 按需加载 |

---

## 五、自检

1. Next 16 把 `middleware.ts` 改名成了什么？函数名和类型各变成什么？
2. 两个文件同时存在会怎样？
3. `matcher` 不写会怎样？支持哪三种写法？
4. `register()` 和 `onRequestError()` 分别在什么时机跑？

---

## 六、小结 & 下一步

- Next 16 用 `proxy.ts` 取代 `middleware.ts`，两者**不能共存**。
- `matcher` 决定拦截范围，务必写。
- `instrumentation.ts` = 服务启动钩子 + 服务端错误钩子。

**下一课** → [第 24 课 · 环境变量与样式体系](24_环境变量与样式体系.md)
