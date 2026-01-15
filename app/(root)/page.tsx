"use cache";
export default async function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        Welcome, Next.js
        <h1>my h1 style</h1>
        <div className="card">card 自定义样式</div>
        <div className="mycard">card 自定义样式</div>
      </main>
    </div>
  );
}
