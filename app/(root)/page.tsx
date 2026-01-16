"use client";
// "use cache"
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Home() {
  const arr = [1, 2, 3, 4, 5];
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        Welcome, Next.js
        <h1>my h1 style</h1>
        <div className="card">card 自定义样式</div>
        <div className="mycard">card 自定义样式</div>
        <h3>Link组件</h3>
        <div>
          <Link href="/about">跳转About页面</Link>
          <Link href={{ pathname: "/about", query: { name: "张三" } }}>
            跳转About并且传入参数
          </Link>
          <Link href="/page" prefetch={true}>
            预获取page页面
          </Link>
          <Link href="/xm" scroll={true}>
            保持滚动位置
          </Link>
          <Link href="/daman" replace={true}>
            替换当前页面
          </Link>
        </div>
        <div>
          {arr.map((item) => (
            <Link key={item} href={`/page/${item}`}>
              动态渲染的Link{item}
            </Link>
          ))}
        </div>
        <>
          <button onClick={() => router.push("/page")}>跳转page页面</button>
          <button onClick={() => router.replace("/page")}>替换当前页面</button>
          <button onClick={() => router.back()}>返回上一页</button>
          <button onClick={() => router.forward()}>跳转下一页</button>
          <button onClick={() => router.refresh()}>刷新当前页面</button>
          <button onClick={() => router.prefetch("/about")}>
            预获取about页面
          </button>
        </>
      </main>
    </div>
  );
}
