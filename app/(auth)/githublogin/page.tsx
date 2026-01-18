"use client";
import { signIn } from "next-auth/react";
export default function GithubLogin() {
  return (
    <div>
      <button onClick={() => signIn("github")}>signIn</button>
    </div>
  );
}
