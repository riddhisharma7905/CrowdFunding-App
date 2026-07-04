import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import { getAuthenticatedUser } from "@/lib/helpers";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ message: "Invalid campaign slug" }, { status: 400 });
    }

    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const admin = await User.findById(authUser.userId);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status, reason } = body;

    if (!["active", "rejected", "suspended", "changes_requested"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    let query = { slug };
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = { $or: [{ slug }, { _id: slug }] };
    }

    const updateData = { status };
    if (status === "rejected" || status === "changes_requested") {
      updateData.adminFeedback = reason || "";
    } else if (status === "active") {
      updateData.adminFeedback = "";
    }

    const campaign = await Campaign.findOneAndUpdate(query, updateData, { new: true, strict: false });
    
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Campaign status updated", campaign: { id: campaign._id, slug: campaign.slug, status: campaign.status, adminFeedback: campaign.adminFeedback } });
  } catch (error) {
    console.error("Error updating campaign status:", error);
    return NextResponse.json({ message: "Failed to update campaign" }, { status: 500 });
  }
}
