import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Pledge from "@/models/Pledge";
import { getAuthenticatedUser, serializeCampaign } from "@/lib/helpers";

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    await connectDB();

    const pledges = await Pledge.find({
      $or: [
        { backer: authUser.userId },
        { backerEmail: authUser.email },
      ],
    })
      .populate(
        "campaign",
        "title category shortDescription imageUrl goalAmount currentAmount backers deadline status owner"
      )
      .lean();

    const totalPledged = pledges.reduce(
      (sum, pledge) => sum + pledge.amount,
      0,
    );
    const totalBackings = pledges.length;

    return NextResponse.json({
      totalPledged,
      totalBackings,
      pledges: pledges.map((p) => ({
        id: p._id.toString(),
        campaignId: p.campaign?._id?.toString() || p.campaign?.toString(),
        campaign: p.campaign ? serializeCampaign(p.campaign) : null, 
        amount: p.amount,
        backerName: p.backerName,
        createdAt: p.createdAt?.toISOString?.() || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching user pledges:", error);
    return NextResponse.json(
      { message: "Failed to load pledges" },
      { status: 500 },
    );
  }
}
