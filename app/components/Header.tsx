"use client";

import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur">
      <div className="flex h-16 w-full items-center px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="BackIt Logo"
            width={40}
            height={40}
            priority
          />
          <span className="text-2xl font-extrabold text-black tracking-tight">
            BackIt
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/explore">
            <button className="rounded-full px-3 py-1 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors">
              Explore
            </button>
          </Link>

          <Link href="/dashboard">
            <button className="rounded-full px-3 py-1 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors">
              Dashboard
            </button>
          </Link>

          <Link href="/signin">
            <button className="rounded-full px-3 py-1 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors">
              Sign In
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
