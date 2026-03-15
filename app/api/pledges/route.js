import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Campaign from "@/app/models/Campaign";
import Pledge from "@/app/models/Pledge";

// GET /api/pledges?campaignId=...
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { message: "campaignId query parameter is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const pledges = await Pledge.find({ campaign: campaignId })
      .sort({ createdAt: -1 })
      .lean();

    const serialized = pledges.map((p) => ({
      id: p._id.toString(),
      campaignId: p.campaign.toString(),
      amount: p.amount,
      backerName: p.backerName,
      backerEmail: p.backerEmail,
      createdAt: p.createdAt?.toISOString?.() || null,
    }));

    return NextResponse.json({ pledges: serialized });
  } catch (error) {
    console.error("Error loading pledges", error);
    return NextResponse.json(
      { message: "Failed to load pledges" },
      { status: 500 },
    );
  }
}

// POST /api/pledges
export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId, amount, backerName, backerEmail } = body;

    if (!campaignId || !amount || !backerName || !backerEmail) {
      return NextResponse.json(
        {
          message:
            "campaignId, amount, backerName and backerEmail are required",
        },
        { status: 400 },
      );
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { message: "amount must be a positive number" },
        { status: 400 },
      );
    }

    await connectDB();

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    const pledge = await Pledge.create({
      campaign: campaignId,
      amount: numericAmount,
      backerName,
      backerEmail,
    });

    // Update campaign totals
    campaign.currentAmount += numericAmount;
    campaign.backers += 1;
    await campaign.save();

    return NextResponse.json(
      {
        pledge: {
          id: pledge._id.toString(),
          campaignId,
          amount: pledge.amount,
          backerName: pledge.backerName,
          backerEmail: pledge.backerEmail,
          createdAt: pledge.createdAt?.toISOString?.() || null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating pledge", error);
    return NextResponse.json(
      { message: "Failed to create pledge" },
      { status: 500 },
    );
  }
}
