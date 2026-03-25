"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-white px-6 py-12 md:py-20 text-black">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Have a question or need support? We're here to help. Fill out the form below and our team will get back to you as soon as possible.
        </p>

        {sent ? (
          <div className="rounded-xl bg-emerald-50 p-6 text-emerald-800 border border-emerald-100">
            <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
            <p>Thank you for reaching out. We will get back to you shortly.</p>
            <button 
              onClick={() => setSent(false)}
              className="mt-4 text-emerald-600 font-medium hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">Name</label>
              <input id="name" required type="text" className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email Address</label>
              <input id="email" required type="email" className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium text-gray-900">Message</label>
              <textarea id="message" required rows={5} className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none" placeholder="How can we help you?" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition">
              Send Message
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
