"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  fullName: string;
  email?: string;
  bio: string;
  birthdate: string | null;
  gender: string | null;
  occupation: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [profile, setProfile] = useState<Profile | null>(null);

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
        });
      } catch (err) {
        console.error("Error loading profile", err);
        setError("Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
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

    try {
      setSaving(true);
      setError("");

      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          bio: profile.bio,
          birthdate: profile.birthdate,
          gender: profile.gender,
          occupation: profile.occupation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Failed to save profile");
        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ...data.profile,
              birthdate: data.profile.birthdate || null,
            }
          : prev,
      );
    } catch (err) {
      console.error("Error saving profile", err);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl">Loading profile...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-black">
        <div className="mx-auto max-w-3xl">Unable to load profile.</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black md:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Your Profile
          </h1>
          <p className="text-sm text-gray-600">
            Tell backers more about who you are and what you do.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900">
              About you
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
              placeholder="Share a short bio so backers can get to know you."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">
                Birthdate
              </label>
              <input
                type="date"
                name="birthdate"
                value={profile.birthdate ? profile.birthdate.slice(0, 10) : ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">
                Sex / gender
              </label>
              <select
                name="gender"
                value={profile.gender || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-900">
                What do you do?
              </label>
              <input
                type="text"
                name="occupation"
                value={profile.occupation}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100"
                placeholder="Designer, engineer, student..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              Skip for now
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
