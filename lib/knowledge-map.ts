export type KnowledgeItem = {
  name: string;
  href?: string;
  file?: string;
  desc: string;
};

export type KnowledgeSection = {
  title: string;
  summary: string;
  items: KnowledgeItem[];
};

/**
 * 全仓库知识点地图（数据源）。
 * 页面在 app/(root)/knowledge/page.tsx 渲染。
 */
export const knowledgeMap: KnowledgeSection[] = [
  {
    title: "一、约定文件（Convention Files）",
    summary: "文件名即路由契约，Next.js 靠文件名驱动渲染，不需要任何配置。",
    items: [
      {
        name: "layout.tsx",
        href: "/basic/a",
        file: "app/layout.tsx · app/(root)/layout.tsx · app/basic/layout.tsx",
        desc: "布局外壳，导航时【不】重新挂载，状态得以保留。根 layout 必须含 <html><body>。",
      },
      {
        name: "template.tsx",
        href: "/basic/a",
        file: "app/basic/template.tsx",
        desc: "和 layout 只差一点：每次导航都重新挂载，状态归零。适合表单重置、入场动画。",
      },
      {
        name: "page.tsx",
        href: "/",
        file: "遍布全项目",
        desc: "路由本体。一个目录只能有一个 page，只有它对外可见。",
      },
      {
        name: "loading.tsx",
        href: "/basic/a",
        file: "app/loading.tsx · app/basic/loading.tsx",
        desc: "loading.tsx 就是 <Suspense fallback> 的语法糖，命中即自动显示。",
      },
      {
        name: "error.tsx",
        href: "/basic/a",
        file: "app/(root)/error.tsx · app/basic/error.tsx",
        desc: "段级错误边界，必须 \"use client\"，接收 error 与 reset 两个 prop。",
      },
      {
        name: "global-error.tsx",
        file: "app/global-error.tsx",
        desc: "根级错误兜底，会【替换根 layout】，因此必须自己输出 <html><body>。",
      },
      {
        name: "not-found.tsx",
        href: "/notfound",
        file: "app/not-found.tsx",
        desc: "404 页面，由路由未匹配或 notFound() 触发。",
      },
      {
        name: "default.tsx",
        href: "/basic/a",
        file: "app/default.tsx · app/@team/default.tsx · app/@analytics/default.tsx",
        desc: "平行路由 slot 的兜底。硬刷新到没有对应 slot 的路由时，Next 渲染它而不是报 404。缺了它，slot 会直接空掉 —— 平行路由最高频事故。",
      },
    ],
  },
  {
    title: "二、路由组织",
    summary: "三种括号三种语义，最容易混淆的一组概念。",
    items: [
      {
        name: "路由组 (folder)",
        href: "/dashboard/users/1",
        file: "app/(auth) · app/(dashboard) · app/(root)",
        desc: "只用于分组，不进 URL。可挂独立 layout，是 URL 结构与代码结构解耦的关键。",
      },
      {
        name: "平行路由 @folder",
        href: "/",
        file: "app/@team · app/@analytics",
        desc: "以 prop 形式注入同级 layout。必须配 default.tsx；layout 里的 prop 名要与目录名一致。",
      },
      {
        name: "拦截路由 (.) (..)",
        href: "/intercepting",
        file: "app/(root)/intercepting/@modal/(.)photo/[id]",
        desc: "软导航命中拦截页（弹窗），硬导航命中真实页。必须搭配平行路由 slot。",
      },
      {
        name: "动态路由 [id]",
        href: "/slug/foo",
        file: "app/slug/[id]",
        desc: "匹配单段路径，params 为 { id: string }。",
      },
      {
        name: "捕获路由 [...id]",
        href: "/slug/a/b",
        file: "app/slug/[...id]",
        desc: "匹配多段路径，params 为 { id: string[] }。",
      },
      {
        name: "可选捕获 [[...id]]",
        href: "/slugs",
        file: "app/slugs/[[...id]]",
        desc: "可匹配零段或多段。Clerk 的 /sign-in/[[...sign-in]] 就是这个用法。",
      },
    ],
  },
  {
    title: "三、渲染与缓存（Next 16 核心）",
    summary: "开启 cacheComponents 后，渲染模式由「声明缓存 / 声明动态」显式表达，不再靠段配置。",
    items: [
      {
        name: "use cache",
        href: "/mycache",
        file: "app/mycache/CachedPart.tsx",
        desc: "Cache Components 的核心指令。函数体首行声明，参数与返回值必须可序列化。",
      },
      {
        name: "cacheLife",
        href: "/mycache",
        file: "app/mycache/CachedPart.tsx",
        desc: "stale / revalidate / expire 三段语义；预设 default|seconds|minutes|hours|days|weeks|max。本项目用 hours。",
      },
      {
        name: "cacheTag",
        href: "/revalidate",
        file: "app/mycache/CachedPart.tsx · lib/revalidate-actions.ts",
        desc: "给缓存条目打标签，供 revalidateTag 精准失效。",
      },
      {
        name: "connection()",
        href: "/mycache",
        file: "app/mycache/DynamicPart.tsx",
        desc: "Next 16 显式动态开关。取代旧版 export const dynamic = \"force-dynamic\"。",
      },
      {
        name: "generateStaticParams",
        href: "/ssg",
        file: "app/(root)/ssg/[id]/page.tsx",
        desc: "构建期为动态路由预渲染出具体路径。本项目预渲染了 /ssg/1~3。",
      },
      {
        name: "revalidatePath",
        href: "/revalidate",
        file: "lib/revalidate-actions.ts",
        desc: "按 URL 路径立即失效缓存。",
      },
      {
        name: "revalidateTag",
        href: "/revalidate",
        file: "lib/revalidate-actions.ts",
        desc: "按标签立即失效缓存，第二个参数指定 profile。",
      },
      {
        name: "updateTag（Next 16 新增）",
        href: "/revalidate",
        file: "lib/revalidate-actions.ts",
        desc: "只能在 Server Action 内调用，实现「读己所写」语义。",
      },
      {
        name: "refresh（Next 16 新增）",
        href: "/revalidate",
        file: "lib/revalidate-actions.ts",
        desc: "刷新客户端 Router Cache 里的动态数据副本。",
      },
      {
        name: "Suspense 流式渲染",
        href: "/mysuspense",
        file: "app/mysuspense/page.tsx",
        desc: "静态壳子先出、动态部分流式追加，是 PPR 的基础形态。",
      },
      {
        name: "after()",
        href: "/after",
        file: "app/(root)/after/page.tsx",
        desc: "响应结束后再执行的任务：埋点、日志、清理，不占用用户等待时间。",
      },
    ],
  },
  {
    title: "四、Server Actions 与数据变更",
    summary: "从「手写 fetch」到「声明式表单」的完整演进链。",
    items: [
      {
        name: "传统 fetch + router.push",
        href: "/mylogin",
        file: "app/(auth)/mylogin/page.tsx",
        desc: "样板最多：要自己管 loading、自己写 API 路由、自己跳转。",
      },
      {
        name: "Server Action + FormData",
        href: "/serverlogin",
        file: "app/(auth)/serverlogin/page.tsx",
        desc: "原生表单语义，JS 禁用也能提交；用 .bind() 预置额外参数。",
      },
      {
        name: "useActionState + Zod 4",
        href: "/serverzodlogin",
        file: "app/(auth)/serverzodlogin/page.tsx · lib/actions.ts",
        desc: "★推荐形态：isPending 白送、零 API 路由、校验在服务端绕不过。",
      },
      {
        name: "useOptimistic（React 19）",
        href: "/optimistic",
        file: "app/(root)/optimistic/page.tsx",
        desc: "服务端结果回来前先渲染「预计状态」，落库后自动替换为真实值。",
      },
      {
        name: "useFormStatus（React 19）",
        href: "/optimistic",
        file: "app/(root)/optimistic/SubmitButton.tsx",
        desc: "读父级 form 的 pending 状态，必须写在 form 的子组件里。",
      },
    ],
  },
  {
    title: "五、Route Handlers（Route 层）",
    summary: "app/api/**/route.ts —— 与页面平行的第二套 API 入口。",
    items: [
      {
        name: "HTTP 方法导出",
        href: "/api/user",
        file: "app/api/user/route.ts",
        desc: "GET / POST / PUT / PATCH / DELETE / HEAD。实测：未定义 OPTIONS 时 Next 16 返回 405 Method Not Allowed（带 Allow 头），并不会自动补 204。",
      },
      {
        name: "请求体四种解析",
        href: "/api/user",
        file: "app/api/user/route.ts",
        desc: "json() / formData() / text() / arrayBuffer() / blob()。",
      },
      {
        name: "params 是 Promise",
        href: "/api/user/886",
        file: "app/api/user/[id]/route.ts · app/api/books/[id]/route.ts",
        desc: "Next 15+ 破坏性变更：context.params 变成 Promise，必须 await。本仓库已全部迁移（旧写法会静默拿到 NaN）。",
      },
      {
        name: "Cookie 读写",
        href: "/api/cookies",
        file: "app/api/login/route.ts · app/api/cookies/route.ts",
        desc: "cookies() 写响应头；response.cookies.set() 更直观。httpOnly 防 XSS 窃取。",
      },
      {
        name: "CORS 与预检",
        href: "/api/cors",
        file: "app/api/cors/route.ts",
        desc: "手写 OPTIONS 才能正确响应浏览器预检；带 Cookie 时不能写通配符 *。",
      },
      {
        name: "redirect 与 rewrite",
        href: "/api/redirect",
        file: "app/api/redirect/route.ts",
        desc: "redirect 改地址栏；rewrite 内部改写、地址栏不变。",
      },
      {
        name: "流式响应 SSE",
        href: "/stream",
        file: "app/api/stream/route.ts · app/(root)/stream/page.tsx",
        desc: "ReadableStream 手动分块推送。流式与缓存互斥。",
      },
      {
        name: "maxDuration",
        href: "/api/cookies",
        file: "app/api/cookies/route.ts",
        desc: "声明该路由最长执行时间，避免 Serverless 平台提前杀掉。",
      },
    ],
  },
  {
    title: "六、元数据与 SEO",
    summary: "全部是约定文件，构建期即产出静态资源。",
    items: [
      {
        name: "metadata",
        href: "/seo",
        file: "app/(root)/seo/page.tsx",
        desc: "title 模板、description、openGraph、twitter、icons、robots 全套。",
      },
      {
        name: "generateMetadata",
        href: "/dashboard/users/1",
        file: "app/(dashboard)/dashboard/users/[id]/page.tsx",
        desc: "动态元信息，按 params 生成标题与描述。",
      },
      {
        name: "viewport",
        href: "/seo",
        file: "app/(root)/seo/page.tsx",
        desc: "Next 14 之后必须从 metadata 里拆出来单独导出。",
      },
      {
        name: "sitemap.ts / robots.ts / manifest.ts",
        href: "/sitemap.xml",
        file: "app/sitemap.ts · app/robots.ts · app/manifest.ts",
        desc: "分别产出 /sitemap.xml、/robots.txt、/manifest.webmanifest。",
      },
      {
        name: "icon.tsx / opengraph-image.tsx",
        href: "/seo",
        file: "app/icon.tsx · app/opengraph-image.tsx",
        desc: "用 ImageResponse 在构建期把 JSX 渲染成 PNG，无需手工备图。",
      },
    ],
  },
  {
    title: "七、客户端能力与边界",
    summary: "RSC 与客户端组件的分界线，决定代码跑在哪一侧。",
    items: [
      {
        name: "use client",
        href: "/client",
        file: "app/client/page.tsx",
        desc: "客户端组件也会参与 SSR（首屏 HTML），之后才 hydrate 接管。",
      },
      {
        name: "server-only",
        href: "/serveronly",
        file: "app/serveronly/page.tsx",
        desc: "编译期约束：被客户端组件 import 时构建直接失败。配套有 client-only。",
      },
      {
        name: "服务端壳 + 客户端岛",
        href: "/",
        file: "components/navigation/navbar/index.tsx",
        desc: "★最佳实践：把 use client 尽量推向叶子节点，减少下发 JS 体积。",
      },
      {
        name: "next/image",
        href: "/myimage",
        file: "app/myimage/page.tsx",
        desc: "静态 import 会自动注入宽高；远程图需在 remotePatterns 白名单；sizes 决定浏览器下载哪一档尺寸。",
      },
      {
        name: "next/font",
        href: "/font",
        file: "app/(root)/font/page.tsx",
        desc: "构建期下载并自托管字体，零布局偏移；构建需要一次网络。",
      },
      {
        name: "Link 与 useRouter",
        href: "/",
        file: "app/(root)/page.tsx",
        desc: "Link 走软导航（保留布局与状态）；useRouter 提供 push/replace/back/forward/refresh/prefetch。",
      },
      {
        name: "导航 Hooks",
        href: "/hooks",
        file: "app/(root)/hooks/page.tsx",
        desc: "usePathname / useSearchParams / useParams / useSelectedLayoutSegment(s)。",
      },
      {
        name: "next/script",
        href: "/",
        file: "app/(root)/page.tsx",
        desc: "第三方脚本加载器，支持 beforeInteractive / afterInteractive / lazyOnload / worker。",
      },
    ],
  },
  {
    title: "八、请求边界与中间件",
    summary: "在进入路由之前拦截、鉴权、改写请求。",
    items: [
      {
        name: "proxy.ts（Next 16 重命名）",
        file: "proxy.ts",
        desc: "原 middleware.ts。导出函数名从 middleware 改为 proxy，类型从 MiddlewareConfig 改为 ProxyConfig。",
      },
      {
        name: "matcher",
        file: "proxy.ts",
        desc: "支持单条、数组、负向前瞻正则三种写法，决定哪些请求会被拦截。",
      },
      {
        name: "Global Config",
        href: "/api/cors",
        file: "proxy.ts",
        desc: "@vercel/global-config 读 Vercel 项目级配置，与常规 env 变量不是一回事。",
      },
      {
        name: "instrumentation.ts",
        file: "app/instrumentation.ts",
        desc: "服务启动钩子 register() + 服务端错误钩子 onRequestError()。",
      },
    ],
  },
  {
    title: "九、实测踩坑清单（本仓库跑出来的）",
    summary: "不是文档抄来的，是在本仓库 next build + pnpm start 下 curl 实测复现的结论。",
    items: [
      {
        name: "PPR 下 notFound() 返回 200",
        href: "/notfound",
        file: "app/(root)/notfound/page.tsx",
        desc: "响应一开始流式输出，预渲染壳子已发出，状态码就锁定 200 —— 页面是 404 界面但 HTTP 是 200。加 await connection() 也无效（/notfound-dynamic 实测仍是 200）。稳定拿到 404 只有两条路：框架级路由未匹配、Route Handler 显式返回。",
      },
      {
        name: "generateStaticParams + use cache = SSG + ISR",
        href: "/ssg/1",
        file: "app/(root)/ssg/[id]/page.tsx",
        desc: "构建产物里 /ssg/1~3 是静态页（○ Static），响应头 x-nextjs-cache: HIT、x-nextjs-stale-time: 30，超期后台重算。",
      },
      {
        name: "Cache Components 会禁用段级配置",
        href: "/mycache",
        file: "next.config.ts · app/(root)/albums/page.tsx",
        desc: "开启 cacheComponents 后，export const dynamic / revalidate / dynamicParams 全部构建期报错，必须改用 use cache + connection()。",
      },
      {
        name: "useSearchParams 必须包 Suspense",
        href: "/hooks",
        file: "app/(root)/hooks/page.tsx",
        desc: "在静态预渲染页面里直接用 useSearchParams，next build 会报 should be wrapped in a suspense boundary。",
      },
      {
        name: "未定义 OPTIONS → 405 不是 204",
        href: "/api/cors",
        file: "app/api/cors/route.ts",
        desc: "实测：路由未导出 OPTIONS 时，Next 16 返回 405 Method Not Allowed（带 Allow 头），既不是预检该有的 2xx 也不带 CORS 头。需要处理预检必须自己手写 OPTIONS。",
      },
      {
        name: "error.tsx 必须接 error / reset",
        file: "app/(root)/error.tsx",
        desc: "只渲染一个静态「error」字样等于没做错误边界：拿不到错误信息、也无法重试。global-error.tsx 还必须自己输出 html/body。",
      },
      {
        name: "OPTIONS 未定义时返回 405",
        href: "/api/books",
        file: "app/api/books/route.ts",
        desc: "实测：路由未导出 OPTIONS 时 Next 16 返回 405 Method Not Allowed（带 Allow 头），并不会自动补一个 204。需要处理浏览器预检必须自己手写 OPTIONS（见 app/api/cors/route.ts）。",
      },
      {
        name: "动态 import 的 key 必须是完整文件名",
        href: "/posts",
        file: "lib/posts.ts · app/posts/[...slug]/page.tsx",
        desc: "动态 import 表达式会被编译成目录 context map，key 是完整路径。写死 .mdx 会导致 .md 文件找不到（报 Cannot find module）；应传含扩展名的完整文件名，并优先用 @/ 别名而非相对路径。",
      },
      {
        name: "Windows 路径分隔符会打断 import",
        href: "/posts/tech/nested-post",
        file: "lib/posts.ts",
        desc: "readdirSync(dir, {recursive:true}) 在 Windows 上返回反斜杠路径，拼出的 import key 与 context map 对不上，报 Cannot find module。必须 .split(path.sep).join('/')。",
      },
      {
        name: "YAML frontmatter 是元数据主流写法",
        href: "/posts/gfm-test",
        file: "next.config.ts · lib/posts.ts",
        desc: "frontmatter 属 remark 插件层，.md 与 .mdx 都生效（MDX 语法层的 JSX/ESM 导出才只有 .mdx 能用）。remark-mdx-frontmatter 把它转成 export const frontmatter，getPostMeta() 负责与手写 metadata、.json 旁路三者合并。",
      },
      {
        name: "Turbopack 下插件必须用字符串名",
        href: "/posts/gfm-test",
        file: "next.config.ts",
        desc: "Turbopack 要求 loader options 可序列化，传插件函数会报 does not have serializable options。必须写 'remark-gfm' 这样的字符串包名，且选项不能含回调函数。",
      },
      {
        name: "remark-mdx-frontmatter 的 name 不能填 metadata",
        href: "/posts/gfm-test",
        file: "next.config.ts",
        desc: "该插件无条件注入导出，没有 frontmatter 的文件也会生成 export const metadata = {}，与手写的同名导出撞名，报 Variable name conflict: metadata。用 name: 'frontmatter' 再由 JS 层合并。",
      },
      {
        name: "分类目录需要 catch-all 路由",
        href: "/category/tech",
        file: "app/posts/[...slug]/page.tsx · app/category/[category]/page.tsx",
        desc: "content/ 的子目录自动成为分类，零配置。但 [slug] 只匹配一段路径，接不住 /posts/tech/post —— 必须用 [...slug]（catch-all），且 params.slug 是 string[]。",
      },
    ],
  },
  {
    title: "十、MDX 与内容目录",
    summary: "@next/mdx 是编译期 loader（文件即路由）；要做「目录即内容源」需要自己补上目录扫描 + 动态 import。",
    items: [
      {
        name: "@next/mdx 启用",
        href: "/mdx-page",
        file: "next.config.ts · mdx-components.tsx",
        desc: "createMDX({ extension: /\\.(md|mdx)$/ }) + pageExtensions 包含 md/mdx。它把 .mdx 编译成 React 组件，遵循「一个文件 = 一个路由」，本身【不做目录扫描】。",
      },
      {
        name: "目录即内容源",
        href: "/posts",
        file: "content/ · lib/posts.ts · app/posts/",
        desc: "把 .md/.mdx 丢进 content/ 即成文章：generateStaticParams 递归扫描目录 → 动态 import 按路径取文件 → 列表页自动生成。",
      },
      {
        name: "分类目录零配置",
        href: "/category/tech",
        file: "content/tech/ · app/category/[category]/page.tsx",
        desc: "建一个文件夹就是一个新分类：content/tech/ → /category/tech。分类名与描述放分类目录下的 _meta.json（下划线开头会被扫描器跳过）。",
      },
      {
        name: "export const metadata",
        href: "/posts/hello",
        file: "content/hello.mdx",
        desc: "MDX 原生支持 ESM 导出，metadata 会自动进 <head>。@next/mdx 不解析 YAML frontmatter，要用 YAML 得加 remark 插件。",
      },
      {
        name: "MDX 组件映射",
        href: "/posts/hello",
        file: "mdx-components.tsx · components/mdx/Callout.tsx",
        desc: "登记过的组件名可在 .mdx 里直接用（如 <Callout type=warn>），作者无需 import 任何东西。",
      },
      {
        name: "多级分类（路由层本来就支持）",
        href: "/posts/a/b/deep-post",
        file: "lib/posts.ts · app/posts/[...slug]/page.tsx",
        desc: "「目录结构 = URL 路径」这条规则在 generateStaticParams 这一步生效：返回的 slug 数组长度 = 路径深度，catch-all 为每一段都生成实际路径。实测放进 content/a/b/ 立刻生成 /posts/a/b/post。",
      },
      {
        name: "多级分类页（catch-all + 层级树）",
        href: "/category/a/b",
        file: "app/category/[...category]/page.tsx · lib/posts.ts",
        desc: "分类页路由用 [...category]（[category] 只匹配一段）。getCategories() 返回所有层级节点（path/depth/parent/count/totalCount/children），页面带面包屑与子分类导航。/category/a 含子分类，/category/a/b 只含自己。",
      },
      {
        name: "路径分页",
        href: "/posts/page/2",
        file: "app/posts/page/[n]/page.tsx · lib/posts.ts",
        desc: "用路径分页而不是 ?page= query —— 前者静态生成、每页独立 URL（SEO 友好），后者要 await connection() 变动态。generateStaticParams 可以是 async，精确生成总页数；路由匹配不冲突（静态段 page 优先于 catch-all）。",
      },
      {
        name: "全文搜索（中文子串 + Fuse 模糊）",
        href: "/search",
        file: "lib/search.ts · app/search/SearchClient.tsx",
        desc: "索引在构建期算（读源文件剥 Markdown 标记得到正文纯文本），直接内联进页面传给客户端组件，零额外请求。★ Fuse.js 的编辑距离对中文无效（无空格分词），所以主路径是子串匹配，Fuse 只负责英文容错。",
      },
      {
        name: "RSS 订阅源",
        href: "/rss.xml",
        file: "app/rss.xml/route.ts · lib/site.ts",
        desc: "Route Handler 产出 RSS 2.0，内容变了 feed 自动跟着变。三个坑：link/guid 必须是绝对 URL、pubDate 必须是 RFC 822 而非 ISO 8601、XML 特殊字符必须转义。",
      },
      {
        name: "标签页",
        href: "/tags",
        file: "app/tags/page.tsx · app/tags/[tag]/page.tsx",
        desc: "标签来自 frontmatter 的 tags 字段，自动生成 /tags/<tag> 页面。generateStaticParams 可以是 async；但动态段的值必须是字符串（传对象会报 required parameter was not provided as a string）。中文标签靠 encodeURIComponent + Next 自动解码。",
      },
      {
        name: "上一篇 / 下一篇",
        href: "/posts/news/second-post",
        file: "lib/posts.ts · app/posts/[...slug]/page.tsx",
        desc: "列表按 date 倒序（新的在前），所以数组前一个是「上一篇」、后一个是「下一篇」。第一篇无上一篇、最后一篇无下一篇。",
      },
      {
        name: "草稿机制",
        href: "/posts/news/draft-wip",
        file: "lib/posts.ts · content/news/draft-wip.mdx",
        desc: "frontmatter 写 draft: true 即被完全排除：不生成路由、不进列表/标签页/RSS。用 gray-matter 同步读文件判断（比 import 编译产物快得多），在扫描阶段就 filter 掉。",
      },
      {
        name: "remark / rehype 插件链",
        href: "/posts/gfm-test",
        file: "next.config.ts",
        desc: "让 Markdown 像技术文档的关键：remark-gfm（表格/删除线/任务列表）+ rehype-slug（标题锚点）+ rehype-pretty-code（Shiki 高亮，编译期完成）。remark 处理 Markdown AST，rehype 处理 HTML AST。",
      },
    ],
  },
];
