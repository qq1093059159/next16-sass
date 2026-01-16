// export async function GET(request: Request) { }

// export async function HEAD(request: Request) { }

// export async function POST(request: Request) { }

// export async function PUT(request: Request) { }

// export async function DELETE(request: Request) { }

// export async function PATCH(request: Request) { }

// //如果没有定义OPTIONS方法，则Next.js会自动实现OPTIONS方法
// export async function OPTIONS(request: Request) { }
import { cookies } from "next/headers"; //引入cookies
import { NextRequest, NextResponse } from "next/server"; //引入NextRequest, NextResponse
//模拟登录成功后设置cookie
export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.username === 'admin' && body.password === '123456') {
    const cookieStore = await cookies(); //获取cookie
    cookieStore.set('token', '123456', {
      httpOnly: true, //只允许在服务器端访问
      maxAge: 60 * 60 * 24 * 30, //30天
    });
    return NextResponse.json({ code: 1 }, { status: 200 });
  } else {
    return NextResponse.json({ code: 0 }, { status: 401 });
  }
}
//检查登录状态
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  if (token && token.value === '123456') {
    return NextResponse.json({ code: 1 }, { status: 200 });
  } else {
    return NextResponse.json({ code: 0 }, { status: 401 });
  }
}
