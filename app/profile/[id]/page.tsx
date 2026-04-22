"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, Users, Calendar, Info, Target, Mail, MapPin, Briefcase } from "lucide-react";

interface Profile {
  id: string;
  fullName: string;
  bio: string;
  city: string;
  country: string;
  pincode: string;
  occupation: string;
  followers: number;
  profilePicture?: string;
  createdAt?: string;
  email?: string;
}

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  status?: string;
  backers?: number;
  category?: string;
}

interface Stats {
  totalFunded: number;
  campaignsCreated: number;
  followers: number;
  following: number;
  backers: number;
  campaignsSupported: number;
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

function getInitials(fullName: string | undefined): string {
  if (!fullName) return "";
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
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns">("overview");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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
        const res = await fetch(`/api/profile/${encodeURIComponent(id)}?t=${Date.now()}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load profile");
          return;
        }

        if (!active) return;

        const p = data.profile;
        setProfile({
          id: p.id,
          fullName: p.fullName || "Unknown",
          bio: p.bio || "",
          city: p.city || "",
          country: p.country || "",
          pincode: p.pincode || "",
          profilePicture: p.profilePicture || "",
          occupation: p.occupation || "",
          followers: p.followers || 0,
          createdAt: p.createdAt,
          email: p.email,
        });
        setCampaigns((data.campaigns || []) as Campaign[]);
        setStats(data.stats || null);

        // Check if current user is following
        if (currentUserId && String(currentUserId) !== String(p.id)) {
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
        // Refresh local follower count
        setStats((prev) => 
          prev ? { ...prev, followers: data.followers } : null
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
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          <p className="text-slate-500 font-medium">Loading creator profile...</p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href="/explore"
            className="text-sm font-medium text-slate-500 underline-offset-4 hover:text-emerald-600 hover:underline"
          >
            ← Back to explore
          </Link>
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900">Creator not found</h1>
            <p className="mt-2 text-slate-500">
              {error || "This profile could not be loaded."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUserId === profile.id;
  const joinDateFormatted = profile.createdAt ? formatDate(profile.createdAt) : "";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Banner */}
      <div className="h-48 w-full bg-gradient-to-r from-emerald-600 to-teal-500 opacity-80" />

      <main className="mx-auto -mt-24 max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Sidebar: Profile Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-6">
            <div className="rounded-[40px] bg-white p-8 shadow-xl shadow-slate-200 border border-slate-100/50 text-center relative overflow-hidden">
               {/* Decorative dots like mockup */}
               <div className="absolute top-8 left-8 h-2 w-2 rounded-full bg-blue-400 opacity-50" />
               <div className="absolute top-12 right-12 h-2 w-2 rounded-full bg-yellow-400 opacity-50" />
               <div className="absolute bottom-24 left-12 h-2 w-2 rounded-full bg-emerald-400 opacity-50" />

              {/* Avatar Area */}
              <div 
                className={`mx-auto relative h-32 w-32 ${profile.profilePicture ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
                onClick={() => {
                  if (profile.profilePicture) setIsImageModalOpen(true);
                }}
              >
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt={profile.fullName} 
                    className="h-full w-full rounded-full object-cover border-4 border-white shadow-inner"
                  />
                ) : (
                  <div className="h-full w-full rounded-full border-4 border-white bg-teal-600 flex items-center justify-center text-4xl font-black text-white shadow-inner">
                    {getInitials(profile.fullName)}
                  </div>
                )}
              </div>

              {/* Name & Title */}
              <div className="mt-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  {profile.fullName}
                </h1>
                {profile.occupation && (
                  <p className="mt-1 text-sm font-bold text-emerald-600 uppercase tracking-widest">{profile.occupation}</p>
                )}
                {(profile.city || profile.country) && (
                  <p className="mt-2 text-xs font-bold text-slate-400 flex items-center justify-center gap-1 uppercase tracking-tight">
                    <MapPin size={12} className="text-slate-400" />
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={handleFollowToggle}
                        disabled={followLoading || isOwnProfile}
                        className={`w-full h-12 rounded-full px-6 text-sm font-black uppercase tracking-widest transition-all shadow-md active:scale-95 ${
                            isFollowing
                            ? "bg-slate-100 text-slate-600 border border-slate-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                        } disabled:opacity-50`}
                    >
                        {followLoading ? "Processing..." : isFollowing ? "Following" : "Follow"}
                    </button>
              </div>

              {/* Key Stats Bar Directly Below Buttons */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-6">
                <div className="flex flex-col items-center flex-1 border-r border-slate-50">
                    <span className="text-lg font-black text-slate-900">{stats?.backers || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Donors</span>
                </div>
                <div className="flex flex-col items-center flex-1 border-r border-slate-50">
                    <span className="text-lg font-black text-slate-900">{stats?.followers || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Followers</span>
                </div>
                <div className="flex flex-col items-center flex-1">
                    <span className="text-lg font-black text-slate-900">{stats?.following || 0}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Following</span>
                </div>
              </div>

              {/* Creator Profile Summary */}
              <div className="mt-8 pt-8 border-t border-slate-50 text-left">
                 <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 mb-1">
                        Total Funds Raised
                    </p>
                    <p className="text-2xl font-black text-emerald-900">
                        {formatCurrency(stats?.totalFunded || 0)}
                    </p>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                    activeTab === "overview" ? "text-emerald-600" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                    Overview
                    {activeTab === "overview" && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
                    )}
                </button>
                <button 
                  onClick={() => setActiveTab("campaigns")}
                  className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${
                    activeTab === "campaigns" ? "text-emerald-600" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                    Campaigns
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-600">
                        {campaigns.length}
                    </span>
                    {activeTab === "campaigns" && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
                    )}
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === "overview" && (
                        <>
                            {/* About Me Section */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-slate-900">About Me</h2>
                                <div className="rounded-3xl bg-transparent p-1">
                                    {profile.bio ? (
                                        <p className="text-slate-600 leading-relaxed font-medium">
                                            {profile.bio}
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 italic">No description provided.</p>
                                    )}
                                </div>
                            </section>

                            {/* Journey Section */}
                            <section className="space-y-4">
                                <h2 className="text-xl font-black text-slate-900">Journey</h2>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    Joined Backlit on {joinDateFormatted}. Committed to making an impact and sharing successful campaigns with the world.
                                </p>
                            </section>
                        </>
                    )}

                    {activeTab === "campaigns" && (
                        <div className="space-y-4">
                             <h2 className="text-xl font-black text-slate-900">My Campaigns</h2>
                             {campaigns.length === 0 ? (
                                <div className="rounded-3xl bg-white p-12 text-center border border-slate-100">
                                    <p className="text-slate-400 italic font-medium">No campaigns launched yet.</p>
                                </div>
                             ) : (
                                <div className="grid gap-4">
                                    {campaigns.map((c) => {
                                        const progress = Math.min((c.currentAmount / c.goalAmount) * 100, 100);
                                        return (
                                            <Link
                                                key={c.id}
                                                href={`/campaigns/${c.id}`}
                                                className="group flex flex-col sm:flex-row gap-4 rounded-3xl border border-slate-100 bg-white p-4 hover:border-emerald-200 hover:shadow-lg transition-all"
                                            >
                                                <div className="h-32 w-full sm:w-48 overflow-hidden rounded-2xl shrink-0 bg-slate-100">
                                                    <img 
                                                        src={!c.imageUrl || c.imageUrl === "/hero.jpg" ? "/world.jpg" : c.imageUrl} 
                                                        alt={c.title} 
                                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                        onError={(e) => { e.currentTarget.src = "/world.jpg"; }}
                                                    />
                                                </div>
                                                <div className="flex flex-1 flex-col justify-between py-1">
                                                    <div>
                                                        <h3 className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                                                            {c.title}
                                                        </h3>
                                                        <p className="mt-1 line-clamp-2 text-xs font-medium text-slate-500">
                                                            {c.shortDescription}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-1.5 mt-3">
                                                       <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                            <span>{formatCurrency(c.currentAmount)} / {formatCurrency(c.goalAmount)}</span>
                                                            <span>{Math.round(progress)}%</span>
                                                        </div>
                                                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                                                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                             )}
                        </div>
                    )}
                </div>

                {/* Sidebar Stats Column (Right side) */}
                <aside className="lg:col-span-1 space-y-6">
                    {/* Community Card */}
                    <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Community</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                    Joined by {stats?.backers || 0} amazing supporters from around the globe.
                                </p>
                            </div>
                            <div className="flex gap-3 border-t border-slate-50 pt-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                    Donations Made: <span className="font-black text-slate-900">{stats?.campaignsSupported || 0}</span> campaigns supported.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Raised For Card */}
                    <div className="rounded-[32px] bg-white p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Raised For</h3>
                        
                        {campaigns.length === 0 ? (
                            <p className="text-xs text-slate-400 italic font-medium">No campaign descriptions yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {campaigns.map((c, i) => (
                                    <div key={c.id} className="flex gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                            {c.shortDescription}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {isImageModalOpen && profile?.profilePicture && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-h-full max-w-full group">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-emerald-400 transition-colors p-2"
              onClick={() => setIsImageModalOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <img 
              src={profile.profilePicture} 
              alt={profile.fullName} 
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
