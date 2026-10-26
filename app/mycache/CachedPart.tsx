import { cacheLife, cacheTag } from "next/cache";

/**
 * 「use cache」= Next 16 Cache Components 的核心指令。
 *
 * 它必须写在 **函数体第一行**（或文件顶层），把整个函数变成「缓存组件」：
 *  - 函数的参数与返回值必须是 **可序列化**的；
 *  - 缓存键由函数本身的标识 + 参数共同决定；
 *  - 缓存生命周期由 cacheLife() 控制；
 *  - 缓存可用 cacheTag() 打标签，配合 revalidateTag() 按需失效。
 *
 * 注意：需要开启 next.config.ts 的 cacheComponents: true 才生效。
 */
async function getCachedName() {
  "use cache";

  // 预设档位：seconds | minutes | hours | days | weeks | max
  cacheLife("hours");

  // 打标签，之后可以用 revalidateTag("mycache-demo") 精准失效这一条缓存
  cacheTag("mycache-demo");

  // 故意用随机数：被缓存后，多次刷新页面这个值【不会变】，
  // 这正是「缓存命中」最直观的证据（对照 DynamicPart 每次都变）。
  return { name: `随机名字-${Math.random().toString(36).slice(2, 8)}`, at: Date.now() };
}

export default async function CachedPart() {
  const data = await getCachedName();
  return (
    <div className="rounded-lg border border-green-300 bg-green-50 p-4 dark:border-green-700 dark:bg-green-950">
      <h2 className="text-lg font-semibold">① 「use cache」缓存组件</h2>
      <p>名称：{data.name}</p>
      <p className="text-xs opacity-70">生成时间：{new Date(data.at).toLocaleString("zh-CN")}</p>
      <p className="text-xs opacity-70">
        ↻ 反复刷新本页，这个「名称」不会变 —— 因为它被缓存了（cacheLife: hours）。
      </p>
    </div>
  );
}
