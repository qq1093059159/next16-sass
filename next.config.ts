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
  cacheComponents: true
};

export default nextConfig;
