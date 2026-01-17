import Image from "next/image";
import profile from "@/public/profile.png";
const len = 2;
export default function MyImage() {
  return (
    <div>
      <h1>Home</h1>
      <Image src="/profile.png" width={100} height={100} alt="1" />
      {/* 使用静态import引入图片，你会发现无需填写宽度和高度，Next.js会自动确定图片的尺寸 */}
      <Image src={profile} alt="1" />
      {/* 远程引入图片 */}
      {Array.from({ length: len }).map((_, index) => (
        <Image
          key={index}
          src={`https://eo-img.521799.xyz/i/pc/img${index + 1}.webp`}
          alt="1"
          width={192}
          height={108}
        />
      ))}
    </div>
  );
}
// 头像 - 固定 64px
export function Avatar() {
  return (
    <Image
      src="/avatar.jpg"
      width={64}
      height={64}
      alt="用户头像"
      sizes="64px" // ← 告诉浏览器这张图只需要 64px
    />
  );
}

// 横幅图 - 响应式全宽
export function Banner() {
  return (
    <Image
      src="/banner.jpg"
      width={1920}
      height={600}
      alt="横幅"
      sizes="100vw" // ← 占满整个视口宽度，使用 deviceSizes
    />
  );
}

// 响应式内容图
export function ContentImage() {
  return (
    <Image
      src="/content.jpg"
      width={1200}
      height={800}
      alt="内容图"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
      // ↑ 手机上 100% 宽度，平板上 50%，桌面最大 1200px
    />
  );
}
