import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import Campaign from "@/app/models/Campaign";

function serializeCampaign(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    title: obj.title,
    category: obj.category,
    shortDescription: obj.shortDescription,
    fullDescription: obj.fullDescription,
    imageUrl: obj.imageUrl,
    goalAmount: obj.goalAmount,
    currentAmount: obj.currentAmount,
    backers: obj.backers,
    deadline: obj.deadline,
    status: obj.status,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

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

    const campaign = await Campaign.findById(id).exec();

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

    await connectDB();

    const deleted = await Campaign.findByIdAndDelete(id).exec();

    if (!deleted) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

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
