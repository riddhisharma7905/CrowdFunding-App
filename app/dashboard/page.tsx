"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Users, DollarSign, Target, Heart, Eye, Edit2, Trash2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CampaignCard from "@/app/components/CampaignCard";

type DashboardCampaign = {
  id: string;
  title: string;
  status?: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
};

type DashboardTotals = {
  totalRaised: number;
  activeCampaigns: number;
  totalBackers: number;
};

type PledgeSeriesPoint = {
  date: string;
  amount: number;
};

type BackerSeriesPoint = {
  day: string;
  backers: number;
};

export default function DashboardPage() {
  const router = useRouter();
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<"Overview" | "My Campaigns" | "Backed Campaigns">("Overview");

  // Data States
  const [myCampaigns, setMyCampaigns] = useState<DashboardCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  const [totals, setTotals] = useState<DashboardTotals | null>(null);
  const [pledgeData, setPledgeData] = useState<PledgeSeriesPoint[]>([]);
  const [backerData, setBackerData] = useState<BackerSeriesPoint[]>([]);
  
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  
  const [deleteTarget, setDeleteTarget] = useState<DashboardCampaign | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  
  const [userFollowers, setUserFollowers] = useState<number>(0);
  const [userPledges, setUserPledges] = useState<{
    totalPledged: number;
    totalBackings: number;
    pledges: any[];
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          console.error("Failed to load dashboard stats");
          return;
        }

        const data = await res.json();
        if (!isActive) return;

        const totalsData: DashboardTotals = {
          totalRaised: data?.totals?.totalRaised || 0,
          activeCampaigns: data?.totals?.activeCampaigns || 0,
          totalBackers: data?.totals?.totalBackers || 0,
        };
        setTotals(totalsData);

        const series = Array.isArray(data?.pledgesByDay) ? data.pledgesByDay : [];

        const pledgeSeries: PledgeSeriesPoint[] = series.map((point: any) => {
          const label = new Date(point.date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          });
          return {
            date: label,
            amount: point.amount || 0,
          };
        });

        const backerSeries: BackerSeriesPoint[] = series.map((point: any) => {
          const label = new Date(point.date).toLocaleDateString("en-IN", {
            weekday: "short",
          });
          return {
            day: label,
            backers: point.backers || 0,
          };
        });

        setPledgeData(pledgeSeries);
        setBackerData(backerSeries);
      } catch (error) {
        console.error("Error loading dashboard stats", error);
      } finally {
        if (isActive) {
          setLoadingDashboard(false);
        }
      }
    };

    const loadCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns?myOnly=true", { cache: "no-store" });
        if (!res.ok) {
          console.error("Failed to load campaigns for dashboard");
          return;
        }

        const data = await res.json();
        const items: DashboardCampaign[] = (data.campaigns || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          goalAmount: c.goalAmount,
          currentAmount: c.currentAmount,
          backers: c.backers,
        }));
        if (isActive) {
          setMyCampaigns(items);
        }
      } catch (error) {
        console.error("Error loading dashboard campaigns", error);
      } finally {
        if (isActive) {
          setLoadingCampaigns(false);
        }
      }
    };

    const loadUserFollowers = async () => {
      try {
        const res = await fetch("/api/profile/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isActive && data.profile) {
            setUserFollowers(data.profile.followers || 0);
          }
        }
      } catch (error) {
        console.error("Error loading user followers", error);
      }
    };

    const loadUserPledges = async () => {
      try {
        const res = await fetch("/api/profile/pledges", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isActive) {
            setUserPledges({
              totalPledged: data?.totalPledged || 0,
              totalBackings: data?.totalBackings || 0,
              pledges: data?.pledges || [],
            });
          }
        }
      } catch (error) {
        console.error("Error loading user pledges", error);
      }
    };

    loadDashboard();
    loadCampaigns();
    loadUserFollowers();
    loadUserPledges();

    return () => {
      isActive = false;
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget || deleteConfirmText.toLowerCase() !== deleteTarget.title.toLowerCase()) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(`/api/campaigns/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData?.message || "Failed to delete campaign");
        setDeleting(false);
        return;
      }

      setMyCampaigns((prev) => prev.filter((campaign) => campaign.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Error deleting campaign", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white text-slate-900 font-sans">
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
          
          {/* HEADER AREA */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                Welcome back! Here's your campaign overview.
              </p>
            </div>

            <Link href="/create">
              <button className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition">
                + New Campaign
              </button>
            </Link>
          </section>

          {/* TAB NAVIGATION */}
          <div className="border-b border-slate-100 flex space-x-8">
            {["Overview", "My Campaigns", "Backed Campaigns"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  activeTab === tab
                    ? "border-emerald-600 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* STATS CARDS */}
              <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Total Raised",
                    value: totals === null ? "—" : `₹${totals.totalRaised.toLocaleString("en-IN")}`,
                    change: "Live total across campaigns",
                    icon: DollarSign,
                  },
                  {
                    label: "Active Campaigns",
                    value: totals === null ? "—" : String(totals.activeCampaigns || 0),
                    change: "Currently running",
                    icon: Target,
                  },
                  {
                    label: "Total Followers",
                    value: userFollowers.toLocaleString("en-IN"),
                    change: "People supporting your work",
                    icon: Users,
                  },
                  {
                    label: "Total Pledges",
                    value: userPledges === null ? "—" : `₹${userPledges.totalPledged.toLocaleString("en-IN")}`,
                    change: `You've backed ${userPledges?.totalBackings || 0} campaign${
                      userPledges?.totalBackings === 1 ? "" : "s"
                    }`,
                    icon: Heart,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between h-[160px] transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Icon size={20} />
                        </div>
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 text-right max-w-[120px] leading-tight">
                          {stat.change}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="mt-1 flex items-baseline gap-x-2">
                          <span className="text-3xl font-bold tracking-tight text-slate-900">
                            {stat.value}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* CHARTS */}
              <section className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Funding Progress</h2>
                      <p className="text-sm font-medium text-slate-400 mt-1">Last 8 weeks</p>
                    </div>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pledgeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#10B981"
                          strokeWidth={4}
                          dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#10B981" }}
                          activeDot={{ r: 6, strokeWidth: 0, fill: "#10B981" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Weekly Backers</h2>
                      <p className="text-sm font-medium text-slate-400 mt-1">This week</p>
                    </div>
                  </div>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={backerData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                          dx={-10}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: "#f8fafc" }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                          dataKey="backers" 
                          fill="#0f172a" 
                          radius={[6, 6, 0, 0]} 
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB CONTENT: MY CAMPAIGNS */}
          {activeTab === "My Campaigns" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {loadingCampaigns ? (
                <div className="py-20 text-center text-sm font-medium text-slate-400">
                  Loading your campaigns...
                </div>
              ) : myCampaigns.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-500 font-medium">You have not launched any campaigns yet.</p>
                  <Link href="/create">
                    <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
                      Start your first project
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myCampaigns.map((campaign) => {
                    const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
                    return (
                      <div
                        key={campaign.id}
                        className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col group hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-48 bg-slate-50 overflow-hidden">
                          <img src="/world.jpg" alt="Campaign cover" className="w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                          <span
                            className={`absolute right-4 top-4 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
                              campaign.status === "Completed"
                                ? "bg-white/90 text-slate-700 shadow-sm"
                                : "bg-emerald-500/90 text-white shadow-sm"
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>

                        <div className="p-6 space-y-6 flex-1 flex flex-col">
                          <h3 className="text-lg font-bold tracking-tight text-slate-900 line-clamp-2">
                            {campaign.title}
                          </h3>

                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="text-slate-400 font-medium uppercase tracking-wide">Raised</p>
                              <p className="mt-1 text-sm font-bold text-emerald-600">
                                ₹{Math.round(campaign.currentAmount / 1000)}K
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium uppercase tracking-wide">Goal</p>
                              <p className="mt-1 text-sm font-bold text-slate-900">
                                ₹{Math.round(campaign.goalAmount / 1000)}K
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium uppercase tracking-wide">Backers</p>
                              <p className="mt-1 text-sm font-bold text-slate-900">
                                {(campaign.backers / 1000).toFixed(1)}K
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                              <span>Funding Progress</span>
                              <span className="text-slate-900">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="pt-2 flex gap-3">
                            <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                              <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition">
                                <Eye size={16} /> Look
                              </button>
                            </Link>
                            <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className="flex-1">
                              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition">
                                <Edit2 size={16} /> Edit
                              </button>
                            </Link>
                            <button
                              onClick={() => {
                                setDeleteTarget(campaign);
                                setDeleteConfirmText("");
                              }}
                              className="px-4 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
                              title="Delete Campaign"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: BACKED CAMPAIGNS */}
          {activeTab === "Backed Campaigns" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {userPledges === null ? (
                <div className="py-20 text-center text-sm font-medium text-slate-400">
                  Loading backed campaigns...
                </div>
              ) : userPledges.pledges.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-slate-500 font-medium">You haven't backed any campaigns yet.</p>
                  <Link href="/explore">
                    <button className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
                      Explore Projects
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userPledges.pledges.map((pledge) => {
                    const c = pledge.campaign;
                    if (!c) return null; // Defensive check
                    
                    // Reconstruct into format CampaignCard expects
                    const formattedCampaign = {
                      id: c._id || pledge.campaignId,
                      title: c.title,
                      shortDescription: c.shortDescription,
                      category: c.category,
                      imageUrl: c.imageUrl,
                      goalAmount: c.goalAmount,
                      currentAmount: c.currentAmount,
                      backers: c.backers,
                      deadline: c.deadline,
                      status: c.status
                    };

                    return (
                      <div key={pledge.id} className="relative group">
                        <CampaignCard campaign={formattedCampaign} />
                        
                        {/* Overlay showing how much they pledged */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm rounded-xl px-4 py-2 text-sm font-bold text-slate-900 border border-slate-100 flex items-center gap-1.5 z-10 transition-transform group-hover:scale-105">
                          <Heart size={14} className="text-emerald-500 fill-emerald-500" />
                          ₹{(pledge.amount || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Delete Campaign</h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                This action cannot be undone. This will permanently delete 
                <span className="font-bold text-slate-900"> {deleteTarget.title}</span> and all of its data.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                To confirm, type the campaign name
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                placeholder={deleteTarget.title}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteConfirmText.toLowerCase() !== deleteTarget.title.toLowerCase() || deleting
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-red-300 hover:bg-red-700 transition"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
