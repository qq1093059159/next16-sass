import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
// import { cacheLife } from "next/cache";
// 使用revalidate属性，可以设置缓存时间，单位为秒
// export const revalidate = 5; // 5秒后重新更新
// 使用dynamic属性，并且设置为force-dynamic，表示将禁用缓存，每次请求都会重新获取数据
export const dynamic = "force-dynamic"; // 动态更新 缓存组件不需要使用这个 默认都是动态内容
//export const revalidate = 0 // 设置为0表示不缓存
const DynamicContent = async () => {
  // ("use cache");
  // cacheLife("hours"); //使用预设参数
  //cacheLife({stale: 30, revalidate: 1, expire: 1}) //使用自定义参数
  const data = await fetch("https://www.mocklib.com/mock/random/name"); //随机生成一个名称
  const json = await data.json();
  console.log(json);
  const cookieStore = await cookies(); //获取cookie
  console.log(cookieStore);
  // const randomImage = await fetch("https://www.loliapi.com/acg/pc?type=json");
  // 使用cache属性，并且设置为no-store，表示将禁用缓存，每次请求都会重新获取数据
  await connection();
  const randomImage = await fetch("https://www.loliapi.com/acg/pc?type=json", {
    cache: "no-store",
  });
  const data2 = await randomImage.json();
  return (
    <div>
      <h2>动态内容</h2>
      <main>
        <ul>
          <li>名称：{json.name}</li>
        </ul>
      </main>
      <img width={500} height={500} src={data2.url} alt="random image" />
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
