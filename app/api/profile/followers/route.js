import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthenticatedUserId } from "@/lib/helpers";

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    await connectDB();

    const user = await User.findById(userId)
      .populate("followers", "fullName email profilePicture")
      .exec();

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const followers = (user.followers || []).map((f) => ({
      id: f._id.toString(),
      fullName: f.fullName,
      email: f.email,
      profilePicture: f.profilePicture || "",
    }));

    return NextResponse.json({ followers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { message: "Failed to fetch followers" },
      { status: 500 },
    );
  }
}
