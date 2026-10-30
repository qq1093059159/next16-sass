"use client";

import { Moon, Sun } from "lucide-react";
import { toggleTheme } from "@/lib/theme";

/**
 * 亮/暗模式切换按钮（零依赖实现，不依赖 next-themes）。
 *
 * ── 为什么图标不用 React state 控制 ─────────────────────────────
 * 服务端渲染时不知道用户偏好（localStorage 只能在浏览器读）。
 * 如果用 `useState` / `useSyncExternalStore` 控制图标显示，
 * 客户端首帧就会和服务端 HTML 不一致 → hydration mismatch。
 *
 * 本组件的做法（shadcn/ui 官方 v4 模板同款）：
 * **两个图标都在 DOM 里，靠 CSS 的 scale/rotate 切换显隐** ——
 * 服务端和客户端渲染出的 HTML 完全一致 → 天然零 hydration 风险。
 *
 * 而「当前是不是暗色」这个状态，只存在于 <html> 的 class 上，
 * 由 CSS 决定谁可见 —— JS 完全不参与渲染判断。
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      title="切换亮色 / 暗色模式"
      className={
        "relative inline-flex h-8 w-8 items-center justify-center rounded-md border " +
        "border-gray-300 transition hover:bg-gray-100 " +
        "dark:border-gray-700 dark:hover:bg-gray-800 " +
        className
      }
    >
      {/*
        亮色时显示月亮（点击切到暗色）；暗色时显示太阳（点击切回亮色）。
        两个图标始终存在于 DOM，靠 scale/rotate 切换 —— 这样 HTML 服务端与客户端一致。
      */}
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换亮色 / 暗色模式</span>
    </button>
  );
}
