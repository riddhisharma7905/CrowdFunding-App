import Link from "next/link";
import { Lock, ChevronRight } from "lucide-react";

export const metadata = { title: "Privacy Policy | BackIt" };

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {}
        <div className="mb-12 border-b border-gray-200 pb-8">
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4">
            <Lock className="w-4 h-4" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-lg">
            Last updated: {lastUpdated}
          </p>
        </div>

        {}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-emerald max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-8">
              BackIt values the privacy of its users and is committed to protecting personal information. This Privacy Policy explains how information is collected, used, and protected when users interact with the BackIt crowdfunding platform.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="leading-relaxed">When users create an account or interact with the platform, BackIt may collect certain information such as the user’s name, email address, account details, and profile information. The platform may also collect information related to campaigns created by users, including campaign descriptions, funding goals, and other details shared during campaign creation. In addition, information about contributions, transactions, and general platform usage may be recorded to ensure the platform functions properly and securely.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="leading-relaxed">The information collected is used to operate and improve the BackIt platform. It helps manage user accounts, enable campaign creation, allow supporters to contribute to campaigns, and maintain platform security. The information may also be used to communicate updates, notifications, or important information related to the platform and its services.</p>
              </section>  

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Data Protection</h2>
                <p className="leading-relaxed">BackIt takes reasonable measures to protect user information from unauthorized access, misuse, or disclosure. Security practices are implemented to maintain the safety of user data, although no online system can guarantee absolute protection against all risks.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
                <p className="leading-relaxed">The platform may rely on trusted third-party services for certain features such as payment processing or infrastructure support. These services may handle limited information necessary to perform their functions and are expected to maintain appropriate security and privacy standards.</p>
              </section>
            </div>
          </div>
        </div>

        {}
        <div className="mt-8 flex justify-center">
          <Link href="/terms" className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium hover:text-emerald-600">
            Read our Terms of Service
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </Link>
        </div>

      </div>
    </main>
  );
}
