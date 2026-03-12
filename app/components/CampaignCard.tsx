"use client";

import Link from "next/link";
import { Clock, Users, TrendingUp } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  deadline: string;
  status?: string;
}

interface Props {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: Props) {
  const progress = Math.min(
    (campaign.currentAmount / campaign.goalAmount) * 100,
    100,
  );

  const daysLeft = Math.max(
    Math.ceil(
      (new Date(campaign.deadline).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
    0,
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="rounded-xl border overflow-hidden bg-white hover:shadow-lg transition cursor-pointer">
        {/* IMAGE */}
        <div className="relative aspect-[16/10]">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />

          <div className="absolute top-3 left-3 bg-white/90 text-sm px-2 py-1 rounded">
            {campaign.category}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-2">
            {campaign.title}
          </h3>

          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {campaign.shortDescription}
          </p>

          {/* PROGRESS */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <TrendingUp size={14} />
                {Math.round(progress)}%
              </span>

              <span className="text-gray-500">
                {formatCurrency(campaign.goalAmount)} goal
              </span>
            </div>

            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* STATS */}
          <div className="flex justify-between text-sm text-gray-500 border-t pt-3">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span className="font-semibold text-black">
                {campaign.backers}
              </span>
              backers
            </div>

            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span className="font-semibold text-black">{daysLeft}</span>
              days left
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
