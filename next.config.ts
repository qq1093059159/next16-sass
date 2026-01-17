import type { NextConfig } from "next";

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
};

export default nextConfig;
