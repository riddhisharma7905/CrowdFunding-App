"use client";

import { useEffect, useState } from "react";
import { Heart, CheckCircle, AlertCircle, X, Loader } from "lucide-react";
import { useRazorpay } from "@/app/hooks/useRazorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Campaign {
  id: string;
  title: string;
}

interface PledgeModalProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
  onPledgeSuccess?: () => void;
}

interface UserData {
  fullName: string;
  email: string;
}

export default function PledgeModal({
  campaign,
  open,
  onClose,
  onPledgeSuccess,
}: PledgeModalProps) {
  const isRazorpayLoaded = useRazorpay();
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/profile/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUserData({
            fullName: data.profile.fullName,
            email: data.profile.email,
          });
        } else {
          setError("Please sign in to back this campaign");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [open]);

  if (!open) return null;

  const presetAmounts = [100, 250, 500, 1000, 2500];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (!userData) {
      setError("Please sign in first");
      return;
    }
    if (!isRazorpayLoaded) {
      setError("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.message || "Failed to initialize payment");
      }

      
      const verifyRes = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: Number(amount),
          backerName: userData.fullName,
          backerEmail: userData.email,
        }),
      });

      if (verifyRes.ok) {
        setSuccess(true);
        onPledgeSuccess?.();
        
        setTimeout(() => {
          setSuccess(false);
          setAmount("");
          onClose();
        }, 3000);
      }


      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BackIt",
        description: `Pledge to ${campaign.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
             
        },
        prefill: {
          name: userData.fullName,
          email: userData.email,
        },
        theme: {
          color: "#059669",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response: any) {
        
        setLoading(false);
      });
      razorpayInstance.open();

    } catch (err: any) {
      console.error("Error starting checkout:", err);
      setError(err.message || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Thank you!</h3>
            <p className="text-sm text-gray-600">
              Your pledge of {formatCurrency(Number(amount))} has been recorded.
            </p>
          </div>
        ) : error ? (
          
          <div className="flex flex-col items-center py-10 text-center gap-4">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">{error}</h3>
            <button
              onClick={onClose}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Close
            </button>
          </div>
        ) : userLoading ? (
          
          <div className="flex flex-col items-center py-10">
            <Loader className="h-8 w-8 animate-spin text-green-600" />
            <p className="mt-3 text-sm text-gray-600">Loading...</p>
          </div>
        ) : (
          
          <>
            <div className="mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Back this project</h2>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Support <strong>{campaign.title}</strong> and help bring it to
              life.
            </p>

            {userData && (
              <p className="mb-4 text-xs text-gray-500">
                Backing as: <strong>{userData.fullName}</strong>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Quick amounts
                </p>
                <div className="flex flex-wrap gap-2">
                  {presetAmounts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(String(p))}
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        amount === String(p)
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-300 hover:border-green-600"
                      }`}
                    >
                      {formatCurrency(p)}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Custom amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border px-8 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {}
              <button
                type="submit"
                disabled={!amount || loading || !userData}
                className="w-full rounded-md bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                {loading
                  ? "Processing..."
                  : `Pledge ${amount ? formatCurrency(Number(amount)) : ""}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
