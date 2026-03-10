"use client";

import Link from "next/link";
import { Clock, Users, TrendingUp } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  deadline: Date;
  status: "ACTIVE" | "SUCCESS" | "FAILED" | "DRAFT";
}

interface CampaignCardProps {
  campaign: Campaign;
  variant?: "default" | "dark";
}

export default function CampaignCard({
  campaign,
  variant = "default",
}: CampaignCardProps) {
  const progress = Math.min(
    (campaign.currentAmount / campaign.goalAmount) * 100,
    100,
  );

  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());
  const isEnding = daysLeft <= 3 && daysLeft > 0;
  const hasEnded = daysLeft <= 0;
  const isDark = variant === "dark";

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "Rupees",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Link href={`/campaign/${campaign.id}`} className="group block">
      <article
        className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
          isDark
            ? "bg-zinc-900 border border-zinc-800"
            : "bg-white border border-gray-200 hover:shadow-lg"
        }`}
      >
        {/* IMAGE */}
        <div className="relative aspect-16/10 overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* TAGS */}
          <div className="absolute top-3 left-3 flex gap-2 text-[10px] font-semibold">
            <span className="rounded-full bg-white/90 px-2 py-1 text-black">
              {campaign.category}
            </span>

            {campaign.status === "SUCCESS" && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-400">
                ✓ Funded
              </span>
            )}

            {campaign.status === "FAILED" && (
              <span className="rounded-full bg-red-500/20 px-2 py-1 text-red-400">
                Ended
              </span>
            )}

            {isEnding && (
              <span className="rounded-full bg-amber-500/20 px-2 py-1 text-amber-400">
                Ending Soon
              </span>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-5">
          <h3
            className={`mb-2 line-clamp-2 text-lg font-semibold transition-colors ${
              isDark
                ? "text-white group-hover:text-emerald-400"
                : "text-gray-900 group-hover:text-green-600"
            }`}
          >
            {campaign.title}
          </h3>

          <p
            className={`mb-4 line-clamp-2 text-sm ${
              isDark ? "text-white/60" : "text-gray-600"
            }`}
          >
            {campaign.shortDescription}
          </p>

          {/* PROGRESS */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-lg font-semibold">
                  {Math.round(progress)}%
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatCurrency(campaign.goalAmount)} goal
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* STATS */}
          <div className="flex items-center justify-between border-t pt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="font-medium text-gray-900">
                {campaign.backers}
              </span>
              backers
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-gray-900">
                {hasEnded ? 0 : daysLeft}
              </span>
              {hasEnded ? "ended" : "days left"}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
