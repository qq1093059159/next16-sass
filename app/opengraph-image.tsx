import { ImageResponse } from "next/og";

/**
 * app/opengraph-image.tsx —— 动态生成社交分享卡片。
 *
 * 产出 /opengraph-image，被 Twitter / Facebook / 微信等抓取。
 * 同样在构建期执行，运行时零成本。
 */
export const alt = "next16-sass · Next.js 16 全栈实验室";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #0f1117 0%, #212734 100%)",
          color: "#ffffff",
          fontSize: 72,
          fontWeight: 800,
        }}
      >
        <div>next16-sass</div>
        <div style={{ fontSize: 36, fontWeight: 400, opacity: 0.8, marginTop: 16 }}>
          Next.js 16 全栈实验室 · App Router 知识点地图
        </div>
      </div>
    ),
    { ...size },
  );
}
