import { ImageResponse } from "next/og";

/**
 * app/icon.tsx —— 动态生成站点图标（约定文件）。
 *
 * 不需要在 public/ 放 png：Next 会在构建期执行这个组件，
 * 用 Satori 把 JSX 渲染成 PNG，产出 /icon.png 并自动写进 <head>。
 *
 * 三个导出：
 *  - size       图片尺寸
 *  - contentType MIME 类型
 *  - default    组件本体
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        N
      </div>
    ),
    { ...size },
  );
}
