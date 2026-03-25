"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import PledgeModal from "@/app/components/PledgeModal";

type Campaign = {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  deadline: string;
  ownerId?: string;
  ownerName?: string;
};

type User = {
  id: string;
  fullName: string;
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function CampaignDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        let userId: string | null = null;

        // Fetch current user
        const userRes = await fetch("/api/profile/me", { cache: "no-store" });
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.profile.id;
          setCurrentUser({
            id: userData.profile.id,
            fullName: userData.profile.fullName,
          });
        }

        // Fetch campaign using individual endpoint
        const campaignRes = await fetch(`/api/campaigns/${id}`, {
          cache: "no-store",
        });
        if (!campaignRes.ok) {
          console.error("Failed to load campaign");
          setLoading(false);
          setNotFound(true);
          return;
        }

        const campaignData = await campaignRes.json();
        const campaignObj = campaignData.campaign;


        setCampaign({
          id: campaignObj.id,
          title: campaignObj.title,
          category: campaignObj.category,
          shortDescription: campaignObj.shortDescription,
          fullDescription: campaignObj.fullDescription,
          imageUrl: campaignObj.imageUrl,
          goalAmount: campaignObj.goalAmount,
          currentAmount: campaignObj.currentAmount,
          backers: campaignObj.backers,
          deadline: campaignObj.deadline,
          ownerId: campaignObj.owner,
          ownerName: campaignObj.ownerName,
        });

        // Check ownership - ensure both are strings
        const isOwnerCheck = !!(
          userId &&
          campaignObj.owner &&
          String(campaignObj.owner) === String(userId)
        );
        setIsOwner(isOwnerCheck);
      } catch (error) {
        console.error("Error loading campaign", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handlePledgeSuccess = async () => {
    // Refresh campaign data after successful pledge
    if (!id) return;
    try {
      const campaignRes = await fetch(`/api/campaigns/${id}`, {
        cache: "no-store",
      });
      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign({
          id: campaignData.campaign.id,
          title: campaignData.campaign.title,
          category: campaignData.campaign.category,
          shortDescription: campaignData.campaign.shortDescription,
          fullDescription: campaignData.campaign.fullDescription,
          imageUrl: campaignData.campaign.imageUrl,
          goalAmount: campaignData.campaign.goalAmount,
          currentAmount: campaignData.campaign.currentAmount,
          backers: campaignData.campaign.backers,
          deadline: campaignData.campaign.deadline,
          ownerId: campaignData.campaign.owner,
          ownerName: campaignData.campaign.ownerName,
        });
      }
    } catch (error) {
      console.error("Error refreshing campaign:", error);
    }
  };

  if (!id) {
    return null;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl">Loading campaign...</div>
      </main>
    );
  }

  if (notFound || !campaign) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <Link
            href="/explore"
            className="text-sm text-gray-500 underline-offset-4 hover:text-black hover:underline"
          >
            ← Back to campaigns
          </Link>
          <h1 className="text-2xl font-semibold">Campaign not found</h1>
          <p className="text-sm text-gray-600">
            The campaign you are looking for does not exist or may have been
            removed.
          </p>
        </div>
      </main>
    );
  }

  const progress = Math.min(
    (campaign.currentAmount / campaign.goalAmount) * 100,
    100,
  );

  const deadlineDate = new Date(campaign.deadline);
  const daysLeft = Math.max(
    Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    0,
  );

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Link
          href="/explore"
          className="text-sm text-gray-500 underline-offset-4 hover:text-black hover:underline"
        >
          ← Back to campaigns
        </Link>

        {/* Top layout: main info + funding card */}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)] items-start">
          {/* LEFT: main content */}
          <div className="space-y-10 md:space-y-12">
            {/* Main Campaign Image */}
            <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100">
              <img
                src={!campaign.imageUrl || campaign.imageUrl === "/hero.jpg" ? "/world.jpg" : campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>

            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                {campaign.category}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {campaign.title}
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                {campaign.shortDescription}
              </p>
            </header>

            {/* Creator strip - now clickable to profile */}
            <Link href={`/profile/${campaign.ownerId}`}>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {campaign.ownerName?.charAt(0).toUpperCase() || "C"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Created by {campaign.ownerName || "Anonymous"}
                  </p>
                  <p className="text-xs text-slate-500">View creator profile</p>
                </div>
              </div>
            </Link>

            {/* About / Story */}
            <section className="space-y-3 mt-10">
              <h2 className="text-lg font-semibold text-gray-900">
                About This Campaign
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {campaign.fullDescription}
              </p>
            </section>

            {/* Updates placeholder */}
            <section className="space-y-3 border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Updates</h3>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-medium">Campaign launched</p>
                <p className="mt-1 text-xs text-gray-500">
                  We&apos;ll post important updates about this campaign here.
                </p>
              </div>
            </section>
          </div>

          {/* RIGHT: funding card */}
          <aside className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {formatCurrency(campaign.currentAmount)}
                <span className="ml-1 font-normal text-gray-500">
                  {" "}
                  pledged of {formatCurrency(campaign.goalAmount)} goal
                </span>
              </p>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(progress)}% funded
                </span>
                <span className="text-xs text-gray-600">
                  {daysLeft} days left
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-baseline gap-2 text-sm text-gray-700">
              <span className="text-lg font-semibold text-gray-900">
                {campaign.backers.toLocaleString("en-IN")}
              </span>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                backers
              </span>
            </div>

            {/* Pledge amount input (UI only) */}
            {!isOwner && (
              <>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      router.push(`/signin?callbackUrl=/campaigns/${id}`);
                      return;
                    }
                    setPledgeModalOpen(true);
                  }}
                  className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Back This Project
                </button>
              </>
            )}

            {/* Creator view - Show links to dashboard and analytics */}
            {isOwner && (
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/dashboard/campaigns/${id}`)}
                  className="mt-1 w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <BarChart3 size={16} />
                  View Campaign Analytics
                </button>
                <p className="text-xs text-center text-emerald-700 font-medium">
                  You are the campaign creator
                </p>
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-800">
              <p className="font-semibold">Risk Notice</p>
              <p>
                As with any development project, there is some risk. Only back
                this campaign if you trust the creator and understand the
                potential delays.
              </p>
            </div>

            <button
              onClick={async () => {
                const shareUrl = typeof window !== "undefined" ? window.location.href : "";
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: campaign.title,
                      text: campaign.shortDescription,
                      url: shareUrl,
                    });
                  } catch {
                    // user cancelled or share failed
                  }
                } else {
                  await navigator.clipboard.writeText(shareUrl);
                  alert("Campaign link copied to clipboard!");
                }
              }}
              className="w-full rounded-lg border border-gray-300 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              Share campaign
            </button>
          </aside>
        </section>

        <PledgeModal
          campaign={campaign || { id: "", title: "" }}
          open={pledgeModalOpen}
          onClose={() => setPledgeModalOpen(false)}
          onPledgeSuccess={handlePledgeSuccess}
        />
      </div>
    </main>
  );
}
