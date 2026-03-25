import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Campaign from "@/app/models/Campaign";
import { getAuthenticatedUser } from "@/app/lib/helpers";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "You must be signed in to withdraw funds." },
        { status: 401 }
      );
    }

    const { campaignId, amount } = await request.json();

    if (!campaignId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        { message: "Invalid withdrawal request." },
        { status: 400 }
      );
    }

    await connectDB();

    const campaign = await Campaign.findOne({ _id: campaignId, owner: authUser.userId });
    
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found or unauthorized." }, { status: 404 });
    }

    const current = campaign.currentAmount || 0;
    const withdrawn = campaign.withdrawnAmount || 0;
    const available = current - withdrawn;
    const withdrawAmount = Number(amount);

    if (withdrawAmount > available) {
      return NextResponse.json({ message: "Requested amount exceeds available balance." }, { status: 400 });
    }

    // Process withdrawal natively to bypass Mongoose hot-reload schema caching
    await Campaign.collection.updateOne(
      { _id: campaign._id },
      { $inc: { withdrawnAmount: withdrawAmount } }
    );

    return NextResponse.json({
      message: "Withdrawal successful",
      availableBalance: current - (withdrawn + withdrawAmount),
    });

  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { message: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
