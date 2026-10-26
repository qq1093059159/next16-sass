"use client";
import { useFormStatus } from "react-dom";

/**
 * useFormStatus 只能读取【父级 form】的提交状态。
 * 它必须放在 form 组件的【子组件】里 —— 直接写在 form 所在组件中永远拿到 false。
 *
 * React 19 / Next 16 做「提交按钮 loading」的标准写法。
 */
export default function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
    >
      {pending ? "提交中..." : "提交"}
    </button>
  );
}
