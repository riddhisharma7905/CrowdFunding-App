"use client";

import { useState } from "react";
import Image from "next/image";
import { Rocket, Search, ShieldCheck, BarChart, Users, Globe, Mail, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {}
      <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <span className="text-emerald-600 font-semibold mb-4 tracking-wider uppercase text-xs inline-block">
                About BackIt
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
                Fund meaningful <span className="text-emerald-600">change.</span>
              </h1>
              <div className="space-y-4 text-gray-600 leading-relaxed text-lg">
                <p>
                  BackIt is a crowdfunding platform built to help individuals, creators, and communities bring their ideas to life. Our goal is to connect passionate creators with supporters who believe in innovation, creativity, and meaningful change.
                </p>
                <p>
                  Through BackIt, anyone can launch a campaign to raise funds for projects, causes, or new products. Whether it's a technology idea, a healthcare fundraiser, an education initiative, or a creative project, our platform helps turn ideas into reality.
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <Image
              src="/donation.jpg"
              alt="People volunteering and donating"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>
      </section>

      {}
      <section className="bg-white border-y border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-base flex-grow pt-2">
                Our mission is to make crowdfunding accessible, transparent, and impactful. We aim to create a community where creators can confidently launch projects and supporters can discover meaningful initiatives to contribute to. We believe that great ideas can come from anyone, and by providing a simple and transparent platform, we empower visionaries to share their goals and invite the world to back them.
              </p>
            </div>

            <div className="flex flex-col">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Why BackIt?</h3>
              <p className="text-gray-600 leading-relaxed text-base flex-grow pt-2">
                We believe that collaboration and community support can turn small ideas into powerful movements. BackIt exists to bridge the gap between creators and supporters, helping projects move from imagination to reality. By providing modern tools and a safe environment, together we can support innovation, creativity, and meaningful change on a global scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              Everything you need to fund your vision
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A comprehensive suite of tools designed to help you launch, manage, and scale your crowdfunding campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Launch Campaigns Easily</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create and publish your campaign in minutes with intuitive tools built for everyone.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Discover Projects</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Explore innovative campaigns across tech, arts, health, education, and community causes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Support Securely</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every contribution is processed safely with trusted payment infrastructure and full transparency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Real-time dashboards let you always know where your campaign stands against its goals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Build Community</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Engage supporters, share updates, and grow a loyal community around your idea or cause.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Global Reach</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with supporters worldwide and bring international attention to your campaign.
              </p>
            </div>

          </div>
        </div>
      </section>

      {}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto bg-gray-50 border-t border-gray-200">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Get in touch</h2>
          <p className="text-gray-600 text-lg">
            Have a question or need support? Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-10">
          {sent ? (
            <div className="rounded-lg bg-emerald-50 p-8 border border-emerald-100 flex flex-col items-center text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="font-bold text-xl mb-2 text-emerald-900">Message Sent!</h3>
              <p className="mb-6 text-emerald-700">Thank you for reaching out. We will get back to you shortly.</p>
              <button 
                onClick={() => setSent(false)}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Name</label>
                  <input id="name" required type="text" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address</label>
                  <input id="email" required type="email" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700">Message</label>
                <textarea id="message" required rows={5} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none bg-white" placeholder="How can we help you?" />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-8 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition shadow-sm">
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
