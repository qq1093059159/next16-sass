"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.code === 1) {
          router.push("/home");
        }
      });
  };
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-4">
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-62.5"
        placeholder="请输入用户名"
      />
      <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-62.5"
        placeholder="请输入密码"
      />
      <Button onClick={handleLogin}>登录</Button>
    </div>
  );
}
