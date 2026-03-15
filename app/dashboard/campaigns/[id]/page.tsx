"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Campaign = {
  id: string;
  title: string;
  shortDescription?: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
};

type Pledge = {
  id: string;
  campaignId: string;
  amount: number;
  backerName: string;
  backerEmail: string;
  createdAt: string | null;
};

export default function CampaignOwnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params?.id as string | undefined;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!campaignId) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const [campaignRes, pledgesRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`),
          fetch(`/api/pledges?campaignId=${campaignId}`),
        ]);

        if (!campaignRes.ok) {
          throw new Error("Failed to load campaign");
        }

        const campaignData = await campaignRes.json();
        const c = campaignData.campaign;
        setCampaign({
          id: c.id,
          title: c.title,
          shortDescription: c.shortDescription,
          goalAmount: c.goalAmount,
          currentAmount: c.currentAmount,
          backers: c.backers,
        });

        if (pledgesRes.ok) {
          const pledgesData = await pledgesRes.json();
          setPledges(pledgesData.pledges || []);
        } else {
          setPledges([]);
        }
      } catch (err: any) {
        console.error("Error loading owner campaign details", err);
        setError("Unable to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [campaignId]);

  if (!campaignId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-600">No campaign id provided.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading campaign details...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-600">
            {error || "Campaign not found"}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalPledged = pledges.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {campaign.title}
            </h1>
            <p className="text-sm text-slate-600">
              Owner view &mdash; see detailed performance and backers for this
              campaign.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/campaigns/${campaign.id}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View public page
            </Link>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Back to dashboard
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                    Campaign Overview
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">
                    Funding summary
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-slate-500">Raised</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-600">
                    ₹{campaign.currentAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Goal</p>
                  <p className="mt-1 text-xl font-semibold">
                    ₹{campaign.goalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Backers</p>
                  <p className="mt-1 text-xl font-semibold">
                    {campaign.backers}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span className="font-medium text-slate-700">
                    {Math.round(
                      Math.min(
                        (campaign.currentAmount / campaign.goalAmount) * 100,
                        130,
                      ),
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${Math.min(
                        (campaign.currentAmount / campaign.goalAmount) * 100,
                        130,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Backers & pledges
              </h2>

              {pledges.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No pledges have been recorded for this campaign yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                      <tr>
                        <th className="px-4 py-2">Backer</th>
                        <th className="px-4 py-2">Email</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {pledges.map((pledge) => (
                        <tr key={pledge.id} className="text-slate-700">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            {pledge.backerName}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {pledge.backerEmail}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-emerald-600">
                            ₹{pledge.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-xs text-slate-500">
                            {pledge.createdAt
                              ? new Date(pledge.createdAt).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pledge summary
              </p>
              <div>
                <p className="text-slate-500">Total pledged (from pledges)</p>
                <p className="mt-1 text-xl font-semibold text-emerald-600">
                  ₹{totalPledged.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="text-xs text-slate-500">
                This is calculated from the pledges stored via the pledges API
                for this campaign.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
