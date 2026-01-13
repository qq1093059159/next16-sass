import Link from "next/link";
import React from "react";

export default function Users() {
  return (
    <div>
      <h1>Dashboard Users Page</h1>
      <ul>
        <li className="underline">
          <Link href="/dashboard/users/1">User 1</Link>
        </li>
        <li className="underline">
          <Link href="/dashboard/users/2">User 2</Link>
        </li>
        <li className="underline">
          <Link href="/dashboard/users/3">User 3</Link>
        </li>
        <li className="underline">
          <Link href="/dashboard/users/4">User 4</Link>
        </li>
      </ul>
    </div>
  );
}
