import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import { getAuthenticatedUserId } from "@/app/lib/helpers";

export async function POST(_req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 },
      );
    }

    // Get user ID from JWT using proper cookies API
    const currentUserId = await getAuthenticatedUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const creatorId = id;

    // Can't follow yourself
    if (currentUserId === creatorId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 },
      );
    }

    // Check if already following
    const creator = await User.findById(creatorId);
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 },
      );
    }

    const alreadyFollowing = creator.followers.some(
      (f) => String(f) === String(currentUserId),
    );

    if (!alreadyFollowing) {
      // Add follower
      creator.followers.push(currentUserId);
      await creator.save();
    }

    return NextResponse.json({
      message: "Followed successfully",
      followers: creator.followers.length,
    });
  } catch (err) {
    console.error("Error following creator", err);
    return NextResponse.json(
      { error: "Failed to follow creator" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 },
      );
    }

    // Get user ID from JWT using proper cookies API
    const currentUserId = await getAuthenticatedUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const creatorId = id;

    const creator = await User.findById(creatorId);
    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 },
      );
    }

    // Remove follower
    creator.followers = creator.followers.filter(
      (f) => String(f) !== String(currentUserId),
    );
    await creator.save();

    return NextResponse.json({
      message: "Unfollowed successfully",
      followers: creator.followers.length,
    });
  } catch (err) {
    console.error("Error unfollowing creator", err);
    return NextResponse.json(
      { error: "Failed to unfollow creator" },
      { status: 500 },
    );
  }
}
