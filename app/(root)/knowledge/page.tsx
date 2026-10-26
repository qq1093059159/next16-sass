import Link from "next/link";
import { knowledgeMap } from "@/lib/knowledge-map";

/**
 * 知识点地图 —— 全仓库索引入口。
 *
 * 这个仓库有 40+ 个路由目录，如果只靠 README 找，很容易迷路。
 * 本页把「每个知识点 → 对应代码位置 → 可点击的验证入口」列成一张表。
 */
export default function KnowledgePage() {
  const total = knowledgeMap.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold">Next.js 16 知识点地图</h1>
        <p className="mt-2 text-sm opacity-70">
          共 {knowledgeMap.length} 个主题 / {total} 个知识点。每一项都能点进去亲手验证。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {knowledgeMap.map((section) => (
            <a
              key={section.title}
              href={`#${section.title.slice(0, 4)}`}
              className="rounded-full border border-gray-300 px-3 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {section.title}
            </a>
          ))}
        </div>
      </header>

      <div className="mt-10 flex flex-col gap-10">
        {knowledgeMap.map((section) => (
          <section key={section.title} id={section.title.slice(0, 4)}>
            <h2 className="text-xl font-bold">{section.title}</h2>
            <p className="mt-1 text-sm opacity-70">{section.summary}</p>

            <div className="mt-4 flex flex-col gap-3">
              {section.items.map((item) => {
                const body = (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
                      {item.file ? (
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] opacity-80 dark:bg-gray-800">
                          {item.file}
                        </code>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm opacity-75">{item.desc}</p>
                  </>
                );

                return item.href ? (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    key={item.name}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-16 border-t border-gray-200 pt-6 text-sm opacity-70 dark:border-gray-700">
        <p>
          想动手改？每个示例都是最小可运行样本 —— 改一行代码，刷新浏览器，
          立刻能看到框架的反应。这是本仓库最大的价值。
        </p>
      </footer>
    </div>
  );
}
