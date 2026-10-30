import Link from "next/link";
import React from "react";
import Image from "next/image";
import ThemeToggle from "@/components/theme/ThemeToggle";
const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-lignt-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image src="/globe.svg" width={23} height={23} alt="logo"></Image>
        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Flow</span>
        </p>
      </Link>
      <Link
        href="/search"
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        搜索
      </Link>
      <div className="flex-between gap-5">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
