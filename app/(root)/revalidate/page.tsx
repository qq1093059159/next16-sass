import Link from "next/link";
import {
  invalidateByPath,
  invalidateByTag,
  invalidateByUpdateTag,
  refreshClientCache,
} from "@/lib/revalidate-actions";

/**
 * 按需失效演示页（Server Component）。
 *
 * 页面上的按钮直接调用 lib/revalidate-actions.ts 里的 Server Action，
 * 浏览器不需要手写 fetch，也不需要额外的 API 路由。
 */
export default function RevalidatePage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1>按需失效 · revalidatePath / revalidateTag / updateTag</h1>
      <p className="mt-2 text-sm opacity-70">
        先打开 <Link href="/ssg/1" className="underline">/ssg/1</Link> 记下它的内容，
        再回到本页点下面的按钮，看缓存被清掉后 /ssg/1 变成什么样。
      </p>

      <div className="mt-6 flex flex-col items-start gap-3">
        <FormButton action={invalidateByPath} label="revalidatePath(/ssg/1) —— 按路径失效" />
        <FormButton action={invalidateByTag} label="revalidateTag(post-1, max) —— 按标签失效" />
        <FormButton
          action={invalidateByUpdateTag}
          label="updateTag(post-1) —— 立即失效（Next 16 新增，读己所写）"
        />
        <FormButton action={refreshClientCache} label="refresh() —— 刷新客户端缓存" />
      </div>

      <div className="mt-8 rounded-lg border border-sky-300 bg-sky-50 p-4 text-sm dark:border-sky-700 dark:bg-sky-950">
        <h2 className="font-semibold">四者的分工</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>revalidatePath</b>：粒度最粗，按 URL 路径清。适合整个页面被改动的场景。
          </li>
          <li>
            <b>revalidateTag</b>：粒度最细，按标签清。第二个参数 profile 决定过期策略，
            例如 max 表示最久缓存。
          </li>
          <li>
            <b>updateTag</b>：Next 16 新增，只能在 Server Action 内调用；
            语义是立即过期，并让本次写入对当前请求立即可见。
          </li>
          <li>
            <b>refresh</b>：刷新【客户端】缓存。客户端 Router Cache 里也有动态数据的副本，
            服务端改了之后要靠它同步。
          </li>
        </ul>
        <p className="mt-2 opacity-70">
          补充：在 Server Action 里调用 revalidateTag / updateTag 时，
          Next 同样会自动刷新发起该 Action 的页面。
        </p>
      </div>
    </div>
  );
}

function FormButton({
  action,
  label,
}: {
  action: () => Promise<void>;
  label: string;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {label}
      </button>
    </form>
  );
}
