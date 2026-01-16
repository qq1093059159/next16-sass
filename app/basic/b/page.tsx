import Link from "next/link";
export default function BPage() {
  return (
    <div>
      <h1>B Page</h1>
      <Link href="/basic/a">跳转A</Link>
    </div>
  );
}
