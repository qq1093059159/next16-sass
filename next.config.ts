import type { NextConfig } from "next";
// import createMDX from '@next/mdx'
// const withMDX = createMDX({
//     //extension: /\.(md|mdx)$/ 默认只支持mdx文件,如果想额外支持md文件编写次行代码。
// });
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
  cacheComponents: false, // 缓存组件(关闭或者不配置)
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
  // pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

export default nextConfig;
