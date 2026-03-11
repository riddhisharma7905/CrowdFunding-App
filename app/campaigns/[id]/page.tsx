import React from "react";
import Link from "next/link";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-black">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link
          href="/explore"
          className="text-sm text-gray-500 underline-offset-4 hover:text-black hover:underline"
        >
          ← Back to campaigns
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight">Campaign {id}</h1>

        <p className="text-gray-600">
          This is a campaign detail page. You can extend it later to load full
          information (description, progress, pledges, etc.) from your API or
          database.
        </p>
      </div>
    </main>
  );
}
