"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

type Campaign = {
  id: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  goalAmount: number;
  imageUrl?: string;
  owner?: string;
};

type User = {
  id: string;
  fullName: string;
  email: string;
};

const categories = [
  "Technology",
  "Home",
  "Food",
  "Fitness",
  "Health",
  "Art",
  "Music",
  "Games",
  "Education",
];

export default function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const campaignId = params?.id as string | undefined;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    shortDescription: "",
    fullDescription: "",
    goalAmount: "",
  });

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

        // Check ownership
        if (c.owner !== userId) {
          setError("You don't have access to edit this campaign");
          setTimeout(() => router.push("/dashboard"), 2000);
          setLoading(false);
          return;
        }

        setCampaign({
          id: c.id,
          title: c.title,
          category: c.category,
          shortDescription: c.shortDescription,
          fullDescription: c.fullDescription,
          goalAmount: c.goalAmount,
          imageUrl: c.imageUrl,
          owner: c.owner,
        });

        // Set form data
        setFormData({
          title: c.title,
          category: c.category,
          shortDescription: c.shortDescription,
          fullDescription: c.fullDescription,
          goalAmount: c.goalAmount,
        });
      } catch (err: any) {
        console.error("Error loading campaign", err);
        setError(err.message || "Unable to load campaign");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [campaignId]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign) return;

    if (!formData.title.trim()) {
      setError("Campaign title is required");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (!formData.shortDescription.trim()) {
      setError("Short description is required");
      return;
    }

    if (!formData.fullDescription.trim()) {
      setError("Full description is required");
      return;
    }

    if (!formData.goalAmount) {
      setError("Goal amount is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          shortDescription: formData.shortDescription,
          fullDescription: formData.fullDescription,
          goalAmount: Number(formData.goalAmount),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update campaign");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/campaigns/${campaign.id}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error updating campaign", err);
      setError(err.message || "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  if (!campaignId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading campaign...</p>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-600">{error}</p>
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

  if (!campaign) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit Campaign
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-2 text-sm text-emerald-700">
              <Check size={16} />
              Campaign updated successfully!
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Campaign Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter campaign title"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="text-xs text-slate-500">
                {formData.title.length}/100 characters
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Short Description
              </label>
              <textarea
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                placeholder="Brief one-line description of your campaign"
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
              />
              <p className="text-xs text-slate-500">
                {formData.shortDescription.length}/150 characters
              </p>
            </div>

            {/* Full Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Full Description
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleInputChange}
                placeholder="Detailed description of your campaign, project details, goals, etc."
                rows={6}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
              />
              <p className="text-xs text-slate-500">
                {formData.fullDescription.length}/5000 characters
              </p>
            </div>

            {/* Goal Amount */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-900">
                Funding Goal (₹)
              </label>
              <input
                type="number"
                name="goalAmount"
                value={formData.goalAmount}
                onChange={handleInputChange}
                placeholder="Enter goal amount"
                min="1"
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <p className="text-xs text-slate-500">
                Note: Changing the goal amount will not affect existing pledges
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
