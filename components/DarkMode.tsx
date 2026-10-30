"use client";

import * as React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { setTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 三态主题菜单（浅色 / 深色 / 跟随系统）—— 零依赖实现，不依赖 next-themes。
 *
 * ── 为什么不用 DropdownMenuRadioGroup ───────────────────────────
 * radio 需要知道「当前选中哪一项」→ 必须用 React state 持有。
 * 而服务端渲染时读不到 localStorage，首帧必然与客户端不一致 → hydration mismatch。
 *
 * 本组件的做法：**当前项的标记交给 CSS**。
 * `applyTheme()` 会把解析后的主题写到 <html> 的 data-theme 属性、
 * 把用户原始偏好写到 data-theme-pref，CSS 再据此显示 ✓ 标记。
 * 于是 React 完全不持有主题状态 → 零 hydration 风险。
 *
 * 对应 CSS 见 app/globals.css 的「主题菜单当前项标记」一节。
 */
export function ModeToggle() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* 注意 relative：shadcn 的 Button 没有定位上下文，
            绝对定位的月亮图标会跑到最近的定位祖先（可能是 body）去 */}
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")} data-theme-value="light">
          <Check className="theme-current-mark mr-2 h-4 w-4" />
          浅色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} data-theme-value="dark">
          <Check className="theme-current-mark mr-2 h-4 w-4" />
          深色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} data-theme-value="system">
          <Check className="theme-current-mark mr-2 h-4 w-4" />
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
