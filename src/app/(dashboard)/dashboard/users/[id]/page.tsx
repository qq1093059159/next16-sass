import React from "react";

export default async function UserDetail({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  return <div>Showing UserDetail for user #{id}</div>;
}
