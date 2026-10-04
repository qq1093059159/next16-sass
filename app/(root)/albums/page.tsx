import React from "react";

export const dynamic = "force-dynamic";

export default async function Albums() {
  let albums: { id: number; title: string }[] = [];
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/albums");
    if (response.ok) {
      albums = await response.json();
    }
  } catch {
    albums = [];
  }
  // 服务端获取组件，数据接口请求在服务端完成，减少重复请求，减少客户端请求，加快渲染
  return (
    <div>
      {albums.map((album) => (
        <div key={album.id}>
          {album.id}----{album.title}
        </div>
      ))}
    </div>
  );
}
