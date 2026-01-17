/* eslint-disable react-hooks/purity */
import { Suspense } from "react";
import { connection } from "next/server";

const DynamicContent = async () => {
  await connection(); //使用connection表示不要预渲染这部分

  const random = Math.random();
  const now = Date.now();
  console.log(random, now);
  return (
    <div>
      <h2>动态内容</h2>
      <main>
        <ul>
          <li>名称：{random}</li>
          <li>时间：{now}</li>
        </ul>
      </main>
    </div>
  );
};

export default async function Home() {
  return (
    <div>
      <h1>Home</h1>
      <Suspense fallback={<div>动态内容Loading...</div>}>
        <DynamicContent />
      </Suspense>
    </div>
  );
}
