"use server";

import { revalidatePath, revalidateTag, refresh, updateTag } from "next/cache";

/**
 * 按需失效（On-Demand Revalidation）—— Server Action 版本。
 *
 * Next 16 的四个 API：
 *  - revalidatePath(path)        按【路径】失效：该路径下的页面重新生成
 *  - revalidateTag(tag, profile) 按【标签】失效：profile 决定过期策略
 *  - updateTag(tag)             立即失效，且实现「读己所写」语义（只能在 Server Action 里）
 *  - refresh()                  刷新客户端缓存（客户端侧的动态数据也会一起刷新）
 *
 * 注意：这几个 API 只能写在服务端，客户端直接 import 会报错。
 */

/** 按路径失效：重置 /ssg/1 这条路由的缓存 */
export async function invalidateByPath() {
  revalidatePath("/ssg/1");
}

/** 按标签失效：profile 传预设名（seconds/minutes/hours/days/weeks/max） */
export async function invalidateByTag() {
  revalidateTag("post-1", "max");
}

/** Next 16 新 API：立即让标签失效，并让本次写入对当前请求立即可见 */
export async function invalidateByUpdateTag() {
  updateTag("post-1");
}

/** 刷新客户端缓存 */
export async function refreshClientCache() {
  refresh();
}
