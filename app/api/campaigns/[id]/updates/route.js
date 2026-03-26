import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUserId } from "@/lib/helpers";

export async function POST(request, { params }) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid campaign ID" }, { status: 400 });
    }

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ message: "Update content is required" }, { status: 400 });
    }

    await connectDB();

    // Verify ownership
    const campaign = await Campaign.findById(id).exec();
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    const campaignOwnerId = campaign.owner?.toString ? campaign.owner.toString() : campaign.owner;
    if (campaignOwnerId !== userId) {
      return NextResponse.json({ message: "Not authorized to post updates to this campaign" }, { status: 403 });
    }

    // Use findByIdAndUpdate to push directly to the array, which safely creates the array if missing in legacy records
    await Campaign.findByIdAndUpdate(
      id,
      {
        $push: {
          updates: {
            content: content.trim(),
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    ).exec();

    return NextResponse.json(
      { message: "Update posted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error posting campaign update:", error);
    return NextResponse.json(
      { message: "Failed to post update" },
      { status: 500 }
    );
  }
}
