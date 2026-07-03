import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/helpers";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const admin = await User.findById(authUser.userId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { isBanned } = body;

    if (typeof isBanned !== "boolean") {
      return NextResponse.json({ message: "isBanned must be a boolean" }, { status: 400 });
    }

    if (id === authUser.userId) {
      return NextResponse.json({ message: "Cannot ban yourself" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(id, { isBanned }, { new: true });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User status updated", user: { id: user._id, isBanned: user.isBanned } });
  } catch (error) {
    console.error("Error updating user status:", error);
    return NextResponse.json({ message: "Failed to update user" }, { status: 500 });
  }
}
