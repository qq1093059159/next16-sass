---
title: "GFM 与 frontmatter 测试"
date: "2026-10-30"
excerpt: "验证 remark-gfm / frontmatter / rehype-slug / rehype-pretty-code"
---

# GFM 与 frontmatter 测试

## 表格（remark-gfm）

| 特性 | 库 | 状态 |
|---|---|---|
| 表格 | remark-gfm | ✅ |
| 删除线 | remark-gfm | ✅ |
| 任务列表 | remark-gfm | ✅ |

## 删除线与任务列表

~~这是删除线~~

- [x] 已完成
- [ ] 未完成

## 自动链接

<https://nextjs.org>

## 代码高亮（rehype-pretty-code）

```ts
export function hello(name: string) {
  return `Hello, ${name}!`;
}
```

## 标题锚点（rehype-slug）

### 这个三级标题应该有 id
