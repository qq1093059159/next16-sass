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
