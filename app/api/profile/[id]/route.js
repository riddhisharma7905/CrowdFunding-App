import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
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

function serializeUser(doc, followersCount = 0) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    fullName: obj.fullName,
    bio: obj.bio || "",
    birthdate: obj.birthdate || null,
    gender: obj.gender || null,
    occupation: obj.occupation || "",
    location: obj.location || "",
    followers: followersCount,
    createdAt: obj.createdAt,
  };
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;

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

    // Calculate total funded across all campaigns
    const totalFunded = campaigns.reduce(
      (sum, c) => sum + (c.currentAmount || 0),
      0,
    );

    // Get follower count
    const followerCount = user.followers ? user.followers.length : 0;

    // Check if current user is following
    let isFollowing = false;
    try {
      const authHeader = _request.headers.get("cookie") || "";
      const cookieValue = authHeader
        .split("; ")
        .find((row) => row.startsWith("backit_token="));

      if (cookieValue) {
        const token = cookieValue.split("=")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        const currentUserId = decoded.userId;

        // Check if current user is in the followers array
        if (user.followers) {
          isFollowing = user.followers.some(
            (f) => String(f) === String(currentUserId),
          );
        }
      }
    } catch (err) {
      // If JWT verification fails, just set isFollowing to false
      isFollowing = false;
    }

    return NextResponse.json(
      {
        profile: serializeUser(user, followerCount),
        campaigns: campaigns.map((c) => serializeCampaign(c)),
        stats: {
          totalFunded,
          campaignsCreated: campaigns.length,
          followers: followerCount,
        },
        isFollowing,
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
