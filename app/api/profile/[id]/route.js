import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import Campaign from "@/app/models/Campaign";

function serializeCampaign(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    title: obj.title,
    category: obj.category,
    shortDescription: obj.shortDescription,
    imageUrl: obj.imageUrl,
    goalAmount: obj.goalAmount,
    currentAmount: obj.currentAmount,
    backers: obj.backers,
    status: obj.status,
    createdAt: obj.createdAt,
  };
}

function serializeUser(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    fullName: obj.fullName,
    bio: obj.bio || "",
    birthdate: obj.birthdate || null,
    gender: obj.gender || null,
    occupation: obj.occupation || "",
    createdAt: obj.createdAt,
  };
}

export async function GET(_request, { params }) {
  try {
    const { id } = params || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(id).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const campaigns = await Campaign.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(
      {
        profile: serializeUser(user),
        campaigns: campaigns.map((c) => serializeCampaign(c)),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error loading public profile:", error);
    return NextResponse.json(
      { message: "Failed to load profile" },
      { status: 500 },
    );
  }
}
