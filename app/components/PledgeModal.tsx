"use client";

import { useState } from "react";
import { Heart, CheckCircle, AlertCircle, X } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
}

interface PledgeModalProps {
  campaign: Campaign;
  open: boolean;
  onClose: () => void;
}

export default function PledgeModal({
  campaign,
  open,
  onClose,
}: PledgeModalProps) {
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const presetAmounts = [10, 25, 50, 100, 250];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);

    // fake API delay
    await new Promise((r) => setTimeout(r, 1000));

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setAmount("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          /* SUCCESS STATE */
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Thank you!</h3>
            <p className="text-sm text-gray-600">
              Your pledge of {formatCurrency(Number(amount))} has been recorded.
            </p>
          </div>
        ) : (
          /* FORM */
          <>
            <div className="mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold">Back this project</h2>
            </div>

            <p className="mb-6 text-sm text-gray-600">
              Support <strong>{campaign.title}</strong> and help bring it to
              life.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* PRESET */}
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

              {/* INPUT */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Custom amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-md border px-8 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* INFO */}
              <div className="flex gap-3 rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <p>
                  Your pledge will be collected only if the campaign reaches its
                  funding goal before the deadline.
                </p>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={!amount || loading}
                className="w-full rounded-md bg-green-600 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
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
