"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Users } from "lucide-react";

interface Profile {
  id: string;
  fullName: string;
  email?: string;
  bio: string;
  birthdate: string | null;
  gender: string | null;
  occupation: string;
  location?: string;
  contactNumber?: string;
  createdAt?: string;
}

interface Stats {
  totalFollowers: number;
  totalCampaigns: number;
  totalRaised: number;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadStats = async () => {
    try {
      // Get user profile with stats
      const profileRes = await fetch("/api/profile/me", {
        cache: "no-store",
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const userProfile = profileData.profile;

        // Get creator stats
        const statsRes = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        let creatorStats = {
          totalRaised: 0,
          activeCampaigns: 0,
        };

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          creatorStats = {
            totalRaised: statsData?.totals?.totalRaised || 0,
            activeCampaigns: statsData?.totals?.activeCampaigns || 0,
          };
        }

        setStats({
          totalFollowers: userProfile.followers || 0,
          totalCampaigns: creatorStats.activeCampaigns,
          totalRaised: creatorStats.totalRaised,
        });
      }
    } catch (err) {
      console.error("Error loading stats", err);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/profile/me", { cache: "no-store" });
        if (res.status === 401) {
          router.push("/signin");
          return;
        }

        if (!res.ok) {
          setError("Failed to load profile");
          return;
        }

        const data = await res.json();
        if (!active) return;

        const p = data.profile as any;
        setProfile({
          id: p.id,
          fullName: p.fullName || "",
          email: p.email,
          bio: p.bio || "",
          birthdate: p.birthdate || null,
          gender: p.gender || null,
          occupation: p.occupation || "",
          location: p.location || "",
          contactNumber: p.contactNumber || "",
          createdAt: p.createdAt,
        });

        // Load stats
        if (active) {
          await loadStats();
        }
      } catch (err) {
        console.error("Error loading profile", err);
        setError("Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    // Add focus listener to refresh stats when page regains focus
    const handleFocus = () => {
      loadStats();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validate contact number
    if (profile.contactNumber && profile.contactNumber.length !== 10) {
      setError("Contact number must be exactly 10 digits");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        fullName: profile.fullName,
        bio: profile.bio,
        birthdate: profile.birthdate,
        gender: profile.gender,
        occupation: profile.occupation,
        location: profile.location,
        contactNumber: profile.contactNumber,
      };

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("Save response status:", res.status);
      console.log("Save response data:", data);
      console.log("Save response profile:", data?.profile);

      if (!res.ok) {
        setError(data?.message || "Failed to save profile");
        return;
      }

      console.log("Before update - profile state:", profile);

      setProfile((prev) => {
        const newProfile = prev
          ? {
              ...prev,
              ...data.profile,
              birthdate: data.profile?.birthdate || null,
            }
          : prev;
        console.log("After update - new profile state:", newProfile);
        return newProfile;
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">Loading profile...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">Unable to load profile.</div>
      </main>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSinceDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
      })
    : "";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* PROFILE HEADER */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="h-28 w-28 rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold">
                  {initials}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 pt-2">
                <h1 className="text-3xl font-bold text-slate-900">
                  {profile.fullName}
                </h1>
                <p className="text-slate-600 mt-1">{profile.email}</p>
                <p className="text-sm text-slate-500 mt-3">
                  {profile.occupation && (
                    <>
                      {profile.occupation}
                      {(profile.location || memberSinceDate) && " · "}
                    </>
                  )}
                  {profile.location && (
                    <>
                      {profile.location}
                      {memberSinceDate && " · "}
                    </>
                  )}
                  {memberSinceDate && <>Member since {memberSinceDate}</>}
                </p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        {stats && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Your Stats
            </h3>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                    Followers
                  </p>
                </div>
                <p className="mt-3 text-3xl font-bold text-emerald-900">
                  {stats.totalFollowers}
                </p>
                <p className="mt-1 text-xs text-emerald-700">people following you</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                  Total Campaigns
                </p>
                <p className="mt-3 text-3xl font-bold text-emerald-900">
                  {stats.totalCampaigns}
                </p>
                <p className="mt-1 text-xs text-emerald-700">campaigns created</p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 shadow-sm">
                <p className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
                  Total Raised
                </p>
                <p className="mt-3 text-3xl font-bold text-emerald-900">
                  ₹{stats.totalRaised.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-emerald-700">funded by backers</p>
              </div>
            </div>
          </div>
        )}

        {/* FORM */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-5 w-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Personal information
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-600 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={profile.location || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="Delhi, India"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={profile.contactNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setProfile({ ...profile, contactNumber: value });
                    }}
                    disabled={!isEditing}
                    maxLength={10}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="10 digit number"
                  />
                  {isEditing &&
                    profile.contactNumber &&
                    profile.contactNumber.length !== 10 && (
                      <p className="mt-1 text-xs text-red-600">
                        Contact number must be exactly 10 digits
                      </p>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Bio (max 500 characters)
                </label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={5}
                  maxLength={500}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 resize-none disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                  placeholder="Environmental activist and product designer. I believe technology can heal the planet. Founder of Ocean Plastic Housing — turning coastal waste into shelter."
                />
                <p className="mt-2 text-right text-xs text-slate-500">
                  {profile.bio.length} / 500
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Birthdate
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={
                      profile.birthdate ? profile.birthdate.slice(0, 10) : ""
                    }
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={profile.gender || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={profile.occupation}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="Designer, engineer, student..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                }}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving ||
                  !!(
                    profile.contactNumber && profile.contactNumber.length !== 10
                  )
                }
                className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400 transition"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
