import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Campaign from "@/app/models/Campaign";
import Pledge from "@/app/models/Pledge";

export async function GET() {
  try {
    await connectDB();

    const [campaigns, pledgeAgg, recentPledges] = await Promise.all([
      Campaign.find().lean(),
      (async () => {
        const now = new Date();
        const start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

        const result = await Pledge.aggregate([
          {
            $match: {
              createdAt: { $gte: start },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              amount: { $sum: "$amount" },
              backers: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        return result;
      })(),
      Pledge.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("campaign", "title")
        .lean(),
    ]);

    const totals = campaigns.reduce(
      (acc, c) => {
        acc.totalRaised += c.currentAmount || 0;
        acc.totalBackers += c.backers || 0;
        if (c.status === "active") {
          acc.activeCampaigns += 1;
        }
        return acc;
      },
      { totalRaised: 0, totalBackers: 0, activeCampaigns: 0 },
    );

    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, date: d });
    }

    const seriesMap = new Map();
    for (const row of pledgeAgg) {
      seriesMap.set(row._id, row);
    }

    const pledgesByDay = days.map(({ key }) => {
      const row = seriesMap.get(key) || {};
      return {
        date: key,
        amount: row.amount || 0,
        backers: row.backers || 0,
      };
    });

    const recentBackers = recentPledges.map((p) => ({
      id: p._id.toString(),
      backerName: p.backerName,
      amount: p.amount,
      campaignTitle:
        (p.campaign && (p.campaign.title || p.campaign.name)) || "Campaign",
      createdAt: p.createdAt?.toISOString?.() || null,
    }));

    return NextResponse.json({ totals, pledgesByDay, recentBackers });
  } catch (error) {
    console.error("Error loading dashboard data", error);
    return NextResponse.json(
      { message: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}
