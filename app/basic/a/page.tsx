import Link from "next/link";
const getData = async () => {
  //触发异步会自动跳转到loading组件 异步结束正常返回页面
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("数据");
    }, 5000);
  });
};
export default async function APage() {
  const data = await getData();
  console.log(data);
  //遇到异常会自动跳转到error组件
  // throw new Error("错误");
  return (
    <div>
      <h1>A Page</h1>
      <Link href="/basic/b">跳转B</Link>
    </div>
  );
}
