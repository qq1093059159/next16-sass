# 第 17 课 · Cookie 读写与会话

> **学习目标**：掌握两种 Cookie 写法，以及 httpOnly / secure / sameSite 三个安全选项的意义。
> **对应代码**：`app/api/login/route.ts`、`app/api/cookies/route.ts`
> **预计耗时**：30 分钟

---

## 一、核心概念

Next.js 里写 Cookie 有两种方式：

| 写法 | 用在哪 | 特点 |
|---|---|---|
| `cookies()` | Server Action / Server Component / Route Handler | 写的是**出站响应**的响应头 |
| `response.cookies.set()` | Route Handler | 直接操作 `NextResponse` 对象，更直观 |

---

## 二、真实代码

### 2.1 `app/api/login/route.ts`

```ts
import { cookies } from "next/headers"; //引入cookies
import { NextRequest, NextResponse } from "next/server"; //引入NextRequest, NextResponse
//模拟登录成功后设置cookie
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.username === 'admin' && body.password === '123456') {
    const cookieStore = await cookies(); //获取cookie
    cookieStore.set('token', '123456', {
      httpOnly: true, //只允许在服务器端访问
      maxAge: 60 * 60 * 24 * 30, //30天
    });
    return NextResponse.json({ code: 1 }, { status: 200 });
  } else {
    return NextResponse.json({ code: 0 }, { status: 401 });
  }
}
//检查登录状态
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (token && token.value === '123456') {
    return NextResponse.json({ code: 1 }, { status: 200 });
  } else {
    return NextResponse.json({ code: 0 }, { status: 401 });
  }
}
```

> ⚠️ 这只是**演示级**实现：token 硬编码成 `'123456'`，且密码明文比较。
> 生产环境必须换成真正的会话方案（Clerk / Auth.js / 自签 JWT + 数据库会话）。

### 2.2 `app/api/cookies/route.ts`

```ts
import { NextResponse } from "next/server";

/**
 * Route Handler 级别的 Cookie 写入。
 *
 * 两种写法：
 *  - cookies()  → 写 Cookie 到【出站响应】的响应头（Server Action / Server Component 用）
 *  - response.cookies.set() → 直接在 NextResponse 上操作
 *
 * 安全选项：
 *  - httpOnly  禁止 JS 读取（防 XSS 窃取）
 *  - secure    仅 HTTPS 传输
 *  - sameSite  防 CSRF（lax / strict / none）
 *  - maxAge    过期秒数
 */

/** 允许这个接口最多跑 30 秒（Serverless 平台默认更短，超时会被杀掉） */
export const maxDuration = 30;

export async function GET() {
  const response = NextResponse.json({ message: "Cookie 已写入" });

  response.cookies.set("demo_token", "abc123", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  // 删除旧 Cookie
  response.cookies.delete("demo_old");

  return response;
}
```

---

## 三、三个安全选项

| 选项 | 作用 | 不设会怎样 |
|---|---|---|
| `httpOnly: true` | 浏览器 JS 读不到这个 Cookie | XSS 偷不走（但能被服务端读到） |
| `secure: true` | 只在 HTTPS 下传输 | 明文 HTTP 里裸奔 |
| `sameSite` | 跨站请求时**不带**这个 Cookie | 默认 `lax` 已能挡大部分 CSRF |

`sameSite` 的三个取值：

| 值 | 行为 |
|---|---|
| `lax` | 同站请求带、跨站**顶级导航**带、跨站子资源不带（**默认**） |
| `strict` | 只在同站请求带 |
| `none` | 全部都带（**必须同时开 `secure`**） |

### ⚠️ `secure: true` 的本地影响

`/api/cookies` 设了 `secure: true`。用 `curl`（HTTP）访问时，
Cookie 会被带上，但浏览器在 `http://localhost` 下**可能拒绝存储** secure Cookie
（Chrome 对 localhost 有豁免，其他 http 域名没有）。

**实验时用 DevTools → Application → Cookies 观察实际结果**。

---

## 四、动手实验

### 实验 1：登录并观察 Cookie

```bash
curl -i -X POST http://127.0.0.1:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' | grep -i set-cookie
```

**预期**：`set-cookie: token=123456; Path=/; Expires=...; HttpOnly; Max-Age=2592000`

### 实验 2：用 Cookie 访问受保护接口

```bash
# 不带 cookie → 401
curl -i http://127.0.0.1:3000/api/login | head -1

# 带 cookie → 200
curl -i http://127.0.0.1:3000/api/login -H "Cookie: token=123456" | head -1
```

**预期**：`401 Unauthorized` → `200 OK`

### 实验 3：密码错误

```bash
curl -i -X POST http://127.0.0.1:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}' | head -1
```

**预期**：`401 Unauthorized`，且**没有** `Set-Cookie` 头。

### 实验 4：验证 httpOnly 的效果

浏览器登录后，打开 DevTools → Console，粘贴：

```js
document.cookie
```

**预期**：**看不到** `token` —— 因为它是 httpOnly，JS 读不到。
但 DevTools → Application → Cookies 里能看到。

### 实验 5：观察 `response.cookies.delete`

```bash
curl -i http://127.0.0.1:3000/api/cookies | grep -i set-cookie
```

**预期**：两条 `Set-Cookie` —— 一条设置 `demo_token`，一条删除 `demo_old`。

---

## 五、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 不设 `httpOnly` | XSS 可窃取 token | 除非真需要 JS 读，否则都设上 |
| Cookie 里存敏感明文 | 数据库泄露即全部沦陷 | 存签名后的会话 id |
| 前端 `fetch` 不带 `credentials` | 跨域时 Cookie 不带 | `credentials: "include"` + 服务端 CORS |
| 用 `cookies()` 在 Server Component 里删 Cookie | 不生效 | 删除要用 `cookies().delete()` 且在 Server Action / Route Handler 里 |
| 生产用 `secure: false` | 明文传输 | 生产必须 `secure: true` |

---

## 六、自检

1. `cookies()` 和 `response.cookies.set()` 各自用在哪？
2. `httpOnly: true` 防的是哪种攻击？
3. `sameSite` 的默认值是什么？`none` 需要配合什么？
4. 为什么不建议把用户信息直接放进 Cookie？

---

## 七、小结 & 下一步

- 两种 Cookie 写法：`cookies()` 与 `response.cookies.set()`。
- 三个安全选项：`httpOnly` / `secure` / `sameSite`。
- 本仓库的鉴权是**演示级**，生产必须换成熟方案。

**下一课** → [第 18 课 · CORS、重定向与内部改写](18_CORS重定向与改写.md)
