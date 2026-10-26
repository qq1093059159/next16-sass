import React from "react";

/**
 * 拦截路由（Intercepting Routes）需要搭配一个平行路由 slot。
 *
 * 这个 layout 同时接收 children 与 modal 两个 prop：
 *  - children  → 正常渲染的子路由
 *  - modal     → @modal 这个 slot 的内容（可能是拦截页，也可能是 default 兜底）
 *
 * 约定：
 *  - @modal 是「平行路由 slot」
 *  - @modal/(.)photo/[id] 是「拦截路由」
 *  - @modal/default.tsx 是 slot 的兜底
 */
export default function InterceptingLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {modal}
    </div>
  );
}
