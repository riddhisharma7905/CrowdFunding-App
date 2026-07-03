"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BarChart3, Trash2, CheckCircle2, XCircle } from "lucide-react";
import PledgeModal from "@/components/campaign/PledgeModal";

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
  status?: string;
  ownerId?: string;
  ownerName?: string;
  updates: { _id: string; content: string; createdAt: string }[];
};

type User = {
  id: string;
  fullName: string;
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function CampaignDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [pledgeModalOpen, setPledgeModalOpen] = useState(false);
  const [updateContent, setUpdateContent] = useState("");
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        let userId: string | null = null;


        const userRes = await fetch("/api/profile/me", { cache: "no-store" });
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.profile.id;
          setCurrentUser({
            id: userData.profile.id,
            fullName: userData.profile.fullName,
          });
        }

        
        const campaignRes = await fetch(`/api/campaigns/${slug}`, {
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
          status: campaignObj.status,
          ownerId: campaignObj.owner,
          ownerName: campaignObj.ownerName,
          updates: campaignObj.updates || [],
        });

        
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
  }, [slug]);

  const handlePledgeSuccess = async () => {
    
    if (!slug) return;
    try {
      const campaignRes = await fetch(`/api/campaigns/${slug}`, {
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
          status: campaignData.campaign.status,
          ownerId: campaignData.campaign.owner,
          ownerName: campaignData.campaign.ownerName,
          updates: campaignData.campaign.updates || [],
        });
      }
    } catch (error) {
      console.error("Error refreshing campaign:", error);
    }
  };

  const handlePostUpdate = async () => {
    if (!slug || !updateContent.trim()) return;
    
    setIsPostingUpdate(true);
    try {
      const res = await fetch(`/api/campaigns/${slug}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: updateContent.trim() }),
      });

      if (res.ok) {
        setUpdateContent("");

        await handlePledgeSuccess();
      } else {
        const errorData = await res.json();
        alert(errorData?.message || "Failed to post update");
      }
    } catch (error) {
      console.error("Error posting update:", error);
      alert("An error occurred while posting the update.");
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!slug || !confirm("Are you sure you want to delete this update?")) return;
    
    try {
      const res = await fetch(`/api/campaigns/${slug}/updates/${updateId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await handlePledgeSuccess();
      } else {
        const errorData = await res.json();
        alert(errorData?.message || "Failed to delete update");
      }
    } catch (error) {
      console.error("Error deleting update:", error);
      alert("An error occurred while deleting the update.");
    }
  };

  if (!slug) {
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
  const now = Date.now();
  const isEnded =
    campaign.status === "completed" ||
    campaign.status === "cancelled" ||
    deadlineDate.getTime() < now;

  const isSuccess = campaign.currentAmount >= campaign.goalAmount;

  const daysLeft = Math.max(
    Math.ceil((deadlineDate.getTime() - now) / (1000 * 60 * 60 * 24)),
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

        {}
        {isEnded && (
          <div className={`rounded-2xl border px-5 py-4 flex items-center gap-4 ${isSuccess ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold ${isSuccess ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
              {isSuccess ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            </div>
            <div>
              <p className={`text-sm font-bold ${isSuccess ? "text-emerald-900" : "text-rose-900"}`}>
                {isSuccess ? "This campaign was successful!" : "This campaign was unsuccessful."}
              </p>
              <p className={`text-xs mt-0.5 ${isSuccess ? "text-emerald-700" : "text-rose-700"}`}>
                {isSuccess 
                  ? "The creator met their funding goal and the campaign has ended." 
                  : "The campaign did not meet its funding requirements by the deadline."}
              </p>
            </div>
          </div>
        )}

        {}
        <section className="grid gap-10 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)] items-start">
          {}
          <div className="space-y-10 md:space-y-12">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl text-slate-900 leading-tight">
                {campaign.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="font-bold tracking-wider text-emerald-600 uppercase">
                  {campaign.category}
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  By <Link href={isOwner ? "/dashboard" : `/profile/${campaign.ownerId}`} className="font-semibold text-slate-900 hover:text-emerald-600 hover:underline transition-colors">{campaign.ownerName || "Anonymous"}</Link>
                </span>
              </div>
              
              <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
                {campaign.shortDescription}
              </p>
            </header>

            <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-100">
              <img
                src={!campaign.imageUrl || campaign.imageUrl === "/hero.jpg" ? "/world.jpg" : campaign.imageUrl}
                alt={campaign.title}
                className={`w-full h-full object-cover ${isEnded ? "grayscale-[30%]" : ""}`}
                onError={(e) => { e.currentTarget.src = "/world.jpg"; }}
              />
            </div>

            {}
            <section className="space-y-3 mt-10">
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {campaign.fullDescription}
              </p>
            </section>

          </div>

          {}
          <div className="space-y-6">
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
                <span className={`text-xs font-medium ${isEnded ? (isSuccess ? "text-emerald-600" : "text-rose-600") : "text-gray-600"}`}>
                  {isEnded ? (isSuccess ? "Successful" : "Failed") : `${daysLeft} days left`}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full ${isEnded ? (isSuccess ? "bg-emerald-400" : "bg-slate-400") : "bg-green-500"}`}
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

            {}
            {!isOwner && !isEnded && (
              <>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      router.push(`/signin?callbackUrl=/campaigns/${slug}`);
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

            {}
            {!isOwner && isEnded && (
              <div className={`w-full rounded-lg border py-2.5 text-sm font-semibold text-center ${isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                {isSuccess ? "Campaign Successful" : "Campaign Failed"}
              </div>
            )}

            {}
            {isOwner && (
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/dashboard/campaigns/${slug}`)}
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
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-l font-bold text-gray-900">UPDATES</h3>
              </div>

              {isOwner && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 space-y-3">
                  <p className="text-sm font-semibold text-emerald-800">Post a new update</p>
                  <textarea
                    value={updateContent}
                    onChange={(e) => setUpdateContent(e.target.value)}
                    placeholder="Share what's new with your backers..."
                    className="w-full rounded-xl border border-emerald-200 p-3 text-sm text-gray-700 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 min-h-[100px] outline-none transition-shadow"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handlePostUpdate}
                      disabled={isPostingUpdate || !updateContent.trim()}
                      className="rounded-lg bg-emerald-800 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isPostingUpdate ? "Posting..." : "Post Update"}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4 mt-6">
                {!campaign.updates || campaign.updates.length === 0 ? (
                  !isOwner && (
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center">
                      <p className="text-sm font-medium text-gray-500">No updates yet.</p>
                      <p className="mt-1 text-xs text-gray-400">
                        The creator hasn't posted any updates about this campaign.
                      </p>
                    </div>
                  )
                ) : (
                  campaign.updates.map((update) => (
                    <div key={update._id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                          {new Date(update.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        {isOwner && (
                          <button
                            onClick={() => handleDeleteUpdate(update._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100"
                            title="Delete this update"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <p className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                        {update.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
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
