import { ModeToggle } from "@/components/DarkMode";
import React from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <h2 className="flex justify-between items-center">
        <div>Root layout</div>
        <div>
          <ModeToggle />
        </div>
      </h2>
      {children}
    </div>
  );
}
