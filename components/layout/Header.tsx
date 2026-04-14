"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, Wallet } from "lucide-react";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<{
    fullName: string;
    email: string;
    initials: string;
    profilePicture?: string;
  } | null>(null);
  const router = useRouter();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    // Derive auth state from server instead of localStorage
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsAuthenticated(true);
            // Get full user profile for display
            const profileRes = await fetch("/api/profile/me", {
              cache: "no-store",
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setUserData({
                fullName: profileData.profile.fullName,
                email: profileData.profile.email || "",
                initials: getInitials(profileData.profile.fullName),
                profilePicture: profileData.profile.profilePicture || "",
              });
            }
          } else {
            setIsAuthenticated(false);
            // Clean up stale localStorage
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("backit_authed");
              window.localStorage.removeItem("backit_fullName");
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (typeof window !== "undefined") {
        window.localStorage.removeItem("backit_authed");
        window.localStorage.removeItem("backit_fullName");
      }

      setIsAuthenticated(false);
      setUserData(null);
      setProfileMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

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

        <div className="ml-auto flex items-center gap-2 relative">
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

          {!checkingAuth && !isAuthenticated && (
            <Link href="/signin">
              <button className="rounded-full px-3 py-1 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 transition-colors">
                Sign In
              </button>
            </Link>
          )}

          {!checkingAuth && isAuthenticated && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={userData.fullName}
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-semibold">
                    {userData?.initials || "U"}
                  </div>
                )}
                {userData && (
                  <span className="text-sm font-medium text-gray-700 mr-1">
                    {userData.fullName.split(" ")[0]}
                  </span>
                )}
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg border border-gray-200 py-2 z-30">
                  {userData && (
                    <>
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                        {userData.profilePicture ? (
                          <img
                            src={userData.profilePicture}
                            alt={userData.fullName}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                            {userData.initials}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userData.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userData.email}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/profile/edit");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/wallet");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    <Wallet size={18} />
                    <span>Wallet</span>
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
