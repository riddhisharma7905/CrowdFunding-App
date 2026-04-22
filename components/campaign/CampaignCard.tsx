"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  // Determine if campaign has ended (deadline passed or status is completed/cancelled)
  const isEnded =
    campaign.status === "completed" ||
    campaign.status === "cancelled" ||
    new Date(campaign.deadline) < new Date();

  return (
    <Link href={`/campaigns/${campaign.id}`} className="block h-full group">
      <div className={`h-full rounded-2xl border bg-white overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 flex flex-col ${isEnded ? "border-slate-200 opacity-80" : "border-slate-100"}`}>
        {/* IMAGE AREA */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={!campaign.imageUrl || campaign.imageUrl === "/hero.jpg" ? "/world.jpg" : campaign.imageUrl}
            alt={campaign.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isEnded ? "grayscale-[30%]" : ""}`}
            onError={(e) => { e.currentTarget.src = "/world.jpg"; }}
          />
          {/* Category Tag */}
          <div className="absolute top-4 left-4 bg-white shadow-sm text-[10px] font-bold tracking-wider text-emerald-600 px-3 py-1.5 rounded-full uppercase">
            {campaign.category}
          </div>
          {/* Ended Badge */}
          {isEnded && (
            <div className="absolute top-4 right-4 bg-slate-800 text-white text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full uppercase shadow-sm">
              Ended
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 flex flex-1 flex-col">
          <h3 className="font-bold text-lg md:text-xl text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {campaign.title}
          </h3>

          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
            {campaign.shortDescription}
          </p>

          <div className="mt-auto space-y-4">
            {/* PROGRESS BAR */}
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-400">
                {Math.round(progress)}%
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isEnded ? "bg-slate-400" : "bg-emerald-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs pt-1 pb-4 border-b border-slate-50">
              <div className="font-medium">
                <span className="text-slate-400 mr-1">Raised:</span>
                <span className={isEnded ? "text-slate-500" : "text-orange-500"}>{formatCurrency(campaign.currentAmount)}</span>
              </div>
              <div className="font-medium">
                <span className="text-slate-400 mr-1">Goal:</span>
                <span className="text-emerald-600">{formatCurrency(campaign.goalAmount)}</span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            {isEnded ? (
              <div className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-default select-none">
                Campaign Ended
              </div>
            ) : (
              <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                Support Project
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}