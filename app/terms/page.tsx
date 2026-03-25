import Link from "next/link";

export const metadata = { title: "Terms of Service | BackIt" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f9f9f9] text-black">
      {/* Top Banner */}
      <div className="bg-emerald-600 pt-28 pb-48 px-6 text-center relative z-0 border-b border-emerald-700">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight uppercase text-white mb-6">
          Terms of Service
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
              Please read the Terms carefully before using the Service. If you don't agree to the Terms, as well as BackIt's Privacy Policy, you may not use the Service. If you are entering into the Terms on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to the Terms.
            </p>

            <div className="space-y-8 mt-12">
              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">1. Platform Purpose</h2>
                <p>BackIt is a platform that allows individuals and organizations to create campaigns and raise funds for projects, causes, or ideas. Supporters can browse campaigns and voluntarily contribute funds to support initiatives they believe in.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">2. User Accounts</h2>
                <p>Users may be required to create an account in order to access certain features of the platform. By creating an account, users agree to provide accurate information and are responsible for maintaining the security of their login credentials and account activities.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">3. Campaign Responsibility</h2>
                <p>Campaign creators are responsible for ensuring that the information provided in their campaigns is accurate and transparent. Creators should use the funds raised for the purposes described in their campaigns and communicate honestly with supporters about project progress.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">4. Contributions</h2>
                <p>Users who contribute to campaigns do so voluntarily. Contributions are intended to support the campaign and its creator, and BackIt does not guarantee the success of campaigns or the delivery of project outcomes.</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-black mb-3 uppercase tracking-wide">5. Acceptable Use</h2>
                <p>Users must use the platform responsibly and must not engage in fraudulent, illegal, or harmful activities. Campaigns or accounts that violate platform rules may be removed or restricted to maintain the integrity of the platform.</p>
              </section>
            </div>

            <div className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Want to learn how we handle your data?{" "}
                <Link href="/privacy" className="text-emerald-600 font-semibold hover:underline">
                  Read our Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
