import Link from "next/link";

export const metadata = { title: "Privacy Policy | BackIt" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f9] text-black">
      {/* Top Banner */}
      <div className="bg-emerald-600 pt-28 pb-48 px-6 text-center relative z-0 border-b border-emerald-700">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase text-white mb-6">
          Privacy Policy
        </h1>
        <span className="inline-block bg-emerald-800 text-emerald-50 text-xs font-semibold px-5 py-2 rounded-full uppercase tracking-wider shadow-sm border border-emerald-700">
          Updated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Content Card overlapping the banner */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 -mt-32 pb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-14">
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-8">
            <p>
              BackIt values the privacy of its users and is committed to protecting personal information. This Privacy Policy explains how information is collected, used, and protected when users interact with the BackIt crowdfunding platform.
            </p>

            <div className="space-y-8 mt-12">
              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">1- Information We Collect.</h2>
                <p>When users create an account or interact with the platform, BackIt may collect certain information such as the user’s name, email address, account details, and profile information. The platform may also collect information related to campaigns created by users, including campaign descriptions, funding goals, and other details shared during campaign creation. In addition, information about contributions, transactions, and general platform usage may be recorded to ensure the platform functions properly and securely.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">2- How We Use Your Information.</h2>
                <p>The information collected is used to operate and improve the BackIt platform. It helps manage user accounts, enable campaign creation, allow supporters to contribute to campaigns, and maintain platform security. The information may also be used to communicate updates, notifications, or important information related to the platform and its services.</p>
              </section>  

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">3- Data Protection.</h2>
                <p>BackIt takes reasonable measures to protect user information from unauthorized access, misuse, or disclosure. Security practices are implemented to maintain the safety of user data, although no online system can guarantee absolute protection against all risks.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">4- Third-Party Services.</h2>
                <p>The platform may rely on trusted third-party services for certain features such as payment processing or infrastructure support. These services may handle limited information necessary to perform their functions and are expected to maintain appropriate security and privacy standards.</p>
              </section>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Looking for our platform rules?{" "}
                <Link href="/terms" className="text-emerald-600 font-semibold hover:underline">
                  Read our Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
