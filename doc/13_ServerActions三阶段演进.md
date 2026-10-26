# 第 13 课 · Server Actions 三阶段演进

> **学习目标**：看懂「传统 fetch → Server Action → useActionState + Zod」这条演进链，理解每一步省掉了什么。
> **对应代码**：`app/(auth)/mylogin/`、`app/(auth)/serverlogin/`、`app/(auth)/serverzodlogin/`、`lib/actions.ts`
> **预计耗时**：50 分钟

---

## 一、演进链总览

`app/(auth)/` 目录下的 3 个登录页构成了一条**从传统到现代**的路线：

```text
演进链（越往下越现代）
│
├─ mylogin        传统派：useState + fetch('/api/login') + router.push
│                 └─ 样板最多，要手写 loading、手写 API 路由、手写跳转
│
├─ serverlogin    FormData 派：Server Action 接收 FormData + .bind() 传参
│                 └─ 原生表单语义，JS 禁用也能提交（渐进增强）
│
└─ serverzodlogin 现代派：useActionState + Zod 服务端校验  ★最推荐
                  └─ isPending 白送、错误信息服务端返回、类型安全
```

---

## 二、阶段一：传统 fetch

`app/(auth)/mylogin/page.tsx`：

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.code === 1) {
          router.push("/home");
        }
      });
  };
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4">
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-62.5"
        placeholder="请输入用户名"
      />
      <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-62.5"
        placeholder="请输入密码"
      />
      <Button onClick={handleLogin}>登录</Button>
    </div>
  );
}
```

**它需要这些东西**：

| 需要做的 | 代码里的体现 |
|---|---|
| 管理两个输入框的值 | 2 个 `useState` + 2 个 `onChange` |
| 手写 API 路由 | `app/api/login/route.ts` 整个文件 |
| 自己判断成功失败 | `.then(data => { if (data.code === 1) ... })` |
| 自己管 loading | 还得再加一个 `useState` |
| 自己跳转 | `router.push("/home")` |

---

## 三、阶段二：Server Action + FormData

`app/(auth)/serverlogin/page.tsx`：

```tsx
export default function Login() {
  //接受id参数
  async function handleLogin(id: number, formData: FormData) {
    "use server";
    const username = formData.get("username");
    const password = formData.get("password");
    const form = Object.fromEntries(formData);
    console.log(username, password, form, id);
  }
  const userFunction = handleLogin.bind(null, 1); //绑定id参数
  return (
    <div>
      <h1>登录页面</h1>
      <div className="flex flex-col gap-2 w-75 mx-auto mt-30">
        <form action={userFunction} className="flex flex-col gap-2">
          <input
            className="border border-gray-300 rounded-md p-2"
            type="text"
            name="username"
            placeholder="用户名"
          />
          <input
            className="border border-gray-300 rounded-md p-2"
            type="password"
            name="password"
            placeholder="密码"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 3.1 `"use server"` 的三种写法

| 写法 | 位置 | 效果 |
|---|---|---|
| 文件首行 | `lib/actions.ts` | 整个文件的导出都变成 Server Action |
| 函数体第一行 | 上面这个例子 | 只有这个函数是 Server Action |
| 内联在 Server Component 里 | 同上 | 同上 |

### 3.2 `.bind()` 预置额外参数

Server Action 的第一个参数是 `FormData`，但有时你需要额外传值（比如「这是哪个表单」）：

```tsx
const userFunction = handleLogin.bind(null, 1);
```

> ⚠️ **注意 bind 后的参数顺序**：`bind(null, 1)` 把 `id` 变成**第一个**参数，
> `FormData` 自动排到最后。所以函数签名是 `(id: number, formData: FormData)`。

### 3.3 渐进增强（Progressive Enhancement）

`<form action={serverAction}>` 是**原生表单语义**。浏览器发一个真实的 POST 请求，
Next 在服务端拦截并执行 action。

**这意味着：即使 JS 没加载、表单也能提交。** 这是 Server Action 相比 fetch 的本质优势。

---

## 四、阶段三：useActionState + Zod（★推荐）

### 4.1 服务端 action：`lib/actions.ts`

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import { z } from "zod"
const loginSchema = z.object({
  username: z.string().min(6, '用户名不能少于6位'), //zod基本用法表示这是一个字符串，并且不能少于6位
  password: z.string().min(6, '密码不能少于6位') //zod基本用法表示这是一个字符串，并且不能少于6位
})

export async function handleLogin(_prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData)) //调用zod的safeParse方法进行校验

  if (!result.success) {
    const errorMessage = z.treeifyError(result.error).properties; //调用zod的treeifyError方法将错误信息转换为对象
    let str = ''
    Object.entries(errorMessage!).forEach(([, value]) => {
      value.errors.forEach((error: any) => {
        str += error + '\n' //将错误信息拼接成字符串
      })
    })
    return { message: str } //返回错误信息
  }
  //校验成功，进行数据库操作逻辑
  return { message: '登录成功' } //返回成功信息
}
```

### 4.2 客户端消费：`app/(auth)/serverzodlogin/page.tsx`

```tsx
"use client";
import { useActionState } from "react";
import { handleLogin } from "@/lib/actions";
const initialState = { message: "" };
export default function Login() {
  const [state, formAction, isPending] = useActionState(
    handleLogin,
    initialState
  );

  return (
    <div>
      <h1>登录页面</h1>
      {isPending && <div>Loading...</div>}
      {state.message}
      <div className="flex flex-col gap-2 w-75 mx-auto mt-30">
        <form action={formAction} className="flex flex-col gap-2">
          <input
            className="border border-gray-300 rounded-md p-2"
            type="text"
            name="username"
            placeholder="用户名"
          />
          <input
            className="border border-gray-300 rounded-md p-2"
            type="password"
            name="password"
            placeholder="密码"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 4.3 `useActionState` 的三件套

```tsx
const [state, formAction, isPending] = useActionState(handleLogin, initialState);
```

| 返回值 | 是什么 |
|---|---|
| `state` | 上一次 action 的返回值（这里是 `{ message: string }`） |
| `formAction` | 传给 `<form action={...}>` 的函数 |
| `isPending` | action 执行中（**白送**，不用自己管） |

配合 `initialState`，`state` 的类型 = action 的返回类型 —— **类型契约清晰**。

### 4.4 Zod 4 的新 API

```ts
z.treeifyError(result.error).properties
```

> ⚠️ **Zod 4 关键变更**：这是 **Zod 4 的新 API**。Zod 3 时代是
> `result.error.flatten().fieldErrors`，升级时编译会报错。

`safeParse` 不抛异常 —— 校验失败时返回 `{ success: false, error }`，
这让「校验失败」变成一个普通的分支，而不是异常。

---

## 五、为什么这是最佳形态

| 收益 | 说明 |
|---|---|
| `isPending` 免费 | 不用自己 `useState` 管 loading |
| 零 API 路由 | 浏览器直接调用服务端函数，Next 自动生成 RPC 端点 |
| 渐进增强 | `<form action={...}>` 原生语义，无 JS 也能工作 |
| 校验在服务端 | `safeParse` 不抛异常；客户端永远绕不过（安全） |
| 类型契约清晰 | `useActionState` 的 state 类型 = action 返回值类型 |

---

## 六、动手实验

### 实验 1：跑通三个版本

依次访问 <http://localhost:3000/mylogin>、<http://localhost:3000/serverlogin>、
<http://localhost:3000/serverzodlogin>，都提交一次表单。

**观察**：

- `mylogin`：密码错误时**没有任何提示**（`.then` 里只有成功分支）
- `serverlogin`：服务端终端能看到 `console.log` 打印的表单数据
- `serverzodlogin`：错误信息直接显示在页面上

### 实验 2：触发 Zod 校验失败

在 `serverzodlogin` 页面输入 `abc` / `abc` 并提交。

**预期**：页面显示：

```text
用户名不能少于6位
密码不能少于6位
```

**关键**：这个校验发生在**服务端**。你在浏览器 devtools 里改成 `abcde` 也没用 ——
请求发给服务端后照样被拒。

### 实验 3：验证 `.bind()` 的参数顺序

改 `app/(auth)/serverlogin/page.tsx` 的 action 签名：

```tsx
async function handleLogin(formData: FormData, id: number) {
```

**预期**：`formData.get("username")` 返回 `null`（因为第一个参数已经是 id 了），
`id` 拿到的是 FormData 对象。

**改回来**。

### 实验 4：确认 useActionState 的类型契约

把 `lib/actions.ts` 里成功时的返回值改成 `{ message: '登录成功', ok: true }`，
然后在 `serverzodlogin/page.tsx` 里访问 `state.ok`。

**预期**：TS 提示 `state` 上没有 `ok` 属性 —— 因为 `initialState` 是 `{ message: "" }`，
类型是联合推断的。

---

## 七、常见错误

| 错误 | 后果 | 正确做法 |
|---|---|---|
| 在客户端做校验 | 用户可绕过 | 校验放 Server Action 里 |
| `.bind()` 后参数顺序搞反 | 拿到 undefined | bind 的参数排在 FormData **之前** |
| 忘了 `"use server"` | 函数当普通函数跑 | 文件首行或函数体第一行 |
| 用 Zod 3 的 `flatten()` | 编译报错 | Zod 4 用 `z.treeifyError()` |
| action 里 `throw` 未处理 | 500 | 用 `safeParse` 之类的非抛异常校验 |

---

## 八、自检

1. 三个登录页各需要多少额外样板代码？
2. `.bind(null, 1)` 之后，`handleLogin` 的第一个参数是什么？
3. 为什么校验必须放在 Server Action 里而不是客户端？
4. `useActionState` 返回的三个值分别是什么？

---

## 九、小结 & 下一步

- Server Action = 「在服务端跑的函数，浏览器直接调」。
- `<form action={...}>` 有原生表单语义，JS 挂了也能提交。
- `useActionState` + Zod 是当前最佳形态。

**下一课** → [第 14 课 · 乐观更新与表单状态](14_乐观更新与表单状态.md)
