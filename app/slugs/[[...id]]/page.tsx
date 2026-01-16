//app/shop/[[...id]]/page.tsx
// 可选路由[[...slug]]
"use client";
import { useParams } from "next/navigation";
export default function Page() {
  const params = useParams();
  console.log(params); //{id: '123'}  {id: ['123', '456']} 接受单个值以及多个值
  return <div>[[...slug]]Page</div>;
}
