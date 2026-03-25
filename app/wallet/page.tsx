"use client";

import { useState, useEffect } from "react";
import { Wallet, AlertCircle, Loader2, ArrowRight, Check, IndianRupee } from "lucide-react";

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
  const [confirmingCampaign, setConfirmingCampaign] = useState<CampaignWallet | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("Failed to load wallet data.");
      }
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
      setError("An error occurred during withdrawal.");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900">Oops, something went wrong</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const activeFundsCount = data?.campaigns.filter((c) => c.status === "active").length || 0;

  return (
    <main className="min-h-screen bg-white py-12 px-6 sm:px-10 font-sans">
      <div className="mx-auto max-w-[1100px] space-y-8">
        
        {/* HERO: Light Blue Wallet Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#eef4ff] border border-blue-100 p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">
                Total Wallet Balance
              </p>
              <h1 className="text-5xl sm:text-6xl font-black text-[#059669] tracking-tight">
                {formatCurrency(data?.totalAvailable || 0)}
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                From {activeFundsCount} active funds
              </p>
            </div>
            
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dcfce7] border-4 border-[#a7f3d0]/30 shrink-0">
              <Wallet className="h-9 w-9 text-[#059669]" />
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Available */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Available Funds</p>
                <div className="text-2xl font-bold text-[#059669]">
                  {formatCurrency(data?.totalAvailable || 0)}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Check className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending Funds</p>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(0)}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Withdrawn */}
          <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Withdrawn</p>
                <div className="text-2xl font-bold text-gray-800">
                  {formatCurrency(data?.totalWithdrawn || 0)}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* FUND BREAKDOWN TABLE */}
        <div className="pt-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Fund Breakdown</h2>
          
          <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 border-b border-gray-100 bg-white p-5 text-xs font-bold text-gray-500">
              <div className="col-span-5">Campaign</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Date Received</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {/* Table Body */}
            {data?.campaigns.length === 0 ? (
              <div className="p-16 text-center">
                <p className="text-gray-500 text-sm">No funds found in your portfolio.</p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-gray-50">
                {data?.campaigns.map((campaign) => {
                  const isAvailable = campaign.availableBalance > 0;

                  return (
                    <div 
                      key={campaign.id} 
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-5 sm:p-5 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Campaign Name */}
                      <div className="col-span-12 sm:col-span-5">
                        <div className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {campaign.title}
                        </div>
                        {/* Mobile Details */}
                        <div className="mt-4 flex flex-col gap-2 sm:hidden">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Amount</span>
                            <span className={`font-bold ${isAvailable ? 'text-[#059669]' : 'text-gray-900'}`}>
                              {formatCurrency(campaign.availableBalance)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500">Status</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                              isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                            }`}>
                              {isAvailable ? "Available" : "Withdrawn"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Amount */}
                      <div className="col-span-2 hidden sm:block">
                        <span className={`text-sm font-bold ${isAvailable ? 'text-[#059669]' : 'text-gray-900'}`}>
                          {formatCurrency(campaign.availableBalance)}
                        </span>
                      </div>

                      {/* Desktop Date */}
                      <div className="col-span-2 hidden sm:block">
                        <span className="text-sm text-gray-500">
                          {/* We don't have perfect date in walletData so showing mock format */}
                          Recent
                        </span>
                      </div>

                      {/* Desktop Status */}
                      <div className="col-span-2 hidden sm:block">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
                          isAvailable ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {isAvailable ? "Available" : "Withdrawn"}
                        </span>
                      </div>

                      {/* Action */}
                      <div className="col-span-12 sm:col-span-1 flex sm:justify-center mt-3 sm:mt-0">
                        {isAvailable ? (
                          <button
                            onClick={() => handleWithdrawClick(campaign)}
                            className="w-full h-8 sm:w-auto flex items-center justify-center rounded-lg bg-[#059669] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#047857]"
                          >
                            Withdraw
                          </button>
                        ) : (
                          <div className="w-full flex sm:justify-center text-gray-400 font-bold text-sm">
                            -
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* WITHDRAWAL CONFIRMATION MODAL */}
      {confirmingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#059669]">
                <Wallet className="h-7 w-7" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Withdraw to Bank Account
              </h3>
              <p className="text-base text-gray-600 mb-6">
                You are about to transfer <span className="font-bold text-gray-900">{formatCurrency(confirmingCampaign.availableBalance)}</span> from your campaign <strong>"{confirmingCampaign.title}"</strong> to your registered bank account.
              </p>

              <div className="rounded-xl bg-gray-50 border p-4 mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Available Balance:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(confirmingCampaign.availableBalance)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">Processing Fee:</span>
                  <span className="font-medium text-emerald-600">₹0.00 (Waived)</span>
                </div>
                <div className="pt-3 border-t flex justify-between">
                  <span className="font-bold text-gray-900">Total Transfer:</span>
                  <span className="font-bold text-[#059669] text-lg">{formatCurrency(confirmingCampaign.availableBalance)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmingCampaign(null)}
                  disabled={withdrawingId !== null}
                  className="w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWithdrawal}
                  disabled={withdrawingId !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white hover:bg-[#047857] disabled:opacity-50 transition-colors shadow-sm"
                >
                  {withdrawingId ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Confirm Transfer"
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
