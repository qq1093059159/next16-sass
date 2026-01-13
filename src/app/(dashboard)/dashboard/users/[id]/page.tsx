import React from "react";
// 设置动态meta
export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = await params.id;
  // fetch post information
  const post = await fetch(`/app/blog/${id}`).then((res) => res.json());
  return {
    title: post.title,
    description: post.description,
  };
}
export default async function UserDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <div>Showing UserDetail for user #{id}</div>;
}
