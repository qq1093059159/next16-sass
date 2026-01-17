"use client";
import { signIn } from "next-auth/react";
export default function GithubLogin() {
  return (
    <div>
      {" "}
      <button onClick={() => signIn("github", { redirectTo: "/dashboard" })}>
        Sign In
      </button>
    </div>
  );
}
