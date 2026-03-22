"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Campaign = {
  id: string;
  title: string;
  shortDescription?: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  owner?: string;
};

type Pledge = {
  id: string;
  amount: number;
  backerName: string;
  backerEmail: string;
  createdAt: string | null;
};

type User = {
  id: string;
  fullName: string;
  email: string;
};

export default function CampaignOwnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params?.id as string | undefined;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!campaignId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        let userId: string | null = null;

        // Get current user
        const userRes = await fetch("/api/profile/me", { cache: "no-store" });
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.profile.id;
          setCurrentUser({
            id: userData.profile.id,
            fullName: userData.profile.fullName,
            email: userData.profile.email,
          });
        } else {
          throw new Error("Not authenticated");
        }

        // Get campaign details
        const campaignRes = await fetch(`/api/campaigns/${campaignId}`);

        if (!campaignRes.ok) {
          throw new Error("Campaign not found");
        }

        const campaignData = await campaignRes.json();
        const c = campaignData.campaign;

        // Check ownership before setting campaign
        if (c.owner !== userId) {
          setError("You don't have access to this campaign");
          setTimeout(() => router.push("/dashboard"), 2000);
          setLoading(false);
          return;
        }

        setCampaign({
          id: c.id,
          title: c.title,
          shortDescription: c.shortDescription,
          goalAmount: c.goalAmount,
          currentAmount: c.currentAmount,
          backers: c.backers,
          owner: c.owner,
        });

        setIsOwner(true);

        // Get pledges
        const pledgesRes = await fetch(`/api/pledges?campaignId=${campaignId}`);
        if (pledgesRes.ok) {
          const pledgesData = await pledgesRes.json();
          setPledges(pledgesData.pledges || []);
        }
      } catch (err: any) {
        console.error("Error loading campaign details", err);
        setError(err.message || "Unable to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [campaignId, router]);

  if (!campaignId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-600">No campaign id provided.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <ArrowLeft size={16} />
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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <ArrowLeft size={16} />
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
            <button
              onClick={() =>
                router.push(`/dashboard/campaigns/${campaign.id}/edit`)
              }
              className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              Edit Campaign
            </button>
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
                        100,
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
                        100,
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
