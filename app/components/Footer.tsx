"use client";

import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="w-full px-6 py-12">
        <div className="mx-auto max-w-7xl flex flex-col">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="mb-4 flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="BackIt Logo"
                  width={40}
                  height={40}
                  priority
                />
                <span className="text-xl font-bold text-black">BackIt</span>
              </Link>

              <p className="max-w-sm text-sm leading-relaxed text-gray-600">
                Where bold ideas meet passionate backers. Launch your project
                and bring your vision to life with community support.
              </p>
            </div>

            {/* Discover */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-black">
                Discover
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>
                  <Link href="/explore" className="hover:text-black">
                    Explore Campaigns
                  </Link>
                </li>
                <li>
                  <Link href="/create" className="hover:text-black">
                    Start a Campaign
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Started */}
            <div>
              <h4 className="mb-4 text-sm font-semibold text-black">
                Your Account
              </h4>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li>
                  <Link href="/dashboard" className="hover:text-black">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile/edit" className="hover:text-black">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 border-t pt-6 text-center">
            <p className="text-sm text-gray-500">
              © 2026 BackIt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
