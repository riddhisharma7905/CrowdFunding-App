import Link from "next/link";
import { Shield, ChevronRight } from "lucide-react";

export const metadata = { title: "Terms of Service | BackIt" };

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {}
        <div className="mb-12 border-b border-gray-200 pb-8">
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-4">
            <Shield className="w-4 h-4" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500 text-lg">
            Last updated: {lastUpdated}
          </p>
        </div>

        {}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <div className="prose prose-emerald max-w-none text-gray-600">
            <p className="text-lg leading-relaxed mb-8">
              Please read the Terms carefully before using the Service. If you don&apos;t agree to the Terms, as well as BackIt&apos;s Privacy Policy, you may not use the Service. If you are entering into the Terms on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to the Terms.
            </p>

            <div className="space-y-12">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">1. Platform Purpose</h2>
                <p className="leading-relaxed">BackIt is a platform that allows individuals and organizations to create campaigns and raise funds for projects, causes, or ideas. Supporters can browse campaigns and voluntarily contribute funds to support initiatives they believe in.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
                <p className="leading-relaxed">Users may be required to create an account in order to access certain features of the platform. By creating an account, users agree to provide accurate information and are responsible for maintaining the security of their login credentials and account activities.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">3. Campaign Responsibility</h2>
                <p className="leading-relaxed">Campaign creators are responsible for ensuring that the information provided in their campaigns is accurate and transparent. Creators should use the funds raised for the purposes described in their campaigns and communicate honestly with supporters about project progress.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">4. Contributions</h2>
                <p className="leading-relaxed">Users who contribute to campaigns do so voluntarily. Contributions are intended to support the campaign and its creator, and BackIt does not guarantee the success of campaigns or the delivery of project outcomes.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
                <p className="leading-relaxed">Users must use the platform responsibly and must not engage in fraudulent, illegal, or harmful activities. Campaigns or accounts that violate platform rules may be removed or restricted to maintain the integrity of the platform.</p>
              </section>
            </div>
          </div>
        </div>

        {}
        <div className="mt-8 flex justify-center">
          <Link href="/privacy" className="group flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-700 font-medium hover:text-emerald-600">
            Read our Privacy Policy
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </Link>
        </div>

      </div>
    </main>
  );
}
