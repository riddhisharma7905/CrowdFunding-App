import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUserId } from "@/lib/helpers";

export async function POST(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ message: "Invalid campaign slug" }, { status: 400 });
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

    let query = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const campaign = await Campaign.findOne(query).exec();
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    const campaignOwnerId = campaign.owner?.toString ? campaign.owner.toString() : campaign.owner;
    if (campaignOwnerId !== userId) {
      return NextResponse.json({ message: "Not authorized to post updates to this campaign" }, { status: 403 });
    }

    await Campaign.findOneAndUpdate(
      query,
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
