import { Inter, Roboto_Mono } from "next/font/google";

/**
 * next/font —— 构建期内置的字体优化。
 *
 * 解决三个问题：
 *  1. 布局偏移（FOUT/CLS）：字体在构建期被 self-host 并计算好尺寸，
 *     浏览器一开页面就知道每个字有多宽，不会出现文字突然跳动。
 *  2. 外部请求：字体文件不打到你自己的服务器，而是由平台 CDN 分发。
 *  3. 隐私：不会把访客的 IP 泄露给 Google Fonts。
 *
 * ⚠️ next/font/google 会在【构建期】去 Google 下载字体并缓存到 .next/cache，
 *    所以首次构建需要网络，之后可以离线构建。
 */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function FontPage() {
  return (
    <div className={`mx-auto max-w-2xl p-6 ${inter.className}`}>
      <h1>字体优化 · next/font</h1>
      <p className="mt-2 text-sm opacity-70">
        这一段用的是 Inter（variable）。字体文件在构建期被下载、自托管、算好尺寸。
      </p>
      <p className={`mt-4 text-sm ${mono.className}`}>
        这一段用的是 Roboto Mono（指定了 400 / 700 两档字重）。
      </p>

      <div className="mt-8 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700">
        <h2 className="font-semibold">两种接入方式</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>next/font/google</b>：直接用 Google 字体名，构建期下载并自托管。
          </li>
          <li>
            <b>next/font/local</b>：用自己项目里的字体文件，通过{" "}
            <code>src: &quot;./fonts/xxx.woff2&quot;</code> 引入。
          </li>
          <li>
            变量名：<code>variable: &quot;--font-inter&quot;</code> 可以把字体挂到 CSS 变量上，
            再配合 Tailwind v4 的 <code>@theme</code> 使用。
          </li>
        </ul>
      </div>
    </div>
  );
}
