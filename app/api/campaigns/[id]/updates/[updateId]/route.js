import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUserId } from "@/lib/helpers";

export async function DELETE(request, { params }) {
  try {
    const { id, updateId } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid campaign ID" }, { status: 400 });
    }

    if (!updateId || !mongoose.Types.ObjectId.isValid(updateId)) {
      return NextResponse.json({ message: "Invalid update ID" }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    // Verify ownership
    const campaign = await Campaign.findById(id).exec();
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    const campaignOwnerId = campaign.owner?.toString ? campaign.owner.toString() : campaign.owner;
    if (campaignOwnerId !== userId) {
      return NextResponse.json({ message: "Not authorized to delete updates for this campaign" }, { status: 403 });
    }

    // Pull the update from the array
    await Campaign.findByIdAndUpdate(
      id,
      {
        $pull: {
          updates: { _id: updateId }
        }
      },
      { new: true }
    ).exec();

    return NextResponse.json({ message: "Update deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting campaign update:", error);
    return NextResponse.json({ message: "Failed to delete update" }, { status: 500 });
  }
}
