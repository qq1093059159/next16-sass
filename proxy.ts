import { NextRequest, NextResponse } from "next/server";
import { ProxyConfig } from "next/server";
export { auth as middleware } from "@/auth"
export async function proxy(request: NextRequest) {
  // 此时会拦截项目中所有的请求，包括静态资源、API请求、页面请求等
  console.log(request.url, 'url');
  // const cookie = request.cookies.get('token');
  // if (request.nextUrl.pathname.startsWith('/home') && !cookie) {
  //   console.log('redirect to login');
  //   return NextResponse.redirect(new URL('/mylogin', request.url));
  // }
  // if (cookie && cookie.value) {
  //   return NextResponse.next();
  // }
  // return NextResponse.redirect(new URL('/mylogin', request.url));
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  })
  return response;
}
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
//配置匹配路径
export const config: ProxyConfig = {
  // matcher: '/api/:path*',
  matcher: ['/api/:path*', '/home/:path*'],
  //matcher: ['/api/:path*','/api/user/:path*'], 支持单个以及多个路径匹配
  //matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'], 同样支持正则表达式匹配
}