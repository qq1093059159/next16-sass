import React from "react";

export default async function Albums() {
  const response = await fetch("https://jsonplaceholder.typicode.com/albums");
  if (!response.ok) throw new Error("Failed to fetch data");
  const albums = await response.json();
  // 服务端获取组件，数据接口请求在服务端完成，减少重复请求，减少客户端请求，加快渲染
  return (
    <div>
      {albums.map((album: { id: number; title: string }) => (
        <div key={album.id}>
          {album.id}----{album.title}
        </div>
      ))}
    </div>
  );
}
