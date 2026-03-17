"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, Users } from "lucide-react";

interface Profile {
  id: string;
  fullName: string;
  bio: string;
  location: string;
  occupation: string;
  followers: number;
  createdAt?: string;
}

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  status?: string;
}

interface Stats {
  totalFunded: number;
  campaignsCreated: number;
  followers: number;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function CreatorProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/profile/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.profile.id);
        }
      } catch (err) {
        console.error("Error fetching current user", err);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load profile");
          return;
        }

        if (!active) return;

        const p = data.profile as any;
        setProfile({
          id: p.id,
          fullName: p.fullName,
          bio: p.bio || "",
          location: p.location || "",
          occupation: p.occupation || "",
          followers: p.followers || 0,
          createdAt: p.createdAt,
        });
        setCampaigns((data.campaigns || []) as Campaign[]);
        setStats(data.stats || null);

        // Check if current user is following
        if (currentUserId && String(currentUserId) !== String(p.id)) {
          // Check if current user is in the followers array
          setIsFollowing(data.isFollowing || false);
        }
      } catch (err) {
        console.error("Error loading profile", err);
        setError("Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, currentUserId]);

  const handleFollowToggle = async () => {
    if (!profile || !id) return;

    setFollowLoading(true);
    try {
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(`/api/followers/${id}`, {
        method,
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(!isFollowing);
        setProfile((prev) =>
          prev ? { ...prev, followers: data.followers } : null,
        );
        setStats((prev) =>
          prev ? { ...prev, followers: data.followers } : null,
        );
      } else {
        const errorData = await res.json();
        console.error("Error toggling follow:", errorData);
      }
    } catch (err) {
      console.error("Error toggling follow", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (!id) return null;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">Loading creator profile...</div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href="/explore"
            className="text-sm text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            ← Back to explore
          </Link>
          <h1 className="text-2xl font-semibold">Creator not found</h1>
          <p className="text-sm text-slate-600">
            {error || "This profile could not be loaded."}
          </p>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUserId === profile.id;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {/* Header Section */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-100 to-teal-50 px-8 py-10">
          <div className="flex flex-col gap-8">
            {/* Profile Info */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600 text-4xl font-bold text-white shadow-lg">
                  {getInitials(profile.fullName)}
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {profile.fullName}
                  </h1>
                  {profile.location && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  {profile.createdAt && (
                    <p className="text-xs text-slate-500">
                      Joined {formatDate(profile.createdAt)}
                    </p>
                  )}
                </div>
              </div>

              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                    isFollowing
                      ? "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  } disabled:opacity-50`}
                >
                  {followLoading
                    ? "Loading..."
                    : isFollowing
                      ? "Following"
                      : "Follow"}
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Campaigns
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {stats?.campaignsCreated || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Followers
                  </p>
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {stats?.followers || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Funded
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600">
                  {formatCurrency(stats?.totalFunded || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: About */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                About
              </h2>
              {profile.bio ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  This creator hasn't added a bio yet.
                </p>
              )}
            </div>

            {/* Active Campaigns */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Active Campaigns
              </h2>
              {campaigns.length === 0 ? (
                <p className="text-sm text-slate-500">
                  This creator hasn&apos;t launched any campaigns yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {campaigns.map((c) => {
                    const progress = Math.min(
                      (c.currentAmount / c.goalAmount) * 100,
                      100,
                    );
                    return (
                      <Link
                        key={c.id}
                        href={`/campaigns/${c.id}`}
                        className="group rounded-xl border border-slate-200 bg-slate-50 overflow-hidden hover:border-emerald-300 transition-colors"
                      >
                        <div className="aspect-video bg-slate-200 relative">
                          {c.imageUrl && (
                            <img
                              src={c.imageUrl}
                              alt={c.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {c.title}
                            </h3>
                            <p className="line-clamp-2 text-xs text-slate-600 mt-1">
                              {c.shortDescription}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>
                                {formatCurrency(c.currentAmount)} raised
                              </span>
                              <span className="font-semibold text-slate-900">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-6">
            {profile.occupation && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Occupation
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {profile.occupation}
                </p>
              </div>
            )}

            {currentUserId && !isOwnProfile && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs text-slate-500 text-center">
                  Found a great campaign?
                </p>
                <Link
                  href="/explore"
                  className="mt-3 flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <Heart size={16} />
                  Back a Campaign
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
