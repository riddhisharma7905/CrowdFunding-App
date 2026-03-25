"use client";

import Image from "next/image";
import Link from "next/link";
import CampaignCard from "./components/CampaignCard";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play, HeartHandshake, ShieldCheck, Globe2 } from "lucide-react";

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<
    {
      id: string;
      title: string;
      shortDescription: string;
      category: string;
      imageUrl: string;
      goalAmount: number;
      currentAmount: number;
      backers: number;
      deadline: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await fetch("/api/campaigns");
        if (!res.ok) {
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

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated);
        }
      } catch {
        // ignore
      }
    };

    loadCampaigns();
    checkAuth();
  }, []);

  const trendingCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => (b.backers || 0) - (a.backers || 0))
      .slice(0, 3);
  }, [campaigns]);

  return (
    <main className="bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#e8f5e9] to-[#f6fbf7] pt-24 pb-20 md:pt-32 md:pb-28 border-b border-emerald-50">
        
        {/* Background abstract curves (optional subtle decoration) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-64 -right-1/4 w-[1200px] h-[1200px] rounded-full bg-gradient-to-bl from-emerald-100/50 to-transparent blur-3xl opacity-60"></div>
          <div className="absolute top-1/2 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-100/40 to-transparent blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="max-w-2xl">
            <h1 className="text-[3.5rem] md:text-[5rem] font-bold leading-[1.05] tracking-tight mb-6 text-slate-900">
              Do Something <br className="hidden md:block"/>
              Great To <br className="hidden md:block"/>
              <span className="text-emerald-700">Help Others</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-xl">
              BackIt is a digital platform for collecting donations to be distributed to people in need. Start small, build trust, and grow something meaningful.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link href={isAuthenticated ? "/explore" : "/signin?callbackUrl=/explore"}>
                <button className="rounded-full bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">
                  Donate Now
                </button>
              </Link>
              <Link href={isAuthenticated ? "/create" : "/signin?callbackUrl=/create"}>
                <button className="flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-white px-8 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-700 transition-all">
                  Start Campaign
                  <ArrowRight size={18} className="text-emerald-600" />
                </button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-8 md:gap-14">
              <div>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">15K</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Volunteers</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">100+</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Campaigns</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 mb-1">600+</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Donors</p>
              </div>
            </div>
          </div>

          {/* Right: Abstract Graphic & Photos */}
          <div className="relative hidden lg:block h-[600px] w-full mt-10 lg:mt-0">
            {/* Center abstract circle text/graphic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center border-[6px] border-[#e8f5e9] z-20">
              <span className="text-amber-500 font-bold mb-1">Join 500+</span>
              <HeartHandshake className="text-emerald-500 w-10 h-10 mb-1" />
              <span className="text-emerald-800 font-bold">People</span>
            </div>

            {/* Dot grid lines (simulated via SVG) */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 500 500">
              <line x1="100" y1="100" x2="400" y2="400" stroke="#10B981" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="400" y1="100" x2="100" y2="400" stroke="#10B981" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="250" y1="50" x2="250" y2="450" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="50" y1="250" x2="450" y2="250" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="100" cy="100" r="4" fill="#10B981" />
              <circle cx="400" cy="400" r="4" fill="#10B981" />
              <circle cx="400" cy="100" r="4" fill="#F59E0B" />
              <circle cx="100" cy="400" r="4" fill="#F59E0B" />
            </svg>

            {/* Orbiting Images */}
            {/* Top Right */}
            <div className="absolute top-10 right-16 w-36 h-36 rounded-full overflow-hidden shadow-xl border-4 border-white z-10 hover:scale-105 transition-transform cursor-pointer">
              <img src="/hero.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>
            {/* Top Left */}
            <div className="absolute top-20 left-10 w-28 h-28 rounded-full overflow-hidden shadow-xl border-4 border-white z-10 hover:scale-105 transition-transform cursor-pointer">
              <img src="/world.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>
            {/* Bottom Right */}
            <div className="absolute bottom-16 right-24 w-40 h-40 rounded-full overflow-hidden shadow-xl border-4 border-white z-10 hover:scale-105 transition-transform cursor-pointer">
              <img src="/hero.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>
            {/* Bottom Left */}
            <div className="absolute bottom-32 left-16 w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white z-10 hover:scale-105 transition-transform cursor-pointer">
              <img src="/world.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>

            {/* Floating generic icon */}
            <div className="absolute top-1/3 left-0 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 z-30">
              <Globe2 className="text-amber-500 w-6 h-6" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT / MISSION ================= */}
      <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Images on Left */}
          <div className="relative aspect-square md:aspect-auto md:h-[600px]">
            {/* Main large circular intersection */}
            <div className="absolute inset-0 border border-slate-100 rounded-full w-[80%] h-[80%] mx-auto my-auto top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-110"></div>
            
            <div className="absolute top-0 left-0 w-[55%] h-[55%] rounded-[40px] overflow-hidden shadow-xl rounded-tr-[120px] rounded-bl-[120px]">
              <img src="/hero.jpg" alt="Volunteer" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-[55%] h-[55%] rounded-[40px] overflow-hidden shadow-xl rounded-bl-[120px] rounded-tr-[120px]">
              <img src="/world.jpg" alt="Help" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-[20%] right-0 w-[30%] h-[30%] rounded-full overflow-hidden shadow-lg border-4 border-white">
              <img src="/hero.jpg" alt="Kids" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Text on Right */}
          <div className="space-y-8">
            <div>
              <p className="text-amber-500 font-bold tracking-widest text-sm uppercase mb-4">About Us</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900 mb-6">
                Helping People In <br />
                Need Around The <br />
                World
              </h2>
              <p className="text-slate-500 leading-relaxed text-lg max-w-lg">
                We help provide necessities to help people in need around the world. We prioritize authenticity and responsible fundraising practices.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex gap-5 items-start">
                <div className="bg-red-50 p-4 rounded-2xl flex-shrink-0">
                  <HeartHandshake className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Donate</h3>
                  <p className="text-slate-500">Providing assistance in the form of money and clothing to help others.</p>
                </div>
              </div>
              
              <div className="flex gap-5 items-start">
                <div className="bg-amber-50 p-4 rounded-2xl flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Volunteer</h3>
                  <p className="text-slate-500">Providing assistance in the form of time, skills and knowledge to help others.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRENDING FUNDRAISERS ================= */}
      <section className="bg-slate-50 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900">
                Introduce Our Campaign
              </h2>
              <p className="text-slate-500 max-w-lg">
                How doing something great to help others can change the world. See what campaigns are active right now.
              </p>
            </div>

            <Link
              href="/explore"
              className="text-sm font-bold text-emerald-600 hover:text-emerald-700 whitespace-nowrap flex items-center gap-1 group"
            >
              View All <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {trendingCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="bg-white py-24 px-6 md:px-12 text-center border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-8">
            <Globe2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Participate In Charity <br className="hidden md:block" /> Around The Whole World
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
            Join our community to volunteer and help people in need around the world.
          </p>

          <Link href={isAuthenticated ? "/create" : "/signin"}>
            <button className="rounded-full bg-emerald-600 px-10 py-4 font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all text-lg">
              Become Volunteer
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
