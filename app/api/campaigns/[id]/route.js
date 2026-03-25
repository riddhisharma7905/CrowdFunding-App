import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Campaign from "@/app/models/Campaign";
export const dynamic = "force-dynamic";
import {
  getAuthenticatedUserId,
  serializeCampaign,
} from "@/app/lib/helpers";

export async function GET(_request, { params }) {
  try {
    const { id } = (await params) || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const campaign = await Campaign.findById(id)
      .populate("owner", "fullName")
      .exec();

    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { campaign: serializeCampaign(campaign) },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { message: "Failed to load campaign" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = (await params) || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 },
      );
    }

    // Verify authentication
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    await connectDB();

    // Find the campaign first to verify ownership
    const campaign = await Campaign.findById(id).exec();
    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    // Check ownership
    const campaignOwnerId = campaign.owner?.toString
      ? campaign.owner.toString()
      : campaign.owner;
    if (campaignOwnerId !== userId) {
      return NextResponse.json(
        { message: "Not authorized to delete this campaign" },
        { status: 403 },
      );
    }

    await Campaign.findByIdAndDelete(id).exec();

    return NextResponse.json(
      { message: "Campaign deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { message: "Failed to delete campaign" },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = (await params) || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 },
      );
    }

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { title, category, shortDescription, fullDescription, goalAmount } =
      body;

    await connectDB();

    // Verify ownership
    const campaign = await Campaign.findById(id).exec();
    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    const campaignOwnerId = campaign.owner?.toString
      ? campaign.owner.toString()
      : campaign.owner;
    if (campaignOwnerId !== userId) {
      return NextResponse.json(
        { message: "Not authorized to edit this campaign" },
        { status: 403 },
      );
    }

    // Update campaign
    const updateData = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (shortDescription) updateData.shortDescription = shortDescription;
    if (fullDescription) updateData.fullDescription = fullDescription;
    if (goalAmount) updateData.goalAmount = goalAmount;

    const updated = await Campaign.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    })
      .populate("owner", "fullName")
      .exec();

    return NextResponse.json(
      {
        message: "Campaign updated successfully",
        campaign: serializeCampaign(updated),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { message: "Failed to update campaign" },
      { status: 500 },
    );
  }
}
