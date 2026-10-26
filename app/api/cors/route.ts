import { NextRequest, NextResponse } from "next/server";

/**
 * CORS 与预检请求（OPTIONS）。
 *
 * 知识点：
 *  1. 跨域请求分「简单请求」和「预检请求」：
 *     带 Content-Type: application/json 的 POST 属于简单请求之外，
 *     浏览器会先发一个 OPTIONS 预检请求，问服务器「我能不能发这个请求」。
 *  2. 没有显式导出 OPTIONS 时，Next 16 实测返回 405 Method Not Allowed（带 Allow 头），
 *     既不是预检该有的 2xx，也不带 CORS 头，浏览器照样会拦截 —— 所以必须手写 OPTIONS。
 *  3. Access-Control-Allow-Origin 不能是 "*"（当需要 Cookie 时）。
 */

const allowedOrigins = ["https://example.com", "https://www.vercel.com"];

function buildCorsHeaders(origin: string | null) {
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/** 预检请求 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request.headers.get("origin")),
  });
}

/** 实际请求 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { message: "带 CORS 头的响应", origin: request.headers.get("origin") },
    { headers: buildCorsHeaders(request.headers.get("origin")) },
  );
}
