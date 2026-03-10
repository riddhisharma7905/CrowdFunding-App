"use client";

import Link from "next/link";
import { Clock, Users, ArrowRight, Star } from "lucide-react";
import { differenceInDays } from "date-fns";

interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  deadline: Date;
}

interface FeaturedCampaignProps {
  campaign: Campaign;
}

export default function FeaturedCampaign({ campaign }: FeaturedCampaignProps) {
  const progress = Math.min(
    (campaign.currentAmount / campaign.goalAmount) * 100,
    100,
  );

  const daysLeft = differenceInDays(new Date(campaign.deadline), new Date());

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="relative overflow-hidden border-2 border-black bg-white shadow-lg">
      {/* FEATURED TAG */}
      <div className="absolute right-4 top-4 z-10">
        <div className="flex items-center gap-1.5 bg-green-600 px-3 py-1 text-xs font-bold uppercase text-white">
          <Star className="h-3.5 w-3.5 fill-current" />
          Featured
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        {/* IMAGE */}
        <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-black md:border-b-0 md:border-r-2">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          {/* CATEGORY */}
          <span className="mb-4 w-fit border border-black px-2 py-1 text-[10px] font-bold uppercase">
            {campaign.category}
          </span>

          <h2 className="mb-3 text-2xl md:text-3xl font-semibold leading-tight">
            {campaign.title}
          </h2>

          <p className="mb-6 text-sm leading-relaxed text-gray-600 line-clamp-3">
            {campaign.description}
          </p>

          {/* PROGRESS */}
          <div className="mb-6 border border-black p-4">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-3xl font-semibold">
                  {formatCurrency(campaign.currentAmount)}
                </p>
                <p className="text-xs uppercase text-gray-500">
                  of {formatCurrency(campaign.goalAmount)} goal
                </p>
              </div>
              <p className="text-4xl font-semibold text-green-600">
                {Math.round(progress)}%
              </p>
            </div>

            <div className="h-3 w-full overflow-hidden border border-black bg-gray-100">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* STATS */}
          <div className="mb-6 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border border-black">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{campaign.backers}</p>
                <p className="text-xs text-gray-500 uppercase">backers</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center border border-black">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {daysLeft > 0 ? daysLeft : 0}
                </p>
                <p className="text-xs text-gray-500 uppercase">
                  {daysLeft > 0 ? "days left" : "ended"}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/campaign/${campaign.id}`}
            className="inline-flex w-full md:w-fit items-center justify-center gap-2 border border-black px-6 py-3 text-sm font-bold uppercase transition hover:bg-black hover:text-white"
          >
            Back this project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
