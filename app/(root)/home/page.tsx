"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
const checkLogin = async () => {
  const res = await fetch("/api/login");
  const data = await res.json();
  if (data.code === 1) {
    return true;
  } else {
    redirect("/");
  }
};
export default function HomePage() {
  useEffect(() => {
    checkLogin();
  }, []);
  return <div className="pt-30">你已经登录进入home页面</div>;
}
