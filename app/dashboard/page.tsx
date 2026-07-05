"use client";

import { useEffect, useMemo, useState } from "react";
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

import {
  Users,
  DollarSign,
  Target,
  Heart,
  Eye,
  Edit2,
  Trash2,
  PieChart,
  Layout,
  Gift,
  Plus,
  BarChart3,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import CampaignCard from "@/components/campaign/CampaignCard";
import FollowersModal from "@/components/ui/FollowersModal";

type DashboardCampaign = {
  id: string;
  slug: string;
  title: string;
  status?: string;
  deadline?: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  imageUrl?: string;
  category?: string;
  shortDescription?: string;
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

type RecentBackerRow = {
  id: string;
  backerName: string;
  amount: number;
  campaignTitle: string;
  createdAt: string | null;
};

function formatTimeAgo(isoString: string | null): string {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [myCampaigns, setMyCampaigns] = useState<DashboardCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [totals, setTotals] = useState<DashboardTotals | null>(null);
  const [pledgeData, setPledgeData] = useState<PledgeSeriesPoint[]>([]);
  const [backerData, setBackerData] = useState<BackerSeriesPoint[]>([]);
  const [recentBackers, setRecentBackers] = useState<RecentBackerRow[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DashboardCampaign | null>(
    null,
  );
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [userFollowers, setUserFollowers] = useState<number>(0);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [userPledges, setUserPledges] = useState<{
    totalPledged: number;
    totalBackings: number;
    pledges: any[];
  } | null>(null);
  const [campaignFilter, setCampaignFilter] = useState<"all" | "active" | "ended" | "submitted" | "changes required" | "rejected">("all");

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          if (res.status !== 401) console.error("Failed to load dashboard stats");
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

        const series = Array.isArray(data?.pledgesByDay)
          ? data.pledgesByDay
          : [];

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

        const recent = Array.isArray(data?.recentBackers)
          ? data.recentBackers
          : [];

        setRecentBackers(
          recent.map((b: any) => ({
            id: b.id,
            backerName: b.backerName,
            amount: b.amount,
            campaignTitle: b.campaignTitle,
            createdAt: b.createdAt,
          })),
        );
      } catch (error) {
        console.error("Error loading dashboard stats", error);
      } finally {
        if (isActive) {
          setLoadingDashboard(false);
        }
      }
    };

    loadDashboard();

    const loadCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns?myOnly=true", {
          cache: "no-store",
        });
        if (!res.ok) {
          if (res.status !== 401) console.error("Failed to load campaigns for dashboard");
          setLoadingCampaigns(false);
          return;
        }

        const data = await res.json();
        const items: DashboardCampaign[] = (data.campaigns || []).map(
          (c: any) => ({
            id: c.id,
            slug: c.slug,
            title: c.title,
            status: c.status,
            deadline: c.deadline,
            goalAmount: c.goalAmount,
            currentAmount: c.currentAmount,
            backers: c.backers,
            imageUrl: c.imageUrl,
            category: c.category,
            shortDescription: c.shortDescription,
          }),
        );
        setMyCampaigns(items);
      } catch (error) {
        console.error("Error loading dashboard campaigns", error);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    loadCampaigns();

    const loadUserFollowers = async () => {
      try {
        const res = await fetch("/api/profile/me", {
          cache: "no-store",
        });
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
        const res = await fetch("/api/profile/pledges", {
          cache: "no-store",
        });
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

    loadUserFollowers();
    loadUserPledges();
    return () => {
      isActive = false;
    };
  }, []);

  const groupedBackedCampaigns = useMemo(() => {
    if (!userPledges?.pledges) return [];

    const groups: Record<
      string,
      {
        campaign: any;
        totalAmount: number;
        count: number;
        lastPledgedAt: string;
      }
    > = {};

    userPledges.pledges.forEach((p) => {
      const cid = p.campaignId || p.campaign?.id || p.campaign?._id;
      if (!cid) return;

      if (!groups[cid]) {
        groups[cid] = {
          campaign: p.campaign,
          totalAmount: 0,
          count: 0,
          lastPledgedAt: p.createdAt,
        };
      }

      groups[cid].totalAmount += p.amount;
      groups[cid].count += 1;
      if (new Date(p.createdAt) > new Date(groups[cid].lastPledgedAt)) {
        groups[cid].lastPledgedAt = p.createdAt;
      }
    });

    return Object.values(groups).sort(
      (a, b) =>
        new Date(b.lastPledgedAt).getTime() -
        new Date(a.lastPledgedAt).getTime(),
    );
  }, [userPledges]);

  const handleDelete = async () => {
    if (
      !deleteTarget ||
      deleteConfirmText.toLowerCase() !== deleteTarget.title.toLowerCase()
    ) {
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(
        `/api/campaigns/${encodeURIComponent(deleteTarget.slug)}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        try {
          const errorData = await res.json();
          console.error(
            "Failed to delete campaign",
            res.status,
            errorData?.message,
          );
          alert(errorData?.message || "Failed to delete campaign");
        } catch (_e) {
          console.error("Failed to delete campaign", res.status);
          alert("Failed to delete campaign");
        }
        setDeleting(false);
        return;
      }

      setMyCampaigns((prev) =>
        prev.filter((campaign) => campaign.id !== deleteTarget.id),
      );
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
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-8">
          <section className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back! Here's your campaign overview.
              </p>
            </div>

            <Link href="/create">
              <button className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-all hover:shadow-emerald-100">
                <Plus size={18} className="mr-1.5" />
                Launch Campaign
              </button>
            </Link>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 border-b border-slate-200 pb-8">
            {[
              {
                label: "Total Raised",
                value:
                  totals === null
                    ? "—"
                    : `₹${totals.totalRaised.toLocaleString("en-IN")}`,
                change: "Live total across campaigns",
                icon: DollarSign,
                color: "emerald",
              },
              {
                label: "Active Campaigns",
                value:
                  totals === null ? "—" : String(totals.activeCampaigns || 0),
                change: "Currently running",
                icon: Target,
                color: "blue",
              },
              {
                label: "Total Followers",
                value: userFollowers.toLocaleString("en-IN"),
                change: "People supporting your work",
                icon: Users,
                color: "indigo",
              },
              {
                label: "Total Pledged",
                value:
                  userPledges === null
                    ? "—"
                    : `₹${userPledges.totalPledged.toLocaleString("en-IN")}`,
                change: `You've backed ${groupedBackedCampaigns.length} campaign${
                  groupedBackedCampaigns.length === 1 ? "" : "s"
                }`,
                icon: Heart,
                color: "rose",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              const isFollowers = stat.label === "Total Followers";
              return (
                <div
                  key={stat.label}
                  onClick={() => isFollowers && setIsFollowersModalOpen(true)}
                  className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-3 transition-all duration-300 ${
                    isFollowers
                      ? "cursor-pointer hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-50 active:scale-[0.98]"
                      : "hover:border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-${stat.color}-50 text-${stat.color}-600`}
                    >
                      <Icon size={20} />
                    </div>
                    {isFollowers && (
                      <div className="text-[10px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                        View All
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 font-medium">
                      {stat.change}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="flex items-center gap-1 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === "overview"
                  ? "text-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <PieChart size={18} />
              Overview
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("my-campaigns")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === "my-campaigns"
                  ? "text-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Layout size={18} />
              My Campaigns
              {activeTab === "my-campaigns" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("backed-campaigns")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === "backed-campaigns"
                  ? "text-emerald-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Gift size={18} />
              Backed Projects
              {activeTab === "backed-campaigns" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
              )}
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs group">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Funding Progress
                      </h2>
                      <p className="text-xs text-slate-500">
                        Pledge amounts over time
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                      data={pledgeData}
                      margin={{ left: -20, right: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#94A3B8" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#94A3B8" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#10B981"
                        strokeWidth={4}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Weekly Activity
                      </h2>
                      <p className="text-xs text-slate-500">
                        New backers this week
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={backerData}
                      margin={{ left: -20, right: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#F1F5F9"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#94A3B8" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#94A3B8" }}
                        allowDecimals={false}
                      />
                      <Tooltip cursor={{ fill: "#F8FAFC" }} />
                      <Bar
                        dataKey="backers"
                        fill="#0F172A"
                        radius={[4, 4, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Recent Backers
                  </h2>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Backer</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Campaign</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentBackers.length > 0 ? (
                          recentBackers.slice(0, 7).map((backer) => (
                            <tr
                              key={backer.id}
                              className="text-slate-700 hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="font-semibold text-slate-900">
                                  {backer.backerName}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap font-bold text-emerald-600">
                                ₹{backer.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                {backer.campaignTitle}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium italic">
                                {formatTimeAgo(backer.createdAt)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-10 text-center text-slate-400 italic"
                            >
                              No recent backers to show
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "my-campaigns" && (() => {
            const now = new Date();
            const campaignsWithStatus = myCampaigns.map((c) => ({
              ...c,
              isEnded: c.status === "completed" || c.status === "cancelled" || (c.deadline ? new Date(c.deadline) < now : false),
            }));

            const activeCampaigns = campaignsWithStatus.filter((c) => !c.isEnded && c.status === "active");
            const endedCampaigns = campaignsWithStatus.filter((c) => c.isEnded);
            const submittedCampaigns = campaignsWithStatus.filter((c) => c.status === "pending");
            const changesCampaigns = campaignsWithStatus.filter((c) => c.status === "changes_requested");
            const rejectedCampaigns = campaignsWithStatus.filter((c) => c.status === "rejected");

            const displayList =
              campaignFilter === "active" ? activeCampaigns :
              campaignFilter === "ended" ? endedCampaigns :
              campaignFilter === "submitted" ? submittedCampaigns :
              campaignFilter === "changes required" ? changesCampaigns :
              campaignFilter === "rejected" ? rejectedCampaigns :
              campaignsWithStatus;

            return (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-bold tracking-tight">
                    Your Launched Campaigns
                  </h2>
                  <div className="flex items-center gap-2 text-xs">
                    {(["all", "active", "ended", "submitted", "changes required", "rejected"] as const).map((f) => {
                      const count =
                        f === "all" ? campaignsWithStatus.length :
                        f === "active" ? activeCampaigns.length :
                        f === "ended" ? endedCampaigns.length :
                        f === "submitted" ? submittedCampaigns.length :
                        f === "changes required" ? changesCampaigns.length :
                        rejectedCampaigns.length;
                      return (
                        <button
                          key={f}
                          onClick={() => setCampaignFilter(f as any)}
                          className={`rounded-full px-4 py-1.5 font-semibold capitalize transition-all border ${
                            campaignFilter === f
                              ? f === "ended"
                                ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                                : f === "rejected"
                                ? "bg-red-600 border-red-600 text-white shadow-sm"
                                : "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {f} <span className="opacity-70">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {loadingCampaigns ? (
                  <div className="py-20 text-center text-slate-400">
                    Loading your campaigns...
                  </div>
                ) : displayList.length === 0 ? (
                  <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Layout size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {campaignFilter === "ended"
                          ? "No ended campaigns"
                          : campaignFilter === "active"
                          ? "No active campaigns"
                          : campaignFilter === "submitted"
                          ? "No submitted campaigns"
                          : campaignFilter === "changes required"
                          ? "No campaigns requiring changes"
                          : campaignFilter === "rejected"
                          ? "No rejected campaigns"
                          : "No campaigns found"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {campaignFilter === "all"
                          ? "Launch your first project to start raising funds!"
                          : `Switch to "All" to see all your campaigns.`}
                      </p>
                    </div>
                    {campaignFilter === "all" && (
                      <Link href="/create">
                        <button className="mt-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                          Launch Project
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {displayList.map((campaign) => {
                      const progress = Math.min(
                        (campaign.currentAmount / campaign.goalAmount) * 100,
                        100,
                      );
                      const isEnded = campaign.isEnded;
                      const isSuccess = campaign.currentAmount >= campaign.goalAmount;
                      
                      return (
                        <div
                          key={campaign.id}
                          className={`group overflow-hidden rounded-2xl border bg-white shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                            isEnded ? "border-slate-200 opacity-90" : "border-slate-200"
                          }`}
                        >
                          <div className="relative h-44 bg-slate-100 overflow-hidden">
                            <img
                              src={
                                !campaign.imageUrl ||
                                campaign.imageUrl === "/hero.jpg"
                                  ? "/world.jpg"
                                  : campaign.imageUrl
                              }
                              alt={campaign.title}
                              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isEnded ? "grayscale-[20%]" : ""}`}
                            />
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                            <span
                              className={`absolute right-4 top-4 inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                isEnded
                                  ? (isSuccess ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")
                                  : campaign.status === "pending"
                                  ? "bg-amber-500 text-white"
                                  : campaign.status === "changes_requested"
                                  ? "bg-amber-600 text-white"
                                  : campaign.status === "rejected"
                                  ? "bg-red-600 text-white"
                                  : "bg-emerald-500 text-white"
                              }`}
                            >
                              {isEnded ? (isSuccess ? "Success" : "Failed") : 
                               campaign.status === "pending" ? "Submitted" :
                               campaign.status === "changes_requested" ? "Changes Required" :
                               campaign.status === "rejected" ? "Rejected" : "Active"}
                            </span>
                          </div>

                          <div className="p-6 space-y-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold tracking-tight text-slate-900 line-clamp-1">
                              {campaign.title}
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-0.5">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Raised
                                </p>
                                <p className={`text-lg font-bold ${isEnded ? (isSuccess ? "text-emerald-600" : "text-slate-600") : "text-emerald-600"}`}>
                                  ₹{campaign.currentAmount.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Goal
                                </p>
                                <p className="text-lg font-bold text-slate-900">
                                  ₹{campaign.goalAmount.toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-400">Progress</span>
                                <span className={isEnded ? (isSuccess ? "text-emerald-600" : "text-slate-400") : "text-emerald-600"}>
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-1000 ${isEnded ? (isSuccess ? "bg-emerald-400" : "bg-slate-400") : "bg-emerald-500"}`}
                                  style={{
                                    width: `${progress}%`,
                                  }}
                                />
                              </div>
                              {}
                              <p className="text-xs text-slate-400">
                                <span className="font-semibold text-slate-600">{campaign.backers}</span> backer{campaign.backers !== 1 ? "s" : ""}
                              </p>
                            </div>

                            <div className="mt-4 flex gap-2">
                              <Link
                                href={`/campaigns/${campaign.slug || campaign.id}`}
                                className="flex-1 rounded-full border border-slate-200 bg-white py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                              >
                                <Eye size={16} className="inline mr-1.5" />
                                View
                              </Link>
                              {campaign.status !== "rejected" && (
                                <Link
                                  href={`/dashboard/campaigns/${campaign.slug || campaign.id}`}
                                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                  <BarChart3 size={16} />
                                  Analytics
                                </Link>
                              )}
                              {!isEnded && campaign.status !== "rejected" && (
                                <Link
                                  href={`/dashboard/campaigns/${campaign.slug || campaign.id}/edit`}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                                  title="Edit campaign"
                                >
                                  <Edit2 size={16} />
                                </Link>
                              )}
                              <button
                                onClick={() => {
                                  setDeleteTarget(campaign);
                                  setDeleteConfirmText("");
                                }}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
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
            );
          })()}


          {activeTab === "backed-campaigns" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight">
                  Projects You've Backed
                </h2>
              </div>
              {userPledges === null ? (
                <div className="py-20 text-center text-slate-400">
                  Loading backed projects...
                </div>
              ) : groupedBackedCampaigns.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Heart size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-900">
                      You haven't backed any projects yet
                    </p>
                    <p className="text-sm text-slate-500">
                      Discover amazing projects and help them come to life!
                    </p>
                  </div>
                  <Link href="/explore">
                    <button className="mt-2 rounded-full bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                      Explore Projects
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {groupedBackedCampaigns.map((group) => {
                    const campaign = {
                      id: group.campaign?._id || group.campaign?.id,
                      title: group.campaign?.title || "Campaign",
                      shortDescription:
                        group.campaign?.shortDescription ||
                        group.campaign?.description ||
                        "",
                      category: group.campaign?.category || "Other",
                      imageUrl: group.campaign?.imageUrl || "/world.jpg",
                      goalAmount: group.campaign?.goalAmount || 1,
                      currentAmount: group.campaign?.currentAmount || 0,
                      backers: group.campaign?.backers || 0,
                      deadline: group.campaign?.deadline || new Date().toISOString(),
                      status: group.campaign?.status,
                      slug: group.campaign?.slug,
                    };

                    return (
                      <div key={campaign.id} className="relative group">
                        {}
                        <div className="absolute -top-2 -right-2 z-10 flex flex-col gap-2 items-end">
                          <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[11px] font-bold shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                            Backed ₹{group.totalAmount.toLocaleString("en-IN")}
                          </div>
                          {group.count > 1 && (
                            <div className="bg-orange-500 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-md border-2 border-white">
                              {group.count}x Backed
                            </div>
                          )}
                        </div>

                        <CampaignCard campaign={campaign} />

                        {}
                        <div className="absolute bottom-[22px] right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                           <span className="text-[10px] font-bold text-emerald-700 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-emerald-100">
                             Last Backed: {formatTimeAgo(group.lastPledgedAt)}
                           </span>
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

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <Trash2 size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Delete Campaign?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                This action is irreversible. It will permanently remove{" "}
                <span className="font-bold text-slate-800">
                  "{deleteTarget?.title}"
                </span>{" "}
                and all associated data.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Confirm by typing the name
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-50"
                placeholder={deleteTarget?.title}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                disabled={deleting}
              >
                Keep it
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteConfirmText.toLowerCase() !==
                    deleteTarget?.title.toLowerCase() || deleting
                }
                className="flex-1 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-100 disabled:opacity-50 disabled:shadow-none hover:bg-rose-700 active:scale-95 transition-all"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        count={userFollowers}
      />
    </>
  );
}
