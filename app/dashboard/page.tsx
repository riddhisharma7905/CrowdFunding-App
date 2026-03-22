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
  const [userPledges, setUserPledges] = useState<{
    totalPledged: number;
    totalBackings: number;
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
          console.error("Failed to load campaigns for dashboard");
          setLoadingCampaigns(false);
          return;
        }

        const data = await res.json();
        const items: DashboardCampaign[] = (data.campaigns || []).map(
          (c: any) => ({
            id: c.id,
            title: c.title,
            status: c.status,
            goalAmount: c.goalAmount,
            currentAmount: c.currentAmount,
            backers: c.backers,
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
        `/api/campaigns/${encodeURIComponent(deleteTarget.id)}`,
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
          {/* PAGE HEADER WITH PROFILE DROPDOWN */}
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
              <button className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                + New Campaign
              </button>
            </Link>
          </section>

          {/* STATS */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Raised",
                value:
                  totals === null
                    ? "—"
                    : `₹${totals.totalRaised.toLocaleString("en-IN")}`,
                change: "Live total across campaigns",
                icon: DollarSign,
              },
              {
                label: "Active Campaigns",
                value:
                  totals === null ? "—" : String(totals.activeCampaigns || 0),
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
                value:
                  userPledges === null
                    ? "—"
                    : `₹${userPledges.totalPledged.toLocaleString("en-IN")}`,
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
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <Icon size={20} />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* CHARTS */}
          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Funding Progress
                </h2>
                <span className="text-xs text-slate-500">Last 8 weeks</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={pledgeData} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <Tooltip cursor={{ stroke: "#A5B4FC", strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Weekly Backers
                </h2>
                <span className="text-xs text-slate-500">This week</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={backerData} margin={{ left: -20, right: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <Tooltip cursor={{ fill: "rgba(16,185,129,0.08)" }} />
                  <Bar dataKey="backers" fill="#111827" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* MY CAMPAIGNS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              My Campaigns
            </h2>
            {loadingCampaigns ? (
              <div className="py-10 text-sm text-slate-500">
                Loading campaigns...
              </div>
            ) : myCampaigns.length === 0 ? (
              <div className="py-10 text-sm text-slate-500">
                You have not launched any campaigns yet.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {myCampaigns.map((campaign) => {
                  const progress = Math.min(
                    (campaign.currentAmount / campaign.goalAmount) * 100,
                    100,
                  );
                  return (
                    <div
                      key={campaign.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col"
                    >
                      <div className="relative h-36 bg-slate-100">
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                          Campaign image
                        </div>
                        <span
                          className={`absolute right-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            campaign.status === "Completed"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-emerald-500 text-white"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>

                      <div className="p-5 space-y-4 flex-1 flex flex-col">
                        <h3 className="text-base font-semibold tracking-tight">
                          {campaign.title}
                        </h3>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-slate-500">Raised</p>
                            <p className="mt-1 font-semibold text-emerald-600">
                              ₹{Math.round(campaign.currentAmount / 1000)}K
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Goal</p>
                            <p className="mt-1 font-semibold">
                              ₹{Math.round(campaign.goalAmount / 1000)}K
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Backers</p>
                            <p className="mt-1 font-semibold">
                              {campaign.backers < 1000
                                ? campaign.backers
                                : `${(campaign.backers / 1000).toFixed(1)}K`}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span className="font-medium text-slate-700">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="flex-1"
                          >
                            <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                              <Eye size={14} />
                            </button>
                          </Link>
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}/edit`}
                            className="flex-1"
                          >
                            <button className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                              <Edit2 size={14} />
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteTarget(campaign);
                              setDeleteConfirmText("");
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* RECENT BACKERS */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              Recent Backers
            </h2>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Backer</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Campaign</th>
                      <th className="px-6 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentBackers.map((backer) => (
                      <tr key={backer.id} className="text-slate-700">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                          {backer.backerName}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600">
                          ₹{backer.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                          {backer.campaignTitle}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">
                          {formatTimeAgo(backer.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Delete campaign?
            </h2>
            <p className="text-sm text-slate-600">
              This action cannot be undone. This will permanently delete the
              campaign{" "}
              <span className="font-semibold">{deleteTarget?.title}</span>.
            </p>
            <p className="text-xs font-medium text-slate-700">
              To confirm, type{" "}
              <span className="font-semibold">{deleteTarget?.title}</span> in
              the box below.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder={deleteTarget?.title || "campaign name"}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteConfirmText.toLowerCase() !==
                    deleteTarget?.title.toLowerCase() || deleting
                }
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white disabled:cursor-not-allowed disabled:bg-red-300 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
