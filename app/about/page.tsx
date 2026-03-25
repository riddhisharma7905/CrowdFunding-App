"use client";

import { useState } from "react";
import Image from "next/image";

export default function AboutPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-[#fafaf9] text-black">
      {/* Top Hero Section */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto space-y-8">
        {/* Main Split: Intro & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left Text Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm flex flex-col justify-center">
            <span className="text-emerald-600 font-bold mb-4 tracking-wide uppercase text-xs">
              About BackIt
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-[40px] font-bold tracking-tight mb-6 leading-tight text-gray-900">
              Connecting creators with supporters who believe in meaningful change.
            </h1>
            <div className="space-y-4 text-gray-600 leading-relaxed text-sm lg:text-[15px]">
              <p>
                BackIt is a crowdfunding platform built to help individuals, creators, and communities bring their ideas to life. Our goal is to connect passionate creators with supporters who believe in innovation, creativity, and meaningful change.
              </p>
              <p>
                Through BackIt, anyone can launch a campaign to raise funds for projects, causes, or new products. Whether it's a technology idea, a healthcare fundraiser, an education initiative, or a creative project, our platform helps turn ideas into reality.
              </p>
            </div>
          </div>

          {/* Right Image Container */}
          <div className="relative w-full min-h-[400px] lg:h-auto rounded-[2rem] overflow-hidden shadow-sm">
            <Image
              src="/donation.jpg"
              alt="People volunteering and donating"
              fill
              className="object-cover"
              priority
            />
          </div>

        </div>

        {/* Continued Content Below */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed text-[15px] flex-grow">
              Our mission is to make crowdfunding accessible, transparent, and impactful. We aim to create a community where creators can confidently launch projects and supporters can discover meaningful initiatives to contribute to. We believe that great ideas can come from anyone, and by providing a simple and transparent platform, we empower visionaries to share their goals and invite the world to back them.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why BackIt?</h3>
            <p className="text-gray-600 leading-relaxed text-[15px] flex-grow">
              We believe that collaboration and community support can turn small ideas into powerful movements. BackIt exists to bridge the gap between creators and supporters, helping projects move from imagination to reality. By providing modern tools and a safe environment, together we can support innovation, creativity, and meaningful change on a global scale.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="bg-emerald-50/50 py-20 px-6 border-y border-emerald-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-1.5 rounded-full">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything you need to fund your vision
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🚀
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Launch Campaigns Easily</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Create and publish your campaign in minutes with intuitive tools built for everyone.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🔍
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Projects</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Explore innovative campaigns across tech, arts, health, education, and community causes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🔒
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support Securely</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every contribution is processed safely with trusted payment infrastructure and full transparency.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Real-time dashboards let you always know where your campaign stands against its goals.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🤝
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Build Community</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Engage supporters, share updates, and grow a loyal community around your idea or cause.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                🌍
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Connect with supporters worldwide and bring international attention to your campaign.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section at the bottom */}
      <section id="contact" className="py-20 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600">
            Have a question or need support? We're here to help. Fill out the form below and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10">
          {sent ? (
            <div className="rounded-xl bg-emerald-50 p-6 text-emerald-800 border border-emerald-100 text-center">
              <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
              <p className="mb-4 text-sm text-emerald-700">Thank you for reaching out. We will get back to you shortly.</p>
              <button 
                onClick={() => setSent(false)}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-6 flex flex-col"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
                  <input id="name" required type="text" className="w-full rounded-xl border border-gray-200 p-3.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-gray-50/50" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email Address</label>
                  <input id="email" required type="email" className="w-full rounded-xl border border-gray-200 p-3.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none bg-gray-50/50" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-gray-900">Message</label>
                <textarea id="message" required rows={5} className="w-full rounded-xl border border-gray-200 p-3.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none bg-gray-50/50" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="self-end rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700 transition">
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
