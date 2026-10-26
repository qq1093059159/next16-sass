import React from "react";
import { connection } from "next/server";

/**
 * 服务端组件（无 "use client"）直接 fetch 外部接口 —— 请求发生在服务端，
 * 不占用客户端带宽，也不会有跨域问题。
 *
 * Next 16 + Cache Components：旧的 `export const dynamic = "force-dynamic"`
 * 与 cacheComponents 冲突（构建期报错），改用 connection() 显式声明动态渲染。
 */
export default async function Albums() {
  // 显式声明「这一段要实时数据」，框架就不会在构建期预渲染它
  await connection();

  let albums: { id: number; title: string }[] = [];
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/albums");
    if (response.ok) {
      albums = await response.json();
    }
  } catch {
    // 外部接口不可用时兜底，避免整页 500
    albums = [];
  }

  return (
    <div className="p-6">
      <h1>Albums（服务端取数）</h1>
      {albums.length === 0 ? (
        <p className="text-sm opacity-70">外部接口未连通，已使用空数据兜底。</p>
      ) : (
        albums.map((album) => (
          <div key={album.id}>
            {album.id}----{album.title}
          </div>
        ))
      )}
    </div>
  );
}
