"use client";

import { useEffect, useMemo, useState } from "react";
import CampaignCard from "@/app/components/CampaignCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

const categories = [
  "All",
  "Technology",
  "Home",
  "Food",
  "Fitness",
  "Health",
  "Art",
  "Music",
  "Games",
];

type Campaign = {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  deadline: string;
  createdAt?: string;
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) {
          console.error("Failed to load campaigns");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setCampaigns(data.campaigns || []);
      } catch (error) {
        console.error("Error loading campaigns", error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.shortDescription.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    switch (sortBy) {
      case "funded":
        filtered.sort((a, b) => b.currentAmount - a.currentAmount);
        break;
      case "ending":
        filtered.sort(
          (a, b) =>
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
        );
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0),
        );
        break;
      case "trending":
      default:
        filtered.sort((a, b) => b.backers - a.backers);
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 via-white to-white text-black">
      {/* Header */}
      <section className="px-4 pt-12 pb-6">
        <div className="mx-auto max-w-6xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Explore Projects
          </h1>
          <p className="max-w-2xl text-sm text-gray-600 md:text-base">
            Discover innovative projects and support the ideas you believe in.
          </p>
        </div>
      </section>

      {/* Search, sort, categories */}
      <section className="px-4 pb-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-gray-50 px-11 py-2.5 text-sm outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
              />
            </div>

            {/* Sort tabs */}
            <div className="flex items-center gap-2 text-xs md:text-sm">
              <button
                onClick={() => setSortBy("trending")}
                className={`rounded-full px-4 py-1.5 font-medium transition ${
                  sortBy === "trending"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`rounded-full px-4 py-1.5 font-medium transition ${
                  sortBy === "newest"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("ending")}
                className={`rounded-full px-4 py-1.5 font-medium transition ${
                  sortBy === "ending"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Ending Soon
              </button>
              <button
                onClick={() => setSortBy("funded")}
                className={`rounded-full px-4 py-1.5 font-medium transition ${
                  sortBy === "funded"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Most Funded
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium md:text-sm ${
                  selectedCategory === cat
                    ? "border-green-600 bg-green-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-black">
                {filteredCampaigns.length}
              </span>{" "}
              projects found
            </p>

            {(searchQuery || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSortBy("trending");
                }}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black md:text-sm"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">
              Loading campaigns...
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500">
              No campaigns found
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
