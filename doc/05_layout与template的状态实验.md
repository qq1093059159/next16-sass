# 第 05 课 · layout 与 template 的状态实验

> **学习目标**：亲眼看清 `layout` 与 `template` 在**重挂载时机**上的唯一区别，并用这个区别指导实际选型。
> **对应代码**：`app/basic/layout.tsx`、`app/basic/template.tsx`、`app/basic/a/page.tsx`、`app/basic/b/page.tsx`
> **预计耗时**：30 分钟

---

## 一、核心概念

这是全仓库**最巧妙**的教学设计 —— `basic/layout.tsx` 和 `basic/template.tsx`
的代码几乎逐字相同，唯一的区别就是**重挂载时机**。

| | 导航时会不会重新挂载 | 组件状态 |
|---|---|---|
| `layout.tsx` | ❌ **不会** | 保留 |
| `template.tsx` | ✅ **会** | 归零 |

---

## 二、真实代码

### 2.1 `app/basic/layout.tsx`

```tsx
"use client"; //需要交互的地方要改为客户端组件 默认是服务端组件
import { useState } from "react";
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Blog 布局组件</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <h1>数量： {count}</h1>
      <hr />
      {children}
    </div>
  );
}
```

### 2.2 `app/basic/template.tsx`

```tsx
"use client"; //需要交互的地方要改为客户端组件 默认是服务端组件
import { useState } from "react";
export default function BlogTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Blog Template</h1>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <h1>数量： {count}</h1>
      <hr />
      {children}
    </div>
  );
}
```

> 除了 `h1` 文案和函数名，**上述代码原样复制**。

### 2.3 页面

`app/basic/a/page.tsx`：

```tsx
import Link from "next/link";
const getData = async () => {
  //触发异步会自动跳转到loading组件 异步结束正常返回页面
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("数据");
    }, 5000);
  });
};
export default async function APage() {
  const data = await getData();
  console.log(data);
  //遇到异常会自动跳转到error组件
  // throw new Error("错误");
  return (
    <div>
      <h1>A Page</h1>
      <Link href="/basic/b">跳转B</Link>
    </div>
  );
}
```

`app/basic/b/page.tsx`：

```tsx
import Link from "next/link";
export default function BPage() {
  return (
    <div>
      <h1>B Page</h1>
      <Link href="/basic/a">跳转A</Link>
    </div>
  );
}
```

---

## 三、亲手验证（核心实验）

1. 访问 <http://localhost:3000/basic/a>，等 5 秒（会先看到 loading）
2. 页面上有**两个** `+1` 按钮和**两个**计数器：
   - 上面的「Blog 布局组件」计数器 —— 属于 `layout.tsx`
   - 下面的「Blog Template」计数器 —— 属于 `template.tsx`
3. 把**两个**计数器都点到 3
4. 点「跳转B」→ 观察：

```text
Blog 布局组件   数量：3     ← layout 保留了状态 ✅
Blog Template  数量：0     ← template 重新挂载，状态归零 ✅
```

5. 点「跳转A」回到 A 页 —— 因为 A 页要等 5 秒，`template` 又被重新挂载了一次
6. 刷新整个浏览器（硬刷新）—— 两个计数器都归零（整棵树重建）

> **这就是 layout 和 template 的全部区别。**

---

## 四、为什么会这样

Next.js 的渲染模型决定了这件事：

```text
软导航（<Link>）时，Next 只重新渲染「需要变化的那部分」。
  - layout 的 props（children）变了，但 layout 组件本身不卸载 → state 保留
  - template 每次导航都是全新的实例 → state 归零
```

从 React 的角度看更直白：

- `layout` 是**同一个组件实例**被复用了，只是它的 `children` prop 换了
- `template` 是**每次都 new 一个新实例**

---

## 五、工程意义：怎么选

| 场景 | 用哪个 | 理由 |
|---|---|---|
| 侧边栏、顶部导航 | `layout` | 切页面时不该闪、不该重建 |
| 播放器、WebSocket 连接、滚动容器 | `layout` | 重建连接代价太大 |
| 需要每次进页面重置的表单 | `template` | 天然归零，不用手写 `useEffect` 清空 |
| 需要每次进页面重跑的入场动画 | `template` | 组件重新挂载 → 动画重放 |
| 全局 Provider（主题、i18n） | `layout` | 状态要跨路由保持 |

**判断口诀**：

> 「这个状态该不该跨页面保留？」—— 该保留用 `layout`，不该保留用 `template`。

---

## 六、动手实验 2：自己加一个 template 对照

1. 在 `app/basic/` 下新建 `template2.tsx`，内容抄 `template.tsx`，把 h1 改成 `Blog Template 2`
2. **注意**：一个目录只能有一个 `template.tsx`，所以 `template2.tsx` 不会被识别
3. 把 `template.tsx` 重命名为 `template2.tsx`，再把原 `template.tsx` 内容改成
   `<h1>Blog Template (改名后)</h1>` 看看效果

**观察**：Next 只认 `template.tsx` 这个文件名，改名等于删除。

---

## 七、常见错误

| 错误 | 后果 | 正确写法 |
|---|---|---|
| 期望切页面时表单自动清空 | 值还在 | 需要清空就用 `template` 或自己加 key |
| 在 layout 里放会变的表单状态 | 跨页面串味 | 放 `template` 或页面里 |
| 一个目录放两个 `template.tsx` | 构建报错 | 一个目录只能有一个 |
| 以为 template 能替代 layout | 层级结构错了 | template 必须在 layout **里面** |

---

## 八、自检

1. `layout` 和 `template` 在代码上可以完全一样，那 Next 怎么知道要区别对待？
2. 为什么 `<Link>` 软导航时 layout 的 `useState` 保留，而硬刷新会归零？
3. 一个「需要每次进页面都重置的搜索框」应该放在 layout 还是 template？
4. `template.tsx` 能不能和 `layout.tsx` 放在同一个目录？

---

## 九、小结 & 下一步

- 唯一区别：**重挂载时机**。layout 保留状态，template 归零。
- 选型口诀：状态该跨页面保留 → layout；不该 → template。
- 两者都在 `layout` 内部的层级里：`layout > template > page`。

**下一课** → [第 06 课 · 错误边界与 404 状态码](06_错误边界与404状态码.md)
