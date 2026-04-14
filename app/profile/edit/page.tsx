"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2 } from "lucide-react";

interface Profile {
  id: string;
  fullName: string;
  email?: string;
  bio: string;
  profilePicture: string;
  birthdate: string | null;
  gender: string | null;
  occupation: string;
  city?: string;
  country?: string;
  pincode?: string;
  contactNumber?: string;
  createdAt?: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch(`/api/profile/me?t=${Date.now()}`, { cache: "no-store" });
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
          fullName: p.fullName || "Unknown",
          email: p.email,
          bio: p.bio || "",
          profilePicture: p.profilePicture || "",
          birthdate: formatDateForInput(p.birthdate),
          gender: p.gender || null,
          occupation: p.occupation || "",
          city: p.city || "",
          country: p.country || "",
          pincode: p.pincode || "",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      setProfile({ ...profile, profilePicture: data.url });
      
      // Auto-save the image if we are not in edit mode
      if (!isEditing) {
        await fetch("/api/profile/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePicture: data.url }),
        });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!profile) return;
    try {
      setUploadingImage(true);
      setError("");

      setProfile({ ...profile, profilePicture: "" });

      if (!isEditing) {
        await fetch("/api/profile/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePicture: "" }),
        });
      }
    } catch (err: any) {
      console.error("Remove image error:", err);
      setError("Failed to remove image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    // Validate pincode
    if (profile.pincode && profile.pincode.length !== 6) {
      setError("Pincode must be exactly 6 digits");
      return;
    }

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
        profilePicture: profile.profilePicture,
        birthdate: profile.birthdate,
        gender: profile.gender,
        occupation: profile.occupation,
        city: profile.city,
        country: profile.country,
        pincode: profile.pincode,
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
        const newProfile = prev
          ? {
              ...prev,
              ...data.profile,
              birthdate: formatDateForInput(data.profile?.birthdate),
            }
          : prev;
        return newProfile;
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile", err);
      setError("An unexpected error occurred while saving.");
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

  const initials = (profile.fullName || "U")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
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
              {/* Avatar Column */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div 
                  className={`relative group ${profile.profilePicture ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
                  onClick={() => {
                    if (profile.profilePicture) setIsImageModalOpen(true);
                  }}
                >
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="h-28 w-28 rounded-full object-cover border-4 border-emerald-500/20 shadow-sm"
                    />
                  ) : (
                    <div className="h-28 w-28 rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold shadow-sm border-4 border-white">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Explicit Upload & Remove Buttons */}
                <div className="flex flex-col items-center gap-2 w-full mt-1">
                  <label className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full cursor-pointer hover:bg-emerald-100 transition-colors border border-emerald-200 shadow-[0_2px_4px_rgba(16,185,129,0.1)] flex items-center gap-1.5 tracking-wide">
                    {uploadingImage ? "Processing..." : "Upload Photo"}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>

                  {profile.profilePicture && (
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={uploadingImage}
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
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
                      {((profile.city || profile.country) || memberSinceDate) && " · "}
                    </>
                  )}
                  {(profile.city || profile.country) && (
                    <>
                      {[profile.city, profile.country].filter(Boolean).join(", ")}
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
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={profile.city || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="New Delhi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={profile.country || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={profile.pincode || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setProfile({ ...profile, pincode: value });
                    }}
                    disabled={!isEditing}
                    maxLength={6}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
                    placeholder="6 digit pincode"
                  />
                  {isEditing &&
                    profile.pincode &&
                    profile.pincode.length !== 6 && (
                      <p className="mt-1 text-xs text-red-600">
                        Pincode must be exactly 6 digits
                      </p>
                    )}
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
                  placeholder="Environmental activist and product designer. I believe technology can heal the planet... "
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

      {/* Lightbox Modal */}
      {isImageModalOpen && profile?.profilePicture && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm transition-opacity"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-h-full max-w-full group">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-emerald-400 transition-colors p-2"
              onClick={() => setIsImageModalOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <img 
              src={profile.profilePicture} 
              alt={profile.fullName} 
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </main>
  );
}
