"use client";

import { useState } from "react";
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
  Eye,
  Edit2,
  Share2,
  Menu,
  LogOut,
  Settings,
  Home,
} from "lucide-react";

import Link from "next/link";

const dashboardStats = [
  {
    label: "Total Raised",
    value: "₹156,420",
    change: "+12% from last month",
    icon: DollarSign,
  },
  {
    label: "Active Campaigns",
    value: "3",
    change: "2 funding, 1 completed",
    icon: Target,
  },
  {
    label: "Total Backers",
    value: "5,234",
    change: "+340 this week",
    icon: Users,
  },
  {
    label: "Campaign Views",
    value: "45.2K",
    change: "+8.2% from last week",
    icon: Eye,
  },
];

const pledgeData = [
  { date: "Week 1", amount: 12400 },
  { date: "Week 2", amount: 19200 },
  { date: "Week 3", amount: 28500 },
  { date: "Week 4", amount: 34200 },
  { date: "Week 5", amount: 42300 },
  { date: "Week 6", amount: 51200 },
  { date: "Week 7", amount: 59800 },
  { date: "Week 8", amount: 68900 },
];

const backerData = [
  { day: "Mon", backers: 120 },
  { day: "Tue", backers: 210 },
  { day: "Wed", backers: 195 },
  { day: "Thu", backers: 280 },
  { day: "Fri", backers: 320 },
  { day: "Sat", backers: 410 },
  { day: "Sun", backers: 480 },
];

const myCampaigns = [
  {
    id: "1",
    title: "AI-Powered Personal Assistant Device",
    status: "Active",
    raised: 89000,
    goal: 100000,
    backers: 2300,
    progress: 89,
  },
  {
    id: "2",
    title: "Sustainable Fashion Collection",
    status: "Active",
    raised: 45000,
    goal: 50000,
    backers: 1900,
    progress: 90,
  },
  {
    id: "3",
    title: "Smart Home Automation Kit",
    status: "Completed",
    raised: 92000,
    goal: 75000,
    backers: 3500,
    progress: 123,
  },
];

const recentBackers = [
  {
    name: "Jennifer Walsh",
    amount: 500,
    campaign: "AI Device",
    time: "2 hours ago",
  },
  {
    name: "Michael Chen",
    amount: 250,
    campaign: "Fashion",
    time: "4 hours ago",
  },
  {
    name: "Sarah Anderson",
    amount: 100,
    campaign: "AI Device",
    time: "6 hours ago",
  },
  { name: "David Kumar", amount: 750, campaign: "Fashion", time: "1 day ago" },
  {
    name: "Emma Thompson",
    amount: 1000,
    campaign: "AI Device",
    time: "2 days ago",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* SIDEBAR */}
      <aside
        className={`$${
          sidebarOpen ? " w-64" : " w-20"
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200">
          <span
            className={`text-xl font-semibold tracking-tight ${!sidebarOpen && "hidden"}`}
          >
            BackIt
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium"
          >
            <Home size={18} />
            <span className={!sidebarOpen ? "hidden" : ""}>Overview</span>
          </Link>

          <Link
            href="/explore"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
          >
            <Target size={18} />
            <span className={!sidebarOpen ? "hidden" : ""}>Campaigns</span>
          </Link>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100">
            <DollarSign size={18} />
            <span className={!sidebarOpen ? "hidden" : ""}>Payouts</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100">
            <Settings size={18} />
            <span className={!sidebarOpen ? "hidden" : ""}>Settings</span>
          </button>
        </nav>

        <div className="border-t border-slate-200 px-3 py-4">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100">
            <LogOut size={18} />
            <span className={!sidebarOpen ? "hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {/* PAGE HEADER */}
          <section className="flex items-center justify-between">
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
            {dashboardStats.map((stat) => {
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {myCampaigns.map((campaign) => (
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
                          ₹{Math.round(campaign.raised / 1000)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Goal</p>
                        <p className="mt-1 font-semibold">
                          ₹{Math.round(campaign.goal / 1000)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Backers</p>
                        <p className="mt-1 font-semibold">
                          {(campaign.backers / 1000).toFixed(1)}K
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Progress</span>
                        <span className="font-medium text-slate-700">
                          {campaign.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${Math.min(campaign.progress, 130)}%`,
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
                      <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                        <Edit2 size={14} />
                      </button>
                      <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100">
                        <Share2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                      <tr key={backer.name} className="text-slate-700">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
                          {backer.name}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-emerald-600">
                          ₹{backer.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                          {backer.campaign}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">
                          {backer.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
