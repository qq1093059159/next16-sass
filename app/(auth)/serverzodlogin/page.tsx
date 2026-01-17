"use client";
import { useActionState } from "react";
import { handleLogin } from "@/lib/actions";
const initialState = { message: "" };
export default function Login() {
  const [state, formAction, isPending] = useActionState(
    handleLogin,
    initialState
  );

  return (
    <div>
      <h1>登录页面</h1>
      {isPending && <div>Loading...</div>}
      {state.message}
      <div className="flex flex-col gap-2 w-75 mx-auto mt-30">
        <form action={formAction} className="flex flex-col gap-2">
          <input
            className="border border-gray-300 rounded-md p-2"
            type="text"
            name="username"
            placeholder="用户名"
          />
          <input
            className="border border-gray-300 rounded-md p-2"
            type="password"
            name="password"
            placeholder="密码"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md"
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}
