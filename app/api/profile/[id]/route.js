import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import Campaign from "@/app/models/Campaign";
import {
  getAuthenticatedUserId,
  serializeCampaign,
  serializePublicUser,
} from "@/app/lib/helpers";

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

    // Check if current user is following (using proper cookies API)
    let isFollowing = false;
    try {
      const currentUserId = await getAuthenticatedUserId();
      if (currentUserId && user.followers) {
        isFollowing = user.followers.some(
          (f) => String(f) === String(currentUserId),
        );
      }
    } catch {
      // If auth check fails, just set isFollowing to false
      isFollowing = false;
    }

    return NextResponse.json(
      {
        profile: serializePublicUser(user, followerCount),
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
