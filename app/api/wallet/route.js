import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUser } from "@/lib/helpers";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "You must be signed in to access your wallet." },
        { status: 401 }
      );
    }

    await connectDB();

    const campaigns = await Campaign.find({ owner: authUser.userId })
      .sort({ createdAt: -1 })
      .lean();

    let totalAvailable = 0;
    let totalWithdrawn = 0;

    const walletData = campaigns.map((c) => {
      const current = c.currentAmount || 0;
      const withdrawn = c.withdrawnAmount || 0;
      const available = current - withdrawn;

      totalAvailable += available;
      totalWithdrawn += withdrawn;

      return {
        id: c._id.toString(),
        title: c.title,
        status: c.status,
        currentAmount: current,
        withdrawnAmount: withdrawn,
        availableBalance: available,
      };
    });

    return NextResponse.json({
      totalAvailable,
      totalWithdrawn,
      campaigns: walletData,
    });
  } catch (error) {
    console.error("Error fetching wallet data:", error);
    return NextResponse.json(
      { message: "Failed to load wallet" },
      { status: 500 }
    );
  }
}
