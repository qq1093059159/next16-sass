"use client";
import { useOptimistic, useState } from "react";
import { addMessage } from "@/lib/optimistic-actions";
import SubmitButton from "./SubmitButton";

type Message = { id: string; text: string; pending?: boolean };

/**
 * React 19 useOptimistic —— 乐观更新。
 *
 * 传统做法：点提交 -> 等接口 -> setState -> 界面更新（这 1.5s 里界面毫无反应）
 * 乐观做法：点提交 -> 立刻把「预计结果」画出来 -> 接口回来后再用真实数据替换
 *
 * 关键约束：addOptimisticMessage 必须在 Action / Transition 内部调用。
 * 把它放进 <form action={...}> 的处理函数里，React 会自动包成 Transition。
 */
export default function OptimisticPage() {
  // 真实数据（服务端返回后才进这里）
  const [messages, setMessages] = useState<Message[]>([]);
  // 乐观数据：基于真实数据 + 本次乐观插入
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: Message[], newMessage: Message) => [...state, newMessage],
  );

  async function handleSubmit(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;

    // 1) 先乐观插入（UI 立刻响应，pending: true 表示还没落库）
    addOptimisticMessage({ id: "optimistic", text, pending: true });

    // 2) 再发真实请求（Server Action）
    const saved = await addMessage(text);

    // 3) 用真实数据替换掉乐观数据
    setMessages((prev) => [...prev, saved]);
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>乐观更新 · useOptimistic + useFormStatus</h1>
      <p className="mt-2 text-sm opacity-70">
        点提交后，消息【立刻】出现（带 pending 标记），1.5 秒后 pending 消失、
        id 变成真实 uuid —— 中间没有任何等待感。
      </p>

      <ul className="mt-6 flex flex-col gap-2">
        {optimisticMessages.map((message, index) => (
          <li
            key={message.id + index}
            className={
              "rounded-md border px-3 py-2 text-sm " +
              (message.pending
                ? "border-amber-300 bg-amber-50 opacity-70 dark:border-amber-700 dark:bg-amber-950"
                : "border-gray-200 dark:border-gray-700")
            }
          >
            {message.text}
            {message.pending ? <span className="ml-2 text-xs">（提交中...）</span> : null}
          </li>
        ))}
      </ul>

      <form action={handleSubmit} className="mt-6 flex gap-2">
        <input
          name="text"
          placeholder="输入内容"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <SubmitButton />
      </form>

      <div className="mt-8 rounded-lg border border-blue-300 bg-blue-50 p-4 text-sm dark:border-blue-700 dark:bg-blue-950">
        <h2 className="font-semibold">两个 Hook 的分工</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>useOptimistic</b>：在服务端结果回来之前，先渲染「预计状态」。
            服务端结果到达后，React 自动丢弃乐观值、切换到真实值。
          </li>
          <li>
            <b>useFormStatus</b>：只负责读 form 的 pending 状态，
            必须在 form 的子组件里用 —— 所以这里拆成了 SubmitButton.tsx。
          </li>
        </ul>
      </div>
    </div>
  );
}
