"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
  "Technology",
  "Home",
  "Fitness",
  "Health",
  "Art",
  "Games",
  "Education",
  "Animal",
  "Environment",
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "",
    shortDescription: "",
    fullDescription: "",
    goal: "",
    duration: "30",
    imageUrl: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [slugModified, setSlugModified] = useState(false);
  const [goalError, setGoalError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "title" && !slugModified) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      }
      return newData;
    });

    if (name === "slug") {
      setSlugModified(true);
    }

    if (name === "goal" && goalError) {
      setGoalError("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setApiError("Please select a valid image file");
      return;
    }

    try {
      setUploadingImage(true);
      setApiError("");
      

      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "campaigns" })
      });
      const signData = await signRes.json();

      if (!signRes.ok) {
        throw new Error(signData.message || "Failed to get upload signature");
      }


      const formDataToSend = new FormData();
      formDataToSend.append("file", file);
      formDataToSend.append("api_key", signData.apiKey);
      formDataToSend.append("timestamp", signData.timestamp);
      formDataToSend.append("signature", signData.signature);
      if (signData.folder) {
        formDataToSend.append("folder", signData.folder);
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || "Failed to upload to Cloudinary");
      }

      setFormData(prev => ({ ...prev, imageUrl: uploadData.secure_url }));
    } catch (err: any) {
      console.error("Upload error:", err);
      setApiError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (step === 2) {
      const numericGoal = Number(formData.goal);

      if (!numericGoal || numericGoal < 100000) {
        setGoalError("Minimum funding goal is 100000.");
        return;
      }
    }

    if (step === 3) {
      try {
        setIsCreating(true);
        const response = await fetch("/api/campaigns", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
            category: formData.category,
            shortDescription: formData.shortDescription,
            fullDescription: formData.fullDescription,
            goalAmount: Number(formData.goal),
            durationDays: Number(formData.duration),
            imageUrl: formData.imageUrl,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Failed to create campaign:", data);
          setApiError(
            data?.message || "Failed to create campaign. Please try again.",
          );
          return;
        }

        console.log("Campaign created successfully:", data);
        setSubmitted(true);
        setApiError("");

        if (data?.campaign?.slug) {
          router.prefetch(`/campaigns/${data.campaign.slug}`);
        }
      } catch (error) {
        console.error("Error creating campaign", error);
        setApiError("An error occurred. Please try again.");
      } finally {
        setIsCreating(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />

          <h1 className="text-4xl font-bold text-gray-900">
            Campaign Created!
          </h1>

          <p className="text-gray-800">
            Your campaign "{formData.title}" has been created successfully.
          </p>

          <div className="bg-white border rounded-lg p-6 text-left space-y-3">
            <h3 className="font-semibold text-gray-900">Next Steps</h3>

            <ul className="space-y-2 text-gray-800">
              <li>1. Share your campaign with friends</li>
              <li>2. Post updates regularly</li>
              <li>3. Reach your funding goal</li>
            </ul>
          </div>

          <div className="flex gap-4 justify-center pt-4">
            <Link href="/explore">
              <button className="border px-4 py-2 rounded-lg">
                View Campaigns
              </button>
            </Link>

            <Link href="/">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
                Return Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto text-gray-900">

        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 md:gap-6">
            {[1, 2, 3].map((n, index) => {
              const labels = ["Campaign Info", "Details", "Review"] as const;
              const isCompleted = step > n;
              const isCurrent = step === n;

              const circleClasses =
                isCompleted || isCurrent
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-500";

              const labelClasses = isCurrent
                ? "mt-2 text-sm font-medium text-black"
                : "mt-2 text-sm text-gray-500";

              const lineActive = step > n;

              return (
                <div key={n} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${circleClasses}`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : n}
                    </div>
                    <span className={labelClasses}>{labels[n - 1]}</span>
                  </div>

                  {index < 2 && (
                    <div
                      className={`h-0.5 w-8 md:w-12 ${
                        lineActive ? "bg-green-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>


        <div className="border rounded-lg p-8 bg-white">
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {step === 1 && (
              <>
                <div className="mb-6 space-y-1">
                  <h2 className="text-3xl font-semibold text-gray-900">
                    Let&apos;s Describe Your Project
                  </h2>
                  <p className="text-sm text-gray-700">
                    Help potential backers understand what you&apos;re creating.
                  </p>
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Revolutionary AI Assistant Device"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-4 py-2 rounded-lg text-gray-900 placeholder-gray-700"
                  />
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Campaign URL Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    placeholder="e.g., ai-assistant-device"
                    value={formData.slug}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-4 py-2 rounded-lg text-gray-900 placeholder-gray-700"
                  />
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full border px-4 py-2 rounded-lg text-gray-900"
                  >
                    <option value="">Select a category</option>

                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                    <input
                      type="text"
                      name="shortDescription"
                      placeholder="One line summary of your project"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      required
                      maxLength={150}
                      className="w-full border px-4 py-2 rounded-lg text-gray-900 placeholder-gray-700"
                    />
                  <p className="text-xs text-gray-700">
                    {formData.shortDescription.length}/150
                  </p>
                </div>
              </>
            )}


            {step === 2 && (
              <>
                <div className="mb-6 space-y-1">
                  <h2 className="text-3xl font-semibold text-gray-900">
                    Campaign Details
                  </h2>
                  <p className="text-sm text-gray-700">
                    Tell backers more about your project.
                  </p>
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="fullDescription"
                    value={formData.fullDescription}
                    onChange={handleInputChange}
                    placeholder="Describe your project in detail. What will you create? Why does it matter?"
                    rows={5}
                    className="w-full border px-4 py-2 rounded-lg text-gray-900 placeholder-gray-700"
                  />
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Funding Goal (Rupees){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center w-full border rounded-lg px-4 py-2 text-gray-900 bg-white">
                    <span className="mr-2 text-gray-700">₹</span>
                    <input
                      type="number"
                      min={100000}
                      name="goal"
                      placeholder="0"
                      value={formData.goal}
                      onChange={handleInputChange}
                      className="w-full outline-none text-gray-900 placeholder-gray-700"
                    />
                  </div>
                  {goalError && (
                    <p className="text-xs text-red-600 mt-1">{goalError}</p>
                  )}
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Campaign Duration (Days){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full border px-4 py-2 rounded-lg text-gray-900"
                  >
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="45">45 days</option>
                    <option value="60">60 days</option>
                  </select>
                </div>


                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Cover Image
                  </label>
                  <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
                    {formData.imageUrl ? (
                      <div className="w-full relative h-48 md:h-64 rounded-lg overflow-hidden group">
                        <img 
                          src={formData.imageUrl} 
                          alt="Campaign cover" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                            Click to change image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 mb-3">
                          <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-600 block">Click to upload cover image</span>
                        <span className="text-xs text-gray-400 mt-1 block">JPG, PNG, GIF up to 5MB</span>
                      </div>
                    )}
                    
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
                            <span className="text-sm font-medium text-green-600">Uploading...</span>
                        </div>
                      </div>
                    )}

                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" 
                    />
                  </div>
                </div>
              </>
            )}


            {step === 3 && (
              <>
                <div className="mb-6 space-y-1">
                  <h2 className="text-3xl font-semibold text-gray-900">
                    Review Your Campaign
                  </h2>
                  <p className="text-sm text-gray-700">
                    Make sure everything looks good before launching.
                  </p>
                </div>

                <div className="border rounded-xl bg-white p-6 space-y-6">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Title</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formData.title || "-"}
                    </p>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="text-base font-semibold text-gray-900">
                      {formData.category || "-"}
                    </p>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="text-base text-gray-900 whitespace-pre-line">
                      {formData.fullDescription ||
                        formData.shortDescription ||
                        "-"}
                    </p>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Funding Goal</p>
                      <p className="text-base font-semibold text-gray-900">
                        {formData.goal ? `₹${formData.goal}` : "-"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="text-base font-semibold text-gray-900">
                        {formData.duration ? `${formData.duration} days` : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  By launching your campaign, you agree to our Terms of Service
                  and Creator Guidelines. Your campaign will be live
                  immediately.
                </div>
              </>
            )}


            <div className="flex justify-between pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={isCreating}
                  className="border px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={isCreating || uploadingImage}
                className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {step === 3
                  ? isCreating
                    ? "Creating..."
                    : "Launch Campaign"
                  : uploadingImage
                  ? "Uploading..."
                  : "Continue"}
                {step < 3 && !isCreating && !uploadingImage && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
