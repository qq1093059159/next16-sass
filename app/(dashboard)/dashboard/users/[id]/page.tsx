import React from "react";
// 设置动态meta
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `User #${id}`,
    description: `User detail page for user ${id}`,
  };
}
export default async function UserDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <div>Showing UserDetail for user #{id}</div>;
}
