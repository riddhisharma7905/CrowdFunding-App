"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Users, Rocket, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {/* HERO SECTION */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-500 rounded-full mix-blend-screen opacity-20 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-400 rounded-full mix-blend-screen opacity-10 blur-3xl"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-900/50 border border-green-700/50 text-green-300 mb-8 text-sm font-semibold backdrop-blur">
            <Sparkles className="h-4 w-4" />
            The future of crowdfunding is here
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Fund the future,{" "}
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              one idea at a time
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            BackIt empowers creators to launch bold ideas and communities to
            bring them to life. Build something amazing with us.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/create">
              <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-black rounded-lg font-bold hover:from-green-500 hover:to-green-400 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-green-500/50 hover:shadow-2xl transform hover:scale-105">
                Start Your Campaign
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>

            <Link href="/explore">
              <button className="px-8 py-4 border-2 border-green-600 text-green-400 rounded-lg font-bold hover:bg-green-900/30 transition-all duration-300 hover:border-green-500 backdrop-blur">
                Explore Projects
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-16 text-center">
            Why choose BackIt?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-green-900/40 to-black border border-green-700/50 p-8 rounded-2xl hover:border-green-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 text-black font-bold" />
              </div>
              <h3 className="font-bold text-white mb-3 text-lg">
                All-or-Nothing Funding
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Funds are collected only if the campaign reaches its goal. Your
                idea stays protected.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-green-900/40 to-black border border-green-700/50 p-8 rounded-2xl hover:border-green-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-black font-bold" />
              </div>
              <h3 className="font-bold text-white mb-3 text-lg">
                Community Driven
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Support ideas you believe in and help creators succeed together
                in a vibrant community.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-green-900/40 to-black border border-green-700/50 p-8 rounded-2xl hover:border-green-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
              <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="h-7 w-7 text-black font-bold" />
              </div>
              <h3 className="font-bold text-white mb-3 text-lg">
                Launch in Minutes
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Simple, intuitive workflow to get your campaign live faster than
                ever before.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-6 border-t border-green-900/50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-black text-green-400 mb-2">50K+</h3>
            <p className="text-gray-400">Active Creators</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-green-400 mb-2">$500M+</h3>
            <p className="text-gray-400">Funds Raised</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-green-400 mb-2">95%</h3>
            <p className="text-gray-400">Success Rate</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-green-400 mb-2">180+</h3>
            <p className="text-gray-400">Countries Supported</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Your idea deserves to be heard
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Join a global community of creators, backers, and changemakers.
            Start your campaign today and watch your dreams become reality.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/create">
              <button className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 text-black font-bold rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-lg hover:shadow-green-500/50 hover:shadow-2xl transform hover:scale-105 inline-flex items-center gap-2">
                Start Free Campaign
                <Zap className="h-5 w-5" />
              </button>
            </Link>

            <Link href="/explore">
              <button className="px-10 py-4 border-2 border-green-600 text-green-400 font-bold rounded-lg hover:bg-green-900/20 transition-all duration-300 backdrop-blur">
                Explore Success Stories
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
