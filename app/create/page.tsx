"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const categories = [
  "Technology",
  "Home",
  "Food",
  "Fitness",
  "Health",
  "Art",
  "Music",
  "Games",
  "Education",
];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    shortDescription: "",
    fullDescription: "",
    goal: "",
    duration: "30",
  });

  const [submitted, setSubmitted] = useState(false);
  const [goalError, setGoalError] = useState("");

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "goal" && goalError) {
      setGoalError("");
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
        const response = await fetch("/api/campaigns", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            shortDescription: formData.shortDescription,
            fullDescription: formData.fullDescription,
            goalAmount: Number(formData.goal),
            durationDays: Number(formData.duration),
          }),
        });

        if (!response.ok) {
          console.error("Failed to create campaign");
          return;
        }

        const data = await response.json();
        setSubmitted(true);

        if (data?.campaign?.id) {
          router.prefetch(`/campaigns/${data.campaign.id}`);
        }
      } catch (error) {
        console.error("Error creating campaign", error);
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
        {/* Progress */}
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

        {/* Card */}
        <div className="border rounded-lg p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1 */}
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

                {/* Project Title */}
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

                {/* Category */}
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

                {/* Short Description */}
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
                    className="w-full border px-4 py-2 rounded-lg text-gray-900 placeholder-gray-700"
                  />
                  <p className="text-xs text-gray-700">
                    {formData.shortDescription.length}/100
                  </p>
                </div>
              </>
            )}

            {/* STEP 2 */}
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

                {/* Full Description */}
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

                {/* Funding Goal */}
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

                {/* Duration */}
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
              </>
            )}

            {/* STEP 3 */}
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

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="border px-4 py-2 rounded-lg"
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                {step === 3 ? "Launch Campaign" : "Continue"}
                {step < 3 && <ArrowRight size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
