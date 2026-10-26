# 第 16 课 · Route Handlers 基础

> **学习目标**：掌握 `app/api/**/route.ts` 这套与页面平行的 API 入口。
> **对应代码**：`app/api/user/route.ts`、`app/api/books/route.ts`、`app/api/books/[id]/route.ts`
> **预计耗时**：35 分钟
> **前置知识**：第 02 课

---

## 一、核心概念

Route Handler 是 App Router 里的 **API 路由**。它和页面路由平行存在：

```text
app/(root)/about/page.tsx   →  页面路由，URL = /about
app/api/user/route.ts       →  API 路由，URL = /api/user
```

一个 `route.ts` 可以导出多个 HTTP 方法：

```ts
// export async function GET(request: Request) { }

// export async function HEAD(request: Request) { }

// export async function POST(request: Request) { }

// export async function PUT(request: Request) { }

// export async function DELETE(request: Request) { }

// export async function PATCH(request: Request) { }

// //实测：未定义 OPTIONS 时，Next 16 返回 405 Method Not Allowed（带 Allow 头），
// //      并不会自动补一个 204 —— 需要处理预检就自己手写 OPTIONS
// export async function OPTIONS(request: Request) { }
```

> 这是 `app/api/login/route.ts` 开头的**注释备忘**（该文件只实现了 POST 与 GET）。
> 真正要导出哪个方法，就把对应那行的 `//` 去掉。

> ⚠️ **实测结论**：**不定义 `OPTIONS` 时，Next 16 返回 `405 Method Not Allowed`**
> （带 `Allow: GET, HEAD` 头），**并不会自动补一个 204**。
> 需要处理浏览器预检就必须自己手写 `OPTIONS`。

---

## 二、真实代码

### 2.1 `app/api/user/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams; //接受url中的参数
  console.log(query.get('id'));
  return NextResponse.json({ message: 'Get request successful' }); //返回json数据
}
export async function POST(request: NextRequest) {
  //const body = await request.formData(); //接受formData数据
  //const body = await request.text(); //接受text数据
  //const body = await request.arrayBuffer(); //接受arrayBuffer数据
  //const body = await request.blob(); //接受blob数据
  const body = await request.json(); //接受json数据
  console.log(body); //打印请求体中的数据
  return NextResponse.json({ message: 'Post request successful', body }, { status: 201 });
  //返回json数据
}
```

**请求体的五种解析姿势**：

| 方法 | 得到什么 |
|---|---|
| `await request.json()` | JSON 对象 |
| `await request.formData()` | FormData（文件上传用这个） |
| `await request.text()` | 纯文本 |
| `await request.arrayBuffer()` | 二进制 buffer |
| `await request.blob()` | Blob 对象 |

### 2.2 `app/api/books/route.ts`

```ts
import books from "@/app/api/db"
export async function GET() {
  return Response.json(books)
}
```

注意这里用的是**原生 `Response`** 而不是 `NextResponse` —— 两者都可用，
`Response` 更标准，`NextResponse` 多了 Cookie 等便利方法。

### 2.3 动态路由 `app/api/books/[id]/route.ts`

```ts
import books from "@/app/api/db"
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = +(await context.params).id
  const book = await request.json()
  const index = books.findIndex((b) => b.id === id)
  books[index] = book
  return Response.json(books)
}
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const id = +(await context.params).id
  const index = books.findIndex((b) => b.id === id)
  books.splice(index, 1)
  return Response.json(books)
}
```

> ⚠️ **注意 `params` 是 Promise，必须 await**（第 04 课详述）。
> 本仓库所有动态段都已迁移到新写法。

### 2.4 「假数据库」`app/api/db.ts`

```ts
const books = [
  { id: 1, name: 'atomic' },
  { id: 2, name: 'deep work' },
  { id: 3, name: 'highly effective' }
]
export default books
```

> ⚠️ **这是本仓库已知的缺陷 #15**：用模块级数组冒充数据库。
> 进程重启即丢、多实例不共享；而且 `PUT` 里 `books[index] = book`
> **没防 `index === -1`**（找不到 id 时会写进数组的 `-1` 位置，即最后一个元素）。

---

## 三、动手实验

### 实验 1：四种请求体解析

```bash
# GET 带 query
curl "http://127.0.0.1:3000/api/user?id=123"

# POST JSON
curl -X POST http://127.0.0.1:3000/api/user \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","age":18}'
```

**预期**：POST 返回 `status: 201`，body 里带上了你传的 JSON。

### 实验 2：验证状态码可以自定义

`NextResponse.json(data, { status: 201 })` 里的 `201` 会体现在响应头。

```bash
curl -i -X POST http://127.0.0.1:3000/api/user \
  -H "Content-Type: application/json" -d '{}' | head -1
```

**预期**：`HTTP/1.1 201 Created`

### 实验 3：验证 OPTIONS 的 405

```bash
curl -i -X OPTIONS http://127.0.0.1:3000/api/books | head -6
```

**预期**：`HTTP/1.1 405 Method Not Allowed` + `Allow: GET` `Allow: HEAD`

对比手写了 OPTIONS 的 `/api/cors`：

```bash
curl -i -X OPTIONS http://127.0.0.1:3000/api/cors | head -3
```

**预期**：`HTTP/1.1 204 No Content`（第 18 课细讲）

### 实验 4：亲手触发 `index === -1` 的 bug

```bash
curl -X PUT http://127.0.0.1:3000/api/books/999 \
  -H "Content-Type: application/json" -d '{"id":999,"name":"hack"}'
```

**预期**：返回的数组里，原本 `id: 3` 的那项被改成了 `{"id":999,"name":"hack"}`
—— 因为 `findIndex` 返回 `-1`，`books[-1] = book` 写到了数组最后一项。

**这是真实缺陷**，正确写法应该先判断 `index === -1` 返回 404。

---

## 四、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 忘了 `await context.params` | 静默 NaN | params 是 Promise |
| 以为 Next 会自动补 OPTIONS | 预检失败（405） | 手写 OPTIONS |
| 在 `route.ts` 里用 `useState` | 编译报错 | Route Handler 不是组件 |
| 返回值写成 `Response.json()` 而漏 `return` | 返回 undefined | 记得 return |
| 依赖模块级数组当数据库 | 数据丢失 / 越界 | 换真实数据库 |

---

## 五、自检

1. Route Handler 和页面路由在什么位置、什么命名规则上不同？
2. 请求体有哪五种解析方式？各适合什么场景？
3. `params` 为什么必须 `await`？
4. 不写 `OPTIONS` 时 Next 返回什么？

---

## 六、小结 & 下一步

- `app/api/**/route.ts` 按方法导出函数，一个文件可导出多个方法。
- 请求体五种解析方式；`params` 是 Promise。
- **不写 OPTIONS → 405，不是自动 204**。

**下一课** → [第 17 课 · Cookie 读写与会话](17_Cookie读写与会话.md)
