import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
export const dynamic = "force-dynamic";
import {
  getAuthenticatedUserId,
  serializeCampaign,
} from "@/lib/helpers";

export async function GET(_request, { params }) {
  try {
    const { slug } = (await params) || {};

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 },
      );
    }

    await connectDB();

    let query = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const campaign = await Campaign.findOne(query)
      .populate("owner", "fullName profilePicture email bio city country occupation createdAt")
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
    const { slug } = (await params) || {};

    if (!slug) {
      return NextResponse.json(
        { message: "Invalid campaign ID" },
        { status: 400 },
      );
    }

    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    await connectDB();

    let query = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const campaign = await Campaign.findOne(query).exec();
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
        { message: "Not authorized to delete this campaign" },
        { status: 403 },
      );
    }

    await Campaign.findOneAndDelete(query).exec();

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
    const { slug } = (await params) || {};

    if (!slug) {
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

    let query = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const campaign = await Campaign.findOne(query).exec();
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

    const updateData = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (shortDescription) updateData.shortDescription = shortDescription;
    if (fullDescription) updateData.fullDescription = fullDescription;
    if (goalAmount) updateData.goalAmount = goalAmount;

    const updated = await Campaign.findOneAndUpdate(query, updateData, {
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
