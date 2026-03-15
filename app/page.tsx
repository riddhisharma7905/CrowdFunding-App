"use client";

import Image from "next/image";
import Link from "next/link";
import CampaignCard from "./components/CampaignCard";
import {
  ArrowRight,
  Shield,
  Users,
  Rocket,
  Heart,
  Clock,
  Share2,
} from "lucide-react";

export default function HomePage() {
  const trendingCampaigns = [
    {
      id: "1",
      title:
        "Rewrite Sanskriti Shrivastava's Cancer Diagnosis Into a Survivor Story",
      shortDescription:
        "Support Sanskriti's treatment and help her rewrite her cancer diagnosis into a story of strength and survival.",
      category: "Medical",
      imageUrl: "/hero.jpg",
      goalAmount: 3000000,
      currentAmount: 1725980,
      backers: 618,
      // simple placeholder deadline in the future
      deadline: "2026-12-31",
    },
    {
      id: "2",
      title: "Give My Son, Bob, a Second Chance at Life After a Grade 3 Tumour",
      shortDescription:
        "Help Bob access life-saving treatment and give him a second chance at life.",
      category: "Medical",
      imageUrl: "/hero.jpg",
      goalAmount: 7000000,
      currentAmount: 1190881,
      backers: 838,
      deadline: "2026-12-31",
    },
    {
      id: "3",
      title: "Help Save My Mother From the Clutches of a Brain Stroke!",
      shortDescription:
        "Your contribution will support critical care and rehabilitation after a severe brain stroke.",
      category: "Emergency",
      imageUrl: "/hero.jpg",
      goalAmount: 2500000,
      currentAmount: 883294,
      backers: 1023,
      deadline: "2026-12-31",
    },
  ];

  return (
    <main className="bg-black text-white">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen w-full overflow-hidden">
        {/* Background Image */}
        <Image
          src="/hero.jpg"
          alt="Crowdfunding impact"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/65" />

        {/* Content */}
        <div className="relative z-10 flex min-h-screen items-center px-8 md:px-20">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <p className="mb-6 text-xs tracking-[0.35em] text-green-400 uppercase">
              Effortless Giving · Impactful Results
            </p>

            {/* Headline */}
            <h1
              className="text-[3.8rem] md:text-[5.2rem] lg:text-[6.2rem]
               font-light leading-[1.02] tracking-[-0.03em] mb-8"
            >
              A smarter way <br />
              to <span className="text-green-400 font-normal">
                fund ideas
              </span>{" "}
              <br />
              online
            </h1>

            <p
              className="text-lg md:text-xl font-light text-gray-200 
              max-w-xl leading-relaxed mb-10"
            >
              BackIt helps creators raise funds through transparent, goal-based
              crowdfunding powered by community trust.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link href="/create">
                <button className="group inline-flex items-center gap-2 rounded-md bg-green-600 px-8 py-4 text-sm font-medium text-white hover:bg-green-700 transition">
                  Start a Campaign
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href="/signin">
                <button className="rounded-md border border-white/50 px-8 py-4 text-sm font-medium text-white hover:bg-white hover:text-black transition">
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-black py-28 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">
            Built for trust. Designed for impact.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <Shield className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Verified Campaigns</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                We prioritize authenticity and responsible fundraising
                practices.
              </p>
            </div>

            <div>
              <Users className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">Community Driven</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Back ideas you believe in and support creators directly,
                transparently, and responsibly.
              </p>
            </div>

            <div>
              <Rocket className="h-8 w-8 text-green-600 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Designed for Momentum
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Structured timelines and goal tracking that keep campaigns
                moving forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-white text-black pt-16 pb-10 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-14 leading-tight">
            Start a Fundraiser in three simple steps
          </h2>

          <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12 items-start">
            {/* Steps on the left */}
            <div className="space-y-10">
              {/* Step 1 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-white text-xs font-semibold text-green-600">
                    1
                  </div>
                  <div className="mt-2 h-24 w-px bg-gray-200" />
                </div>

                <h3 className="text-lg font-medium mb-2">
                  Start your fundraiser
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  It takes only a couple of minutes. Share a few details about
                  yourself and who you&apos;re raising funds for.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-white text-xs font-semibold text-green-600">
                    2
                  </div>
                  <div className="mt-2 h-24 w-px bg-gray-200" />
                </div>

                <h3 className="text-lg font-medium mb-2">
                  Share your fundraiser
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Share your campaign with friends, family, and your community.
                  As more people see it, the support starts pouring in.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-0 flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-white text-xs font-semibold text-green-600">
                    3
                  </div>
                </div>

                <h3 className="text-lg font-medium mb-2">Withdraw funds</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  Once donations start coming in, withdraw funds securely and
                  directly to your bank account without hassle.
                </p>
              </div>
            </div>

            {/* Vertical image on the right */}
            <div className="flex justify-end md:-mt-10">
              <img
                src="/world.jpg"
                alt="Global impact of fundraisers"
                className="h-[420px] md:h-[520px] w-auto object-contain block rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>
      {/* ================= TRENDING FUNDRAISERS ================= */}
      <section className="bg-white text-black pt-2 pb-10 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
                Trending Fundraisers
              </h2>
              <p className="text-gray-600 max-w-xl">
                View the fundraisers that are most active and gaining support
                from the community right now.
              </p>
            </div>

            <div className="hidden md:flex gap-3 text-sm text-gray-500">
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/80 hover:bg-white transition">
                <span className="sr-only">Previous</span>
                <span className="-ml-[2px] text-lg">&#8249;</span>
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white/80 hover:bg-white transition">
                <span className="sr-only">Next</span>
                <span className="ml-[2px] text-lg">&#8250;</span>
              </button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {trendingCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white text-black py-16 px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-light mb-6">
          Ready to bring your idea to life?
        </h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
          Start small, build trust, and grow something meaningful with BackIt.
        </p>

        <Link href="/signin">
          <button className="rounded-md bg-green-600 px-10 py-4 text-sm font-medium text-white hover:bg-green-700 transition">
            Get Started
          </button>
        </Link>
      </section>
    </main>
  );
}
