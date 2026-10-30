import type { NextConfig } from "next";
import createMDX from '@next/mdx'

/**
 * MDX 编译选项 —— 走 @mdx-js/loader 的 JS 插件链。
 *
 * ⚠️ Turbopack 的硬性限制：loader options 必须【可序列化】，
 *    所以插件必须用【字符串包名】引用，不能传 import 进来的函数
 *    （函数无法序列化，会报 "does not have serializable options"）。
 *    插件的【选项】必须是纯 JSON 数据，不能含回调函数。
 *
 *    这也是 Next 官方文档对 Turbopack 的明确要求。
 */
const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
    options: {
        remarkPlugins: [
            // ① 先剥离 YAML frontmatter（否则 --- 会被当 thematic break 渲染出来）
            'remark-frontmatter',
            // ② 把 frontmatter 转成 ESM 导出：export const frontmatter = {...}
            //
            //    ⚠️ name 不能填 'metadata' —— 这个插件会【无条件】注入一个导出，
            //       即使文件里没有 frontmatter 也会生成 `export const metadata = {}`，
            //       于是和手写的 export const metadata 撞名，
            //       编译期报 "Variable name conflict: metadata"。
            //       用 'frontmatter' 这个名字就没有冲突，
            //       合并优先级由 lib/posts.ts 控制（frontmatter 优先）。
            ['remark-mdx-frontmatter', { name: 'frontmatter' }],
            // ③ GitHub Flavored Markdown：表格、删除线、任务列表、自动链接、脚注
            'remark-gfm',
        ],
        rehypePlugins: [
            // ④ 给标题自动加 id（用于锚点目录 / 锚点跳转）
            'rehype-slug',
            // ⑤ 代码高亮（Shiki，编译期完成，零运行时开销）
            ['rehype-pretty-code', {
                theme: { dark: 'github-dark', light: 'github-light' },
                defaultLang: 'plaintext',
            }],
        ],
    },
});

const nextConfig: NextConfig = {
  /* config options here */
  // 开启reactCompiler
  reactCompiler: true,
  // 控制Turbopack 开发服务器文件系统缓存,觉得缓存错误时，删掉.next，重新编译
  experimental: {
    turbopackFileSystemCacheForDev: true
  },
  // 开启缓存
  // cacheComponents: true // 启用缓存组件
  cacheComponents: true, // 缓存组件(关闭或者不配置)
  images: {
    remotePatterns: [
      {
        protocol: 'https', // 协议
        hostname: 'eo-img.521799.xyz', // 主机名
        pathname: '/i/pc/**', // 路径
        port: '', // 端口
      },
    ],
    formats: ['image/avif', 'image/webp'], //默认是 ['image/webp']
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // 设备尺寸
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // 图片尺寸
  },
  // 配置SSG全静态站点
  // output: "export", // 导出静态站点
  // distDir: "dist", // 导出目录
  // trailingSlash: true, // 添加尾部斜杠，生成 /about/index.html 而不是 /about.html
  // 支持MDX
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

export default withMDX(nextConfig);
