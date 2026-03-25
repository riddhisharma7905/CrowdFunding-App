"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Save, X } from "lucide-react";

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

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
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
          location: p.location || "",
          contactNumber: p.contactNumber || "",
          createdAt: p.createdAt,
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

      if (!res.ok) {
        setError(data?.message || "Failed to save profile");
        return;
      }

      setProfile((prev) => {
        return prev
          ? {
              ...prev,
              ...data.profile,
              birthdate: data.profile?.birthdate || null,
            }
          : prev;
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
      <main className="min-h-screen bg-[#F8FAFC] flex justify-center items-center text-slate-500 font-sans">
        Loading profile...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex justify-center items-center text-slate-500 font-sans">
        Unable to load profile.
      </main>
    );
  }

  // To simulate the reference design's "Avatar" with a 
  // photographic look, we'll use a gradient placeholder 
  // if no real image exists (since we don't have avatar uploads yet).
  const initials = profile.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Common input styling based on reference image
  const inputClassName = `w-full rounded-xl border px-4 py-3 text-[15px] placeholder:text-slate-400 focus:outline-none transition-colors ${
    isEditing 
      ? "bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
      : "bg-slate-50/50 border-transparent text-slate-600 cursor-default pointer-events-none"
  }`;
  
  const labelClassName = "block text-sm text-slate-500 mb-2";

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-12 md:py-20 font-sans">
      <div className="mx-auto max-w-[850px] bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sm:p-12">
        
        {/* HEADER AREA */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6">Profile Information</h1>
            
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{profile.fullName}</h2>
                <p className="text-sm text-slate-500 mt-1">{profile.occupation || "Member"}</p>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-full bg-indigo-600 text-white px-6 py-2.5 text-sm font-medium hover:bg-indigo-700 hover:shadow-md transition-all sm:mt-0"
            >
              <Edit2 size={16} />
              Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setError("");
              }}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white text-slate-600 px-6 py-2.5 text-sm font-medium hover:bg-slate-50 transition-all sm:mt-0"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* PERSONAL DETAILS */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Personal Details
            </h3>

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClassName}>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClassName}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className={labelClassName}>Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-xl border border-transparent px-4 py-3 text-[15px] bg-slate-50/50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className={labelClassName}>Phone</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={profile.contactNumber || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setProfile({ ...profile, contactNumber: value });
                  }}
                  disabled={!isEditing}
                  maxLength={10}
                  className={inputClassName}
                  placeholder="+1-000-000-0000"
                />
              </div>

              <div>
                <label className={labelClassName}>Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={profile.occupation}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClassName}
                  placeholder="e.g. Designer, Engineer..."
                />
              </div>

              <div>
                <label className={labelClassName}>Gender</label>
                <select
                  name="gender"
                  value={profile.gender || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClassName}
                >
                  <option value="" disabled hidden>Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className={labelClassName}>Date of Birth</label>
                <input
                  type="date"
                  name="birthdate"
                  value={profile.birthdate ? profile.birthdate.slice(0, 10) : ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClassName}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClassName}>Bio</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`${inputClassName} resize-none`}
                  placeholder="Tell us a little about yourself"
                />
              </div>
            </div>
          </div>

          {/* LOCATION DETAILS */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
              Location Details
            </h3>

            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClassName}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={inputClassName}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS (Only visible when editing) */}
          {isEditing && (
            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={
                  saving ||
                  !!(profile.contactNumber && profile.contactNumber.length !== 10)
                }
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-[15px] font-medium text-white shadow-sm hover:bg-indigo-700 hover:shadow-md disabled:opacity-50 disabled:hover:bg-indigo-600 disabled:hover:shadow-sm transition-all"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
