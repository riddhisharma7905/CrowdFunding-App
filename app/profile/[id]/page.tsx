"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Heart, UserPlus, FileText, ChevronRight } from "lucide-react";

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
  totalBackers?: number;
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
  
  // UI States
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns">("overview");

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
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500">
        Loading creator profile...
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-6 py-10 flex flex-col items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-800">Creator not found</h1>
          <p className="text-slate-500">{error || "This profile could not be loaded."}</p>
          <Link href="/explore" className="inline-block mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700 underline-offset-4 hover:underline">
            Back to explore
          </Link>
        </div>
      </main>
    );
  }

  const isOwnProfile = currentUserId === profile.id;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* Cover Image */}
      <div className="w-full h-64 md:h-80 bg-slate-900 relative">
        {/* Placeholder cover - abstract gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900">
           <img src="/hero.jpg" alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative -mt-20 md:-mt-32">
          
          {/* LEFT SIDEBAR (Floating Profile Card) */}
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center">
              
              {/* Avatar */}
              <div className="w-32 h-32 bg-teal-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg shadow-teal-600/20 mb-5 relative border-4 border-white">
                {getInitials(profile.fullName)}
                {/* Decorative dots similar to mentoree */}
                <span className="absolute -top-2 -right-4 w-2 h-2 bg-amber-400 rounded-full"></span>
                <span className="absolute top-10 -left-6 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <span className="absolute bottom-4 -right-2 w-2 h-2 bg-emerald-400 rounded-full"></span>
              </div>

              {/* Name & Title */}
              <div className="flex flex-col items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                {profile.occupation && (
                  <p className="text-sm font-medium text-slate-500 mt-1">{profile.occupation}</p>
                )}
                {profile.location && (
                  <p className="text-xs text-slate-400 mt-1.5">{profile.location}</p>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex items-center gap-3 w-full mb-8">
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className="w-12 h-12 rounded-full border border-teal-100 text-teal-600 flex items-center justify-center hover:bg-teal-50 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    <UserPlus size={20} />
                  </button>
                  <button 
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex-1 h-12 rounded-full text-sm font-bold tracking-wide uppercase transition-all shadow-md ${
                      isFollowing 
                        ? "bg-slate-100 text-slate-600 shadow-none hover:bg-slate-200"
                        : "bg-teal-500 text-white shadow-teal-500/25 hover:bg-teal-600"
                    }`}
                  >
                    {isFollowing ? "Following" : `Follow ${profile.fullName.split(' ')[0]}`}
                  </button>
                </div>
              )}
              {isOwnProfile && (
                <div className="w-full mb-8">
                  <Link href="/profile/edit">
                    <button className="w-full h-12 rounded-full bg-slate-100 text-slate-600 font-bold text-sm tracking-wide uppercase hover:bg-slate-200 transition-colors">
                      Edit Profile
                    </button>
                  </Link>
                </div>
              )}

              {/* Stats / Experise Section */}
              <div className="w-full pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-left">Creator Profile</h3>
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <p className="text-2xl font-bold text-slate-800 mb-1">{stats?.followers || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                    <p className="text-2xl font-bold text-slate-800 mb-1">{stats?.campaignsCreated || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaigns</p>
                  </div>
                  <div className="col-span-2 bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100/50">
                    <p className="text-2xl font-bold text-emerald-600 mb-1">{formatCurrency(stats?.totalFunded || 0)}</p>
                    <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-widest">Total Raised</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 mt-8 lg:mt-48">
            
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                  activeTab === "overview" 
                    ? "text-teal-600 border-b-2 border-teal-500" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab("campaigns")}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "campaigns" 
                    ? "text-teal-600 border-b-2 border-teal-500" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Campaigns
                <span className="bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-[10px]">{campaigns.length}</span>
              </button>
            </div>

            {/* Tab Panels */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-3 gap-8">
                {/* Left primary descriptions */}
                <div className="md:col-span-2 space-y-10">
                  <section>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">About Me</h2>
                    {profile.bio ? (
                      <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No description provided.</p>
                    )}
                  </section>
                  
                  {profile.createdAt && (
                    <section>
                      <h2 className="text-lg font-bold text-slate-800 mb-4">Journey</h2>
                      <p className="text-slate-600 leading-relaxed text-[15px]">
                        Joined BackIt on {formatDate(profile.createdAt)}. Committed to making an impact and sharing successful campaigns with the world.
                      </p>
                    </section>
                  )}
                </div>

                {/* Right smaller blocks */}
                <div className="md:col-span-1 space-y-6">
                   <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                       Community <span className="text-emerald-600 text-xs font-black bg-emerald-50 px-2 py-1 rounded-md">{stats?.totalBackers || 0}</span>
                     </h3>
                     <div className="space-y-4">
                        {stats && stats.totalBackers !== undefined && stats.totalBackers > 0 ? (
                           <p className="text-sm leading-relaxed text-slate-600"><strong className="text-slate-800">{stats.totalBackers} donors</strong> have generously supported this creator's campaigns.</p>
                        ) : (
                           <p className="text-sm text-slate-400">Be the first to donate and support.</p>
                        )}
                     </div>
                   </div>

                   {/* Motivation / Extra section */}
                   <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-800 mb-4 text-emerald-900">Raised For</h3>
                     {campaigns.length > 0 ? (
                       <ul className="space-y-3">
                         {campaigns.slice(0, 3).map((c) => (
                           <li key={c.id} className="text-sm text-slate-600 flex items-start gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                             <span className="line-clamp-2">{c.title} - <span className="text-slate-400">{c.shortDescription}</span></span>
                           </li>
                         ))}
                         {campaigns.length > 3 && (
                           <li className="text-xs text-slate-400 font-semibold pt-2">
                             + {campaigns.length - 3} more campaigns
                           </li>
                         )}
                       </ul>
                     ) : (
                       <p className="text-sm text-slate-400 italic">No campaigns launched yet.</p>
                     )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === "campaigns" && (
              <div className="space-y-6">
                {campaigns.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
                    <FileText className="text-slate-300 w-16 h-16 mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 mb-2">No Active Campaigns</h3>
                    <p className="text-slate-500 text-sm max-w-sm">This creator hasn't launched any campaigns yet. Check back later.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {campaigns.map((c) => {
                      const progress = Math.min((c.currentAmount / c.goalAmount) * 100, 100);
                      return (
                        <Link
                          key={c.id}
                          href={`/campaigns/${c.id}`}
                          className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                        >
                          <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                            {c.imageUrl || "/world.jpg" ? (
                              <img src={c.imageUrl || "/world.jpg"} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : null}
                          </div>
                          
                          <div className="p-6">
                            <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">{c.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed">{c.shortDescription}</p>
                            
                            <div className="space-y-2">
                              {/* PROGRESS BAR */}
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center text-xs font-semibold pt-1">
                                <span className="text-teal-600">{formatCurrency(c.currentAmount)} raised</span>
                                <span className="text-slate-400">{Math.round(progress)}%</span>
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
        </div>
      </div>
    </main>
  );
}
