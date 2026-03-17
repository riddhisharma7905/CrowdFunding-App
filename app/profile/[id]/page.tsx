"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Profile {
  id: string;
  fullName: string;
  bio: string;
  birthdate: string | null;
  gender: string | null;
  occupation: string;
  createdAt?: string;
}

interface Campaign {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!id) return;
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(`/api/profile/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Failed to load profile");
          return;
        }

        if (!active) return;

        const p = data.profile as any;
        setProfile({
          id: p.id,
          fullName: p.fullName,
          bio: p.bio || "",
          birthdate: p.birthdate || null,
          gender: p.gender || null,
          occupation: p.occupation || "",
          createdAt: p.createdAt,
        });
        setCampaigns((data.campaigns || []) as Campaign[]);
      } catch (err) {
        console.error("Error loading public profile", err);
        setError("Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (!id) return null;

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl">Loading profile...</div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto max-w-4xl space-y-4">
          <Link
            href="/explore"
            className="text-sm text-gray-500 underline-offset-4 hover:text-black hover:underline"
          >
            ← Back to campaigns
          </Link>
          <h1 className="text-2xl font-semibold">Creator not found</h1>
          <p className="text-sm text-gray-600">
            {error || "This profile could not be loaded."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 text-lg font-semibold text-gray-800">
              {profile.fullName?.[0] || "C"}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {profile.fullName}
              </h1>
              {profile.occupation && (
                <p className="text-sm text-gray-700">{profile.occupation}</p>
              )}
              {profile.gender && (
                <p className="text-xs text-gray-500 capitalize">
                  {profile.gender}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/profile/edit"
            className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100"
          >
            Edit your profile
          </Link>
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-800">
              <h2 className="mb-2 text-sm font-semibold text-gray-900">
                About {profile.fullName.split(" ")[0] || "this creator"}
              </h2>
              <p className="whitespace-pre-line">
                {profile.bio || "This creator hasn’t added a bio yet."}
              </p>
            </div>

            {profile.birthdate && (
              <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-700">
                <span className="font-semibold text-gray-900">Birthdate: </span>
                {new Date(profile.birthdate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            )}
          </div>

          <aside className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Campaigns</h2>
            {campaigns.length === 0 ? (
              <p className="text-xs text-gray-600">
                This creator hasn&apos;t launched any campaigns yet.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {campaigns.map((c) => {
                  const progress = Math.min(
                    (c.currentAmount / c.goalAmount) * 100,
                    100,
                  );
                  return (
                    <li
                      key={c.id}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-200 text-[10px] flex items-center justify-center text-gray-600">
                        Image
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="text-sm font-semibold text-gray-900 hover:underline"
                        >
                          {c.title}
                        </Link>
                        <p className="line-clamp-2 text-xs text-gray-600">
                          {c.shortDescription}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-gray-600">
                          <span>{formatCurrency(c.currentAmount)} raised</span>
                          <span>{Math.round(progress)}% funded</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
