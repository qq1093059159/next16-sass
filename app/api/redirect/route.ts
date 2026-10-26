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
