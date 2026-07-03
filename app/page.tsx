"use client";

import Image from "next/image";
import Link from "next/link";
import CampaignCard from "@/components/campaign/CampaignCard";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play, HeartHandshake, ShieldCheck, Globe2, Target, Share2, Banknote } from "lucide-react";

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
      {}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#e8f5e9] to-[#f6fbf7] pt-24 pb-20 md:pt-32 md:pb-28 border-b border-emerald-50">
        
        {}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-64 -right-1/4 w-[1200px] h-[1200px] rounded-full bg-gradient-to-bl from-emerald-100/50 to-transparent blur-3xl opacity-60"></div>
          <div className="absolute top-1/2 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-amber-100/40 to-transparent blur-3xl opacity-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-16 items-center">
          
          {}
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

            {}
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

          {}
          <div className="relative hidden lg:block h-[600px] w-full mt-10 lg:mt-0">
            
            {}
            <svg className="absolute inset-0 w-full h-full opacity-60 z-0" viewBox="0 0 600 600">
              {}
              {[...Array(8)].map((_, i) => (
                [...Array(8)].map((_, j) => (
                  <circle 
                    key={`${i}-${j}`} 
                    cx={i * 80 + 30} 
                    cy={j * 80 + 30} 
                    r={(i+j)%2 === 0 ? 3 : 4} 
                    fill={(i*j)%3 === 0 ? "#10B981" : "#F59E0B"} 
                    opacity={((i+j)%4 + 2) / 10} 
                  />
                ))
              ))}
              
              {}
              <rect x="300" y="120" width="40" height="8" rx="4" fill="#F59E0B" opacity="0.6" />
              <rect x="450" y="350" width="30" height="8" rx="4" fill="#10B981" opacity="0.6" />
              <rect x="180" y="480" width="50" height="8" rx="4" fill="#F59E0B" opacity="0.5" />
              <rect x="220" y="220" width="30" height="8" rx="4" transform="rotate(90 220 220)" fill="#10B981" opacity="0.6" />
              <rect x="320" y="420" width="40" height="8" rx="4" fill="#F59E0B" opacity="0.5" />
            </svg>

            {}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#EBAE69] shadow-xl flex flex-col items-center justify-center z-30">
              <div className="absolute inset-x-0 inset-y-0 w-full h-full animate-[spin_30s_linear_infinite]">
                 {}
                 <span className="absolute top-4 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-800 uppercase tracking-widest">Join</span>
                 <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-800 uppercase tracking-widest">Donate</span>
                 <span className="absolute top-1/2 right-4 -translate-y-1/2 translate-x-3 rotate-90 text-sm font-bold text-slate-800 uppercase tracking-widest">500+</span>
                 <span className="absolute top-1/2 left-4 -translate-y-1/2 -translate-x-3 -rotate-90 text-sm font-bold text-slate-800 uppercase tracking-widest">People</span>
              </div>
              
              <div className="w-16 h-16 rounded-full bg-[#D1E5DE] flex items-center justify-center relative z-10 shadow-inner">
                <HeartHandshake className="text-emerald-700 w-8 h-8" />
              </div>
            </div>

            {}
            {}
            <div className="absolute top-12 left-32 w-28 h-28 rounded-full overflow-hidden shadow-xl z-20 hover:-translate-y-2 transition-transform cursor-pointer">
              <img src="/donate2.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>
            
            {}
            <div className="absolute top-8 right-16 w-36 h-36 rounded-full overflow-hidden shadow-xl z-20 hover:-translate-y-2 transition-transform cursor-pointer">
              <img src="/donate1.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>
            
            {}
            <div className="absolute bottom-16 left-12 w-32 h-32 rounded-full overflow-hidden shadow-xl z-20 hover:-translate-y-2 transition-transform cursor-pointer">
              <img src="/donate4.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>
            
            {}
            <div className="absolute bottom-4 right-32 w-32 h-32 rounded-full overflow-hidden shadow-xl z-20 hover:-translate-y-2 transition-transform cursor-pointer">
              <img src="/donate3.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>

            {}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 w-24 h-24 rounded-full overflow-hidden shadow-xl z-20 hover:-translate-y-2 transition-transform cursor-pointer">
              <img src="/donate6.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>

            {}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 w-28 h-28 rounded-full overflow-hidden shadow-xl z-20 hover:-translate-y-2 transition-transform cursor-pointer">
              <img src="/donate7.jpg" alt="Impact" className="w-full h-full object-cover" />
            </div>

          </div>
        </div>
      </section>

      {}
      <section className="bg-white py-24 px-6 md:px-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {}
          <div className="relative aspect-square md:aspect-auto md:h-[600px] w-full">
            
            {}
            <div className="absolute top-[10%] left-[15%] w-[45%] h-[45%] rounded-[40px] overflow-hidden shadow-xl rounded-tr-[100px] rounded-bl-[100px] z-0">
              <img src="/donate3.jpg" alt="Volunteer" className="w-full h-full object-cover" />
            </div>
            
            {}
            <div className="absolute bottom-[10%] right-[15%] w-[45%] h-[45%] rounded-[40px] overflow-hidden shadow-xl rounded-bl-[100px] rounded-tr-[100px] z-0">
              <img src="/donate4.jpg" alt="Help" className="w-full h-full object-cover" />
            </div>

            {}
            <div className="absolute top-[35%] right-[5%] w-[24%] h-[24%] rounded-full overflow-hidden shadow-lg border-[6px] border-white z-10">
              <img src="/donate5.jpg" alt="Kids" className="w-full h-full object-cover" />
            </div>

            {}
            <div className="absolute bottom-[35%] left-[5%] w-[21%] h-[21%] rounded-full overflow-hidden shadow-lg border-[6px] border-white z-10">
              <img src="/donate2.jpg" alt="Support" className="w-full h-full object-cover" />
            </div>

            {}
            <div className="absolute top-[3%] right-[28%] w-[25%] h-[25%] rounded-full overflow-hidden shadow-lg border-[6px] border-white z-10 hover:-translate-y-1 transition-transform cursor-pointer">
              <img src="/donate8.jpg" alt="Extra Support" className="w-full h-full object-cover" />
            </div>
            
            {}
            <div className="absolute bottom-[2%] left-[28%] w-[22%] h-[22%] rounded-full overflow-hidden shadow-lg border-[6px] border-white z-10 hover:-translate-y-1 transition-transform cursor-pointer">
              <img src="/donate9.jpg" alt="Extra Help" className="w-full h-full object-cover" />
            </div>
          </div>

          {}
          <div className="relative space-y-6 py-2 pl-4 md:pl-0">
            {}
            <div className="absolute left-[39px] top-8 bottom-8 w-px border-l-2 border-dashed border-slate-300"></div>

            {}
            <div className="relative flex gap-6 items-start">
              <div className="bg-white border-2 border-slate-700 rounded-full w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center relative z-10 shadow-sm">
                <Target className="w-8 h-8 text-slate-700" />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-teal-500 mb-1">Start your fundraiser</h3>
                <p className="text-slate-700 text-base leading-relaxed">
                  It'll take only 2 minutes. Just tell us a few details about you and the ones you are raising funds for.
                </p>
              </div>
            </div>
            
            {}
            <div className="relative flex gap-6 items-start">
              <div className="bg-white border-2 border-slate-700 rounded-full w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center relative z-10 shadow-sm">
                <Share2 className="w-8 h-8 text-slate-700" />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-teal-500 mb-1">Share your fundraiser</h3>
                <p className="text-slate-700 text-base leading-relaxed mb-1">
                  All you need to do is share the fundraiser with your friends and family. In no time, support will start pouring in.
                </p>
                <p className="text-xs font-medium text-slate-400">Share your fundraiser directly from dashboard on social media.</p>
              </div>
            </div>

            {}
            <div className="relative flex gap-6 items-start">
              <div className="bg-white border-2 border-slate-700 rounded-full w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center relative z-10 shadow-sm">
                <Banknote className="w-8 h-8 text-slate-700" />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-teal-500 mb-1">Withdraw Funds</h3>
                <p className="text-slate-700 text-base leading-relaxed mb-1">
                  The funds raised can be withdrawn without any hassle directly to your bank account.
                </p>
                <p className="text-xs font-medium text-slate-400">It takes only 5 minutes to withdraw funds on BackIt.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
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

      {}
      <section className="bg-white py-24 px-6 md:px-12 text-center border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-8">
            <Globe2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Support Ideas That Change Lives
          </h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
            Discover inspiring campaigns and help creators, innovators, and communities bring meaningful projects to life.
          </p>

          <Link href={isAuthenticated ? "/create" : "/signin"}>
            <button className="rounded-full bg-emerald-600 px-10 py-4 font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all text-lg">
              Explore Campaigns
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
