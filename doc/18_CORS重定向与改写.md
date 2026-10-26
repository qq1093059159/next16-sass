# 第 18 课 · CORS、重定向与内部改写

> **学习目标**：搞懂浏览器跨域预检的真实流程，以及 `redirect` 和 `rewrite` 的本质区别。
> **对应代码**：`app/api/cors/route.ts`、`app/api/redirect/route.ts`
> **预计耗时**：35 分钟
> **前置知识**：第 16 课

---

## 一、CORS 与预检请求

### 1.1 什么是预检

跨域请求分两类：

| 类型 | 判定 | 会不会先发 OPTIONS |
|---|---|---|
| **简单请求** | 方法是 GET/HEAD/POST，且 Content-Type 是 `text/plain`、`application/x-www-form-urlencoded`、`multipart/form-data` | ❌ 不会 |
| **非简单请求** | 其它一律算（带 `application/json` 的 POST、带自定义头、PUT/DELETE…） | ✅ **会** |

非简单请求时，浏览器先发一个 `OPTIONS` 预检，问服务器：「我能不能发这个请求？」
服务器同意后才发真正的请求。

### 1.2 ⚠️ Next 16 的真实行为

> **实测**：路由未导出 `OPTIONS` 时，Next 16 返回 **405 Method Not Allowed**
> （带 `Allow: GET, HEAD` 头），**并不是「自动补一个 204」**。
> 既不是预检该有的 2xx，也不带 CORS 头 —— 浏览器照样会拦。

---

## 二、真实代码

`app/api/cors/route.ts`：

```ts
import { NextRequest, NextResponse } from "next/server";

/**
 * CORS 与预检请求（OPTIONS）。
 *
 * 知识点：
 *  1. 跨域请求分「简单请求」和「预检请求」：
 *     带 Content-Type: application/json 的 POST 属于简单请求之外，
 *     浏览器会先发一个 OPTIONS 预检请求，问服务器「我能不能发这个请求」。
 *  2. 没有显式导出 OPTIONS 时，Next 16 实测返回 405 Method Not Allowed（带 Allow 头），
 *     既不是预检该有的 2xx，也不带 CORS 头，浏览器照样会拦截 —— 所以必须手写 OPTIONS。
 *  3. Access-Control-Allow-Origin 不能是 "*"（当需要 Cookie 时）。
 */

const allowedOrigins = ["https://example.com", "https://www.vercel.com"];

function buildCorsHeaders(origin: string | null) {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/** 预检请求 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request.headers.get("origin")),
  });
}

/** 实际请求 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "带 CORS 头的响应", origin: request.headers.get("origin") },
    { headers: buildCorsHeaders(request.headers.get("origin")) },
  );
}
```

三个关键响应头：

| 头 | 作用 |
|---|---|
| `Access-Control-Allow-Origin` | 允许哪个源。**需要带 Cookie 时不能写 `*`** |
| `Access-Control-Allow-Methods` | 允许哪些方法 |
| `Access-Control-Max-Age` | 预检结果缓存多久（秒），期内不用重复预检 |

---

## 三、redirect 与 rewrite

### 3.1 真实代码 `app/api/redirect/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Route Handler 里的重定向与内部改写。
 *
 *  - NextResponse.redirect(url)  → 302 跳转，浏览器地址栏会变
 *  - NextResponse.rewrite(url)   → 内部改写，浏览器地址栏【不变】，
 *                                   浏览器以为访问的是 /api/redirect，其实拿到的是 /api/user 的响应
 *
 * 用法：/api/redirect?to=/about            → 302 跳到 /about
 *       /api/redirect?mode=rewrite         → 内部改写到 /api/user
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("mode");

  if (mode === "rewrite") {
    // rewrite 的目标必须是绝对 URL
    return NextResponse.rewrite(new URL("/api/user", request.url));
  }

  const target = params.get("to") ?? "/";
  return NextResponse.redirect(new URL(target, request.url));
}
```

### 3.2 两者的本质区别

| | `redirect` | `rewrite` |
|---|---|---|
| HTTP 状态 | 307（`NextResponse.redirect` 默认 307） | 200 |
| 地址栏 | **会变** | **不变** |
| 浏览器视角 | 「服务端让我去另一个地址」 | 「我访问的就是这个地址」 |
| 典型用途 | 登录后跳首页、旧 URL 迁移 | 反向代理、灰度路由、路径改写 |

> ⚠️ `rewrite` 的目标必须是**绝对 URL**（`new URL(path, request.url)`），
> 直接给相对路径会报错。

---

## 四、动手实验

### 实验 1：对比 OPTIONS 的两种结果

```bash
# 没写 OPTIONS 的路由 → 405
curl -i -X OPTIONS http://127.0.0.1:3000/api/books | head -8

# 写了 OPTIONS 的路由 → 204 + CORS 头
curl -i -X OPTIONS http://127.0.0.1:3000/api/cors | head -8
```

**观察**：`405` 那条带 `Allow: GET` `Allow: HEAD`；`204` 那条带三个 `Access-Control-*` 头。

### 实验 2：看 Origin 白名单的效果

```bash
curl -i http://127.0.0.1:3000/api/cors -H "Origin: https://example.com" | grep -i access-control
curl -i http://127.0.0.1:3000/api/cors -H "Origin: https://evil.com" | grep -i access-control
```

**预期**：第一个返回 `https://example.com`，第二个回落到白名单第一个
（`https://example.com`），而不是 `*`。

### 实验 3：对比 redirect 和 rewrite

```bash
# redirect → 307，地址栏会变
curl -i "http://127.0.0.1:3000/api/redirect?to=/about" | head -6

# rewrite → 200，内容其实是 /api/user 的
curl -i "http://127.0.0.1:3000/api/redirect?mode=rewrite" | head -10
```

**预期**：

- redirect：`HTTP/1.1 307 Temporary Redirect` + `location: /about`
- rewrite：`HTTP/1.1 200 OK`，body 是 `{"message":"Get request successful"}`（来自 `/api/user`）

**rewrite 的妙用**：浏览器地址栏始终是 `/api/redirect`，但拿到的是 `/api/user` 的响应。
这在「统一入口 + 内部转发」的场景很有用。

### 实验 4：浏览器里观察预检

打开 DevTools → Network，勾选 Preserve log，
在控制台执行：

```js
fetch("http://127.0.0.1:3000/api/cors", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ a: 1 }),
});
```

**观察**：Network 面板里出现**两条**请求 —— 先 `OPTIONS`（预检），后 `POST`（实际）。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 以为 Next 自动补 OPTIONS | 预检拿到 405，浏览器拦截 | 手写 OPTIONS |
| `Allow-Origin` 写 `*` 但要带 Cookie | 浏览器拒绝 | 换成具体源 + `credentials` |
| `rewrite` 用相对路径 | 报错 | 必须绝对 URL |
| 忘了 `Access-Control-Max-Age` | 每次请求都预检 | 加上可减少往返 |
| 把 CORS 当安全机制 | ❌ | CORS 只管浏览器，接口仍要自己鉴权 |

---

## 六、自检

1. 什么情况下浏览器会先发 OPTIONS？
2. 不写 `OPTIONS` 时 Next 16 返回什么状态码？
3. `redirect` 和 `rewrite` 的三个区别？
4. 为什么 `Access-Control-Allow-Origin` 不能写 `*`？

---

## 七、小结 & 下一步

- 非简单请求 → 浏览器先发 OPTIONS 预检。
- **不写 OPTIONS → 405，不是自动 204**。
- `redirect` 改地址栏，`rewrite` 内部改写不改地址栏。

**下一课** → [第 19 课 · 流式响应 SSE](19_流式响应SSE.md)
