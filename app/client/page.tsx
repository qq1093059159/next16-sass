"use client";
import { useEffect, useState } from "react";
console.log("client");
export default function ClientPage() {
  const [count, setCount] = useState(0);
  console.log("client X");
  useEffect(() => {
    console.log(document, window);
  }, []);
  return (
    <div>
      <h1>Server Page</h1>
      <button onClick={() => setCount(count + 1)}>点击</button>
      <p>{count}</p>
    </div>
  );
}
