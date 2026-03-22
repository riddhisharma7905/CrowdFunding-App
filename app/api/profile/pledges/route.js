import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Pledge from "@/app/models/Pledge";
import { getAuthenticatedUser } from "@/app/lib/helpers";

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

    // Get all pledges by current user (by backer ID first, fallback to email)
    const pledges = await Pledge.find({
      $or: [
        { backer: authUser.userId },
        { backerEmail: authUser.email },
      ],
    }).lean();

    // Calculate total pledged
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
        campaignId: p.campaign.toString(),
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
