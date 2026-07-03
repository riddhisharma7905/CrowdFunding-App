import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/helpers";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const filter = searchParams.get("filter") || "all";
    
    let dbQuery = { status: { $ne: "pending" } };
    const now = new Date();

    if (filter === "active") {
      dbQuery = { status: "active", deadline: { $gt: now } };
    } else if (filter === "ended") {
      dbQuery = { $or: [{ status: { $in: ["completed", "rejected", "cancelled", "suspended"] } }, { status: "active", deadline: { $lt: now } }] };
    }
    
    if (query.trim() !== "") {
      const searchRegex = new RegExp(query.trim(), "i");
      dbQuery.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex }
      ];
    }
    
    if (category.trim() !== "") {
      dbQuery.category = category;
    }

    const campaigns = await Campaign.find(dbQuery)
      .populate("owner", "fullName email profilePicture")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Admin campaign search error:", error);
    return NextResponse.json({ message: "Failed to search campaigns" }, { status: 500 });
  }
}
