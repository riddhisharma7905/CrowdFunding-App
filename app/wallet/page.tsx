"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Clock,
  ShieldCheck,
  X,
} from "lucide-react";

interface CampaignWallet {
  id: string;
  title: string;
  status: string;
  currentAmount: number;
  withdrawnAmount: number;
  availableBalance: number;
}

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalAvailable: number;
    totalWithdrawn: number;
    campaigns: CampaignWallet[];
  } | null>(null);
  const [confirmingCampaign, setConfirmingCampaign] =
    useState<CampaignWallet | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
      } else {
        setError("Failed to load wallet data.");
      }
    } catch {
      setError("An error occurred loading the wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdrawClick = (campaign: CampaignWallet) => {
    if (campaign.availableBalance <= 0) return;
    setConfirmingCampaign(campaign);
  };

  const handleConfirmWithdrawal = async () => {
    if (!confirmingCampaign) return;
    setWithdrawingId(confirmingCampaign.id);
    setError(null);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: confirmingCampaign.id,
          amount: confirmingCampaign.availableBalance,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to withdraw funds.");
      } else {
        await fetchWallet();
        setConfirmingCampaign(null);
      }
    } catch {
      setError("An error occurred during withdrawal.");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-400 font-medium">Loading wallet…</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const activeFundsCount =
    data?.campaigns.filter((c) => c.availableBalance > 0).length || 0;
  const totalRaised =
    data?.campaigns.reduce((s, c) => s + c.currentAmount, 0) || 0;

  const metrics = [
    {
      label: "Available to Withdraw",
      value: formatCurrency(data?.totalAvailable || 0),
      icon: TrendingUp,
      accent: "emerald",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      label: "Pending / In Review",
      value: formatCurrency(0),
      icon: Clock,
      accent: "amber",
      bg: "bg-amber-50",
      iconColor: "text-amber-500",
      valueColor: "text-amber-700",
    },
    {
      label: "Total Withdrawn",
      value: formatCurrency(data?.totalWithdrawn || 0),
      icon: IndianRupee,
      accent: "slate",
      bg: "bg-slate-100",
      iconColor: "text-slate-500",
      valueColor: "text-slate-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-6">
      <div className="mx-auto max-w-5xl space-y-8">

        {}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Wallet</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your campaign earnings and withdrawals.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck size={13} />
            Secured by BackIt
          </div>
        </div>

        {}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-xl">
          {}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 24px,white 24px,white 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,white 24px,white 25px)",
            }}
          />
          {}
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Total Wallet Balance
              </p>
              <p className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                {formatCurrency(data?.totalAvailable || 0)}
              </p>
              <p className="mt-3 text-sm text-slate-400">
                Across{" "}
                <span className="text-white font-semibold">{activeFundsCount}</span>{" "}
                active fund{activeFundsCount !== 1 ? "s" : ""} · Total raised{" "}
                <span className="text-white font-semibold">
                  {formatCurrency(totalRaised)}
                </span>
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {}
        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                      {m.label}
                    </p>
                    <p className={`text-2xl font-bold ${m.valueColor}`}>
                      {m.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${m.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${m.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Fund Breakdown
            </h2>
            <span className="text-xs text-slate-400">
              {data?.campaigns.length || 0} campaign
              {(data?.campaigns.length || 0) !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {}
            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-5">Campaign</div>
              <div className="col-span-2">Raised</div>
              <div className="col-span-2">Withdrawn</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {}
            {!data?.campaigns.length ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Wallet className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No funds yet</p>
                <p className="mt-1 text-xs text-slate-400">
                  Launch a campaign to start raising funds.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.campaigns.map((campaign) => {
                  const isAvailable = campaign.availableBalance > 0;
                  return (
                    <div
                      key={campaign.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center px-6 py-4 hover:bg-slate-50/60 transition-colors"
                    >
                      {}
                      <div className="col-span-12 sm:col-span-5">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {campaign.title}
                        </p>
                        {}
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 sm:hidden text-xs text-slate-500">
                          <span>
                            Raised:{" "}
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(campaign.currentAmount)}
                            </span>
                          </span>
                          <span>
                            Withdrawn:{" "}
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(campaign.withdrawnAmount)}
                            </span>
                          </span>
                        </div>
                      </div>

                      {}
                      <div className="col-span-2 hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">
                          {formatCurrency(campaign.currentAmount)}
                        </p>
                      </div>

                      {}
                      <div className="col-span-2 hidden sm:block">
                        <p className="text-sm text-slate-500">
                          {formatCurrency(campaign.withdrawnAmount)}
                        </p>
                      </div>

                      {}
                      <div className="col-span-2 hidden sm:flex items-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isAvailable ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          )}
                          {isAvailable ? "Available" : "Withdrawn"}
                        </span>
                      </div>

                      {}
                      <div className="col-span-12 sm:col-span-1 flex sm:justify-end mt-2 sm:mt-0">
                        {isAvailable ? (
                          <button
                            onClick={() => handleWithdrawClick(campaign)}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-[0.97] transition-all"
                          >
                            Withdraw
                            <ArrowUpRight size={12} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 font-medium">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {}
        <p className="text-center text-xs text-slate-400 pb-4">
          Withdrawals are processed within 2–5 business days · ₹0 processing fee
        </p>
      </div>

      {}
      {confirmingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirm Withdrawal</h3>
                  <p className="text-xs text-slate-400">Transfer to registered bank</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmingCampaign(null)}
                disabled={withdrawingId !== null}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>

            {}
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                You're transferring funds from{" "}
                <span className="font-semibold text-slate-900">
                  "{confirmingCampaign.title}"
                </span>{" "}
                to your registered bank account.
              </p>

              {}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Available Balance</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(confirmingCampaign.availableBalance)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Processing Fee</span>
                  <span className="font-medium text-emerald-600">₹0.00 — Waived</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-900">Total Transfer</span>
                  <span className="text-base font-bold text-emerald-700">
                    {formatCurrency(confirmingCampaign.availableBalance)}
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              {}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmingCampaign(null);
                    setError(null);
                  }}
                  disabled={withdrawingId !== null}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  disabled={withdrawingId !== null}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98] transition-all shadow-sm"
                >
                  {withdrawingId ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      Confirm Transfer
                      <ArrowUpRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
