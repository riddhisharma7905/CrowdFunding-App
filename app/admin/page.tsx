"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ListChecks, Tag, BarChart3, ShieldAlert,
  CheckCircle2, XCircle, Ban, Loader2, Search, ArrowUpRight,
  TrendingUp, Users, DollarSign, Zap, Clock, CheckSquare, XSquare,
  Target, Plus, Edit2, Edit3, Trash2, Award, Activity, RefreshCw,
  ArrowRight, Coins, X, Eye, Sparkles
} from "lucide-react";
import { debounce } from "lodash";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

type AdminStats = {
  totalUsers: number; totalCampaigns: number; endedCampaignsCount: number;
  successfulCampaigns: number; failedCampaigns: number; totalRevenue: number;
  pendingCampaigns: any[]; recentPledges: any[];
  analytics: {
    revenueByCategory: { name: string; value: number; count: number }[];
    topCampaigns: { id: string; name: string; slug: string; amount: number; goal: number; category: string }[];
    topUsers: { id: string; name: string; email: string; totalPaid: number }[];
  };
};

type Campaign = {
  _id: string; slug: string; title: string; shortDescription: string;
  category: string; goalAmount: number; currentAmount: number; status: string;
  deadline: string; createdAt: string; backers: number; imageUrl?: string;
  owner: { fullName: string; email: string; profilePicture?: string };
};

type Category = { _id: string; name: string; description: string };

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#3b82f6"];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (900 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display.toLocaleString()}</>;
}

const fade = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const STATUS_STYLES: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  rejected:  "bg-red-50 text-red-600 border-red-200",
  suspended: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>
      {label || status}
    </span>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs shadow-xl">
      {label && <p className="text-gray-400 mb-1 font-medium">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold text-gray-800">₹{Number(p.value).toLocaleString("en-IN")}</p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [page, setPage] = useState<"dashboard" | "campaigns" | "categories" | "analytics">("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campFilter, setCampFilter] = useState("active");
  const [campSearch, setCampSearch] = useState("");
  const [campCategory, setCampCategory] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [catModal, setCatModal] = useState<null | "new" | Category>(null);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [catError, setCatError] = useState("");

  const [feedbackModal, setFeedbackModal] = useState<{ slug: string; action: "rejected" | "changes_requested" } | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  useEffect(() => { fetchStats(); fetchCategories(); }, []);
  useEffect(() => { if (page === "campaigns") fetchCampaigns("", "", "active"); }, [page]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401 || res.status === 403) return router.push("/signin");
      if (!res.ok) throw new Error("Failed");
      setStats(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoadingStats(false); }
  };

  const fetchCampaigns = async (q: string, cat: string, fil: string) => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch(`/api/admin/campaigns/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}&filter=${fil}`);
      setCampaigns((await res.json()).campaigns || []);
    } catch {}
    finally { setLoadingCampaigns(false); }
  };

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await fetch("/api/admin/categories");
      setCategories((await res.json()).categories || []);
    } catch {}
    finally { setLoadingCats(false); }
  };

  const handleRefresh = () => {
    fetchStats();
    if (page === "campaigns") fetchCampaigns(campSearch, campCategory, campFilter);
    if (page === "categories") fetchCategories();
  };

  const debouncedSearch = useCallback(
    debounce((q: string, cat: string, fil: string) => fetchCampaigns(q, cat, fil), 300), []
  );

  const handleCampaignAction = async (slug: string, action: string, reason?: string) => {
    setProcessingId(slug);
    try {
      const res = await fetch(`/api/admin/campaigns/${slug}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, reason }),
      });
      if (!res.ok) throw new Error("Failed");
      await fetchStats();
      if (page === "campaigns") fetchCampaigns(campSearch, campCategory, campFilter);
      setFeedbackModal(null);
      setFeedbackText("");
    } catch (e: any) { alert(e.message); }
    finally { setProcessingId(null); }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackModal || !feedbackText.trim()) return;
    handleCampaignAction(feedbackModal.slug, feedbackModal.action, feedbackText.trim());
  };

  const handleSaveCat = async (e: React.FormEvent) => {
    e.preventDefault(); setCatError("");
    try {
      const isEdit = catModal !== "new" && catModal !== null;
      const url = isEdit ? `/api/admin/categories/${(catModal as Category)._id}` : "/api/admin/categories";
      const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed"); }
      setCatModal(null); fetchCategories();
    } catch (e: any) { setCatError(e.message); }
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const navItems = [
    { id: "dashboard",  label: "Dashboard",  icon: <LayoutDashboard size={16} /> },
    { id: "campaigns",  label: "Campaigns",  icon: <ListChecks size={16} /> },
    { id: "categories", label: "Categories", icon: <Tag size={16} /> },
    { id: "analytics",  label: "Analytics",  icon: <BarChart3 size={16} /> },
  ];

  const STAT_CARDS = stats ? [
    { label: "Pending",      value: stats.pendingCampaigns.length, icon: <Clock size={18} />,        accent: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200" },
    { label: "Total Users",  value: stats.totalUsers,               icon: <Users size={18} />,        accent: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-200" },
    { label: "Live",         value: stats.totalCampaigns,           icon: <Zap size={18} />,          accent: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-200" },
    { label: "Ended",        value: stats.endedCampaignsCount,      icon: <CheckSquare size={18} />,  accent: "text-gray-500",   bg: "bg-gray-100",   border: "border-gray-200" },
    { label: "Successful",   value: stats.successfulCampaigns,      icon: <CheckCircle2 size={18} />, accent: "text-emerald-600",bg: "bg-emerald-50", border: "border-emerald-200" },
    { label: "Failed",       value: stats.failedCampaigns,          icon: <XSquare size={18} />,      accent: "text-red-500",    bg: "bg-red-50",     border: "border-red-200" },
    { label: "Revenue",      value: null, raw: stats.totalRevenue,   icon: <DollarSign size={18} />,   accent: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-200" },
  ] : [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-sm">
          <ShieldAlert className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f8] text-gray-900">
      <aside className="w-[210px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200/70 shadow-[1px_0_0_0_rgba(0,0,0,0.04)] z-20">
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">

            <span className="text-sm font-bold text-gray-900 tracking-tight">BackIt Admin</span>
          </div>
          <button onClick={handleRefresh} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Refresh Data">
            <RefreshCw size={14} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2">Navigation</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id as any); if (item.id === "campaigns") fetchCampaigns("", "", "active"); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                page === item.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className={page === item.id ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-600 transition-colors"}>{item.icon}</span>
              {item.label}
              {item.id === "dashboard" && stats && stats.pendingCampaigns.length > 0 && (
                <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pendingCampaigns.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-xs font-bold text-white">A</div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Admin</p>
              <p className="text-[10px] text-gray-400">Super Access</p>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {page === "dashboard" && (
              <motion.div key="dash" variants={fade} initial="hidden" animate="show" exit="hidden" className="p-6 space-y-6 max-w-full">

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">{greeting}, Admin</p>
                    <h2 className="text-xl font-bold text-gray-900">Here's what's happening.</h2>
                  </div>
                  
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
                  {loadingStats
                    ? Array(7).fill(0).map((_, i) => <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24 border border-gray-100" />)
                    : STAT_CARDS.map((c, i) => (
                      <motion.div key={c.label}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md rounded-2xl p-4 cursor-default transition-all duration-200 group"
                      >
                        <div className={`inline-flex p-1.5 rounded-lg ${c.bg} ${c.border} border mb-3`}>
                          <span className={c.accent}>{c.icon}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{c.label}</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight break-all">
                          {c.raw !== undefined
                            ? `₹${c.raw.toLocaleString("en-IN")}`
                            : <AnimatedNumber value={c.value as number} />
                          }
                        </p>
                      </motion.div>
                    ))
                  }
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <Clock size={15} className="text-amber-500" />
                        Pending Reviews
                        {stats && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded-full">{stats.pendingCampaigns.length}</span>}
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[520px] p-4 space-y-3">
                      {loadingStats ? (
                        <div className="flex justify-center py-12"><Loader2 size={18} className="animate-spin text-gray-300" /></div>
                      ) : !stats || stats.pendingCampaigns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                            <CheckCircle2 size={24} className="text-emerald-500" />
                          </div>
                          <p className="font-semibold text-gray-600 text-sm">All caught up!</p>
                          <p className="text-xs text-gray-400 mt-1">No campaigns waiting for review</p>
                        </div>
                      ) : (
                        stats.pendingCampaigns.map(c => (
                          <motion.div key={c._id} layout className="p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-150 group">
                            <div className="flex gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                <img 
                                  src={!c.imageUrl || c.imageUrl === "/hero.jpg" ? "/world.jpg" : c.imageUrl} 
                                  alt={c.title} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { e.currentTarget.src = "/world.jpg"; }} 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[9px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{c.category}</span>
                                </div>
                                <Link href={`/campaigns/${c.slug}`} target="_blank"
                                  className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors block truncate">
                                  {c.title}
                                </Link>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {c.owner?.fullName} · <span className="font-semibold text-gray-600">₹{c.goalAmount?.toLocaleString("en-IN")}</span> goal
                                </p>
                              </div>
                              <div className="flex flex-col gap-1.5 flex-shrink-0">
                                <Link href={`/campaigns/${c.slug}`} target="_blank"
                                  className="flex items-center justify-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all">
                                  Review
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Award size={14} className="text-amber-500" />
                        <h3 className="text-sm font-semibold text-gray-900">Top Campaigns</h3>
                      </div>
                      <div className="p-4 space-y-1">
                        {!stats
                          ? <div className="h-28 animate-pulse bg-gray-50 rounded-xl" />
                          : stats.analytics.topCampaigns.map((c, i) => {
                            const pct = Math.min(100, Math.round((c.amount / c.goal) * 100));
                            return (
                              <Link href={`/campaigns/${c.slug}`} target="_blank" key={c.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                                <span className="text-xs font-bold text-gray-300 w-4 shrink-0">#{i+1}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-700 truncate group-hover:text-indigo-700 transition-colors">{c.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{pct}%</span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 shrink-0">₹{c.amount.toLocaleString("en-IN")}</span>
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <h3 className="text-sm font-semibold text-gray-900">Revenue Split</h3>
                      </div>
                      <div className="p-4">
                        {!stats || stats.analytics.revenueByCategory.length === 0
                          ? <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
                          : (
                            <>
                              <div className="h-28">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie data={stats.analytics.revenueByCategory} dataKey="value" cx="50%" cy="50%" innerRadius={26} outerRadius={44} stroke="none" paddingAngle={2}>
                                      {stats.analytics.revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="space-y-2 mt-3">
                                {stats.analytics.revenueByCategory.slice(0, 4).map((c, i) => (
                                  <div key={c.name} className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                      <span className="text-gray-600 font-medium">{c.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-800">₹{c.value.toLocaleString("en-IN")}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {page === "campaigns" && (
              <motion.div key="campaigns" variants={fade} initial="hidden" animate="show" exit="hidden" className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Campaign Management</h2>
                  <p className="text-xs text-gray-400 mt-1">Search, filter, and moderate every campaign.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input placeholder="Search campaigns..." value={campSearch}
                        onChange={e => { setCampSearch(e.target.value); debouncedSearch(e.target.value, campCategory, campFilter); }}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                    <select value={campCategory}
                      onChange={e => { setCampCategory(e.target.value); debouncedSearch(campSearch, e.target.value, campFilter); }}
                      className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-indigo-400 appearance-none min-w-[160px]">
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["active", "ended", "pending", "suspended", "rejected"].map(f => (
                      <button key={f} onClick={() => { setCampFilter(f); fetchCampaigns(campSearch, campCategory, f); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all capitalize border ${
                          campFilter === f
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 bg-white"
                        }`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {loadingCampaigns ? (
                    <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-indigo-400" /></div>
                  ) : campaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <Search size={32} className="text-gray-200 mb-3" />
                      <p className="text-sm font-semibold text-gray-400">No campaigns match your filters</p>
                    </div>
                  ) : campaigns.map(c => {
                    const pct = Math.min(100, Math.round((c.currentAmount / c.goalAmount) * 100));
                    const ended = new Date(c.deadline) < new Date();
                    const successful = ended && c.currentAmount >= c.goalAmount;
                    const failed = ended && c.currentAmount < c.goalAmount;

                    return (
                      <motion.div key={c._id} layout
                        className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md rounded-2xl p-5 flex gap-4 items-start transition-all duration-150 group shadow-sm">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img 
                            src={!c.imageUrl || c.imageUrl === "/hero.jpg" ? "/world.jpg" : c.imageUrl} 
                            alt={c.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.currentTarget.src = "/world.jpg"; }} 
                          />
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{c.category}</span>
                              {successful && <StatusPill status="active" label="Successful" />}
                              {failed && <StatusPill status="rejected" label="Failed" />}
                              {!ended && <StatusPill status={c.status} />}
                            </div>
                            <Link href={`/campaigns/${c.slug}`} target="_blank"
                              className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors block truncate">
                              {c.title}
                            </Link>
                            <p className="text-[11px] text-gray-400 mt-0.5">by {c.owner?.fullName} · {c.backers || 0} donors</p>
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-gray-600 font-semibold">₹{c.currentAmount.toLocaleString("en-IN")} raised</span>
                                <span className="text-gray-400">of ₹{c.goalAmount.toLocaleString("en-IN")} · <span className={pct >= 100 ? "text-emerald-600 font-bold" : ""}>{pct}%</span></span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? "bg-emerald-400" : "bg-gradient-to-r from-indigo-400 to-violet-400"}`}
                                  style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {c.status !== "rejected" && c.status !== "suspended" && c.status !== "pending" && (
                              <button onClick={() => handleCampaignAction(c.slug, "suspended")} disabled={processingId === c.slug}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
                                {processingId === c.slug ? <Loader2 size={11} className="animate-spin" /> : <Ban size={11} />}
                                Suspend
                              </button>
                            )}
                            {c.status === "suspended" && (
                              <button onClick={() => handleCampaignAction(c.slug, "active")} disabled={processingId === c.slug}
                                className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-xl transition-all disabled:opacity-50">
                                {processingId === c.slug ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                Restore
                              </button>
                            )}
                            {c.status === "pending" && (
                              <div className="flex items-center gap-2">
                                <Link href={`/campaigns/${c.slug}`} target="_blank"
                                  className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all">
                                  Review
                                </Link>
                              </div>
                            )}
                            <Link href={`/campaigns/${c.slug}`} target="_blank"
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-gray-200 hover:border-indigo-200">
                              <Eye size={13} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {page === "categories" && (
              <motion.div key="categories" variants={fade} initial="hidden" animate="show" exit="hidden" className="p-6 space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Categories</h2>
                    <p className="text-xs text-gray-400 mt-1">Manage campaign categories on the platform.</p>
                  </div>
                  <button onClick={() => { setCatModal("new"); setCatForm({ name: "", description: "" }); setCatError(""); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200">
                    <Plus size={15} /> New Category
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {loadingCats ? Array(6).fill(0).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-28 border border-gray-100" />
                  )) : categories.map((cat, i) => (
                    <motion.div key={cat._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                      className="bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md rounded-2xl p-5 group transition-all duration-150 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                          style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}15`, borderColor: `${CHART_COLORS[i % CHART_COLORS.length]}30` }}>
                          <Tag size={15} style={{ color: CHART_COLORS[i % CHART_COLORS.length] }} />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setCatModal(cat); setCatForm({ name: cat.name, description: cat.description || "" }); setCatError(""); }}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteCat(cat._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                      {cat.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</p>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            {page === "analytics" && (
              <motion.div key="analytics" variants={fade} initial="hidden" animate="show" exit="hidden" className="p-6 space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
                  <p className="text-xs text-gray-400 mt-1">Platform performance at a glance.</p>
                </div>
                {!stats ? (
                  <div className="flex justify-center py-20"><Loader2 size={22} className="animate-spin text-indigo-400" /></div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                          <BarChart3 size={14} className="text-indigo-500" /> Revenue by Category
                        </h3>
                        <div className="h-56">
                          {stats.analytics.revenueByCategory.length === 0
                            ? <div className="h-full flex items-center justify-center text-sm text-gray-300">No data yet</div>
                            : (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.analytics.revenueByCategory} barSize={26}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fontSize: 10, fill: "#d1d5db" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f3ff" }} />
                                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {stats.analytics.revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                        </div>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp size={14} className="text-emerald-500" /> Category Share
                        </h3>
                        <div className="h-36">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={stats.analytics.revenueByCategory} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={58} stroke="none" paddingAngle={2}>
                                {stats.analytics.revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                              </Pie>
                              <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-3 space-y-1.5">
                          {stats.analytics.revenueByCategory.slice(0, 4).map((c, i) => (
                            <div key={c.name} className="flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                <span className="text-gray-600 font-medium">{c.name}</span>
                              </div>
                              <span className="font-bold text-gray-800">₹{c.value.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                          <Award size={14} className="text-amber-500" /> Top 5 Campaigns
                        </h3>
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.analytics.topCampaigns} layout="vertical" barSize={14}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                              <XAxis type="number" tick={{ fontSize: 10, fill: "#d1d5db" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280", fontWeight: 600 }} axisLine={false} tickLine={false} width={90} tickFormatter={v => v.length > 12 ? v.slice(0,12)+"…" : v} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f3ff" }} />
                              <Bar dataKey="amount" radius={[0, 6, 6, 0]} fill="#6366f1" fillOpacity={0.85} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                          <Users size={14} className="text-violet-500" /> Top Donors
                        </h3>
                        <div className="space-y-4">
                          {stats.analytics.topUsers.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-8">No donation data yet</p>
                            : stats.analytics.topUsers.map((u, i) => {
                              const maxPaid = stats.analytics.topUsers[0]?.totalPaid || 1;
                              const pct = Math.round((u.totalPaid / maxPaid) * 100);
                              return (
                                <div key={u.id} className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-xs font-bold text-indigo-600 border border-indigo-200 shrink-0">
                                    {u.name[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                      <p className="text-xs font-semibold text-gray-700 truncate">{u.name}</p>
                                      <span className="text-xs font-bold text-emerald-600">₹{u.totalPaid.toLocaleString("en-IN")}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {catModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCatModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">{catModal === "new" ? "New Category" : "Edit Category"}</h3>
                <button onClick={() => setCatModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveCat} className="p-6 space-y-4">
                {catError && <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{catError}</p>}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category Name</label>
                  <input required value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="e.g. Health, Technology..." />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    Description <span className="text-gray-300 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                    rows={3} placeholder="Describe what campaigns belong here..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setCatModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm">
                    {catModal === "new" ? "Create" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {feedbackModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setFeedbackModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }} transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  {feedbackModal.action === "rejected" ? "Reject Campaign" : "Request Changes"}
                </h3>
                <button onClick={() => setFeedbackModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {feedbackModal.action === "rejected" ? "Reason for Rejection" : "Required Changes"}
                  </label>
                  <textarea
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={feedbackModal.action === "rejected" ? "e.g. This campaign violates our terms of service." : "e.g. Please upload a clear photo of the product."}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setFeedbackModal(null)}
                    className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={processingId === feedbackModal.slug}
                    className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors flex items-center justify-center gap-2 ${feedbackModal.action === "rejected" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"} disabled:opacity-50`}>
                    {processingId === feedbackModal.slug ? <Loader2 size={16} className="animate-spin" /> : null}
                    {feedbackModal.action === "rejected" ? "Reject" : "Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
