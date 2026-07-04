import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import Pledge from "@/models/Pledge";
import { getAuthenticatedUser } from "@/lib/helpers";

export async function GET() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const now = new Date();

    const [
      totalUsers,
      totalCampaigns,
      endedCampaignsCount,
      successfulCampaigns,
      failedCampaigns,
      pendingCampaigns,
      pledges,
      revenueByCategoryRaw,
      topCampaignsRaw,
      topUsersRaw,
      recentPledges
    ] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments({ status: "active", deadline: { $gt: now } }),
      Campaign.countDocuments({ $or: [{ status: { $in: ["completed"] } }, { status: "active", deadline: { $lt: now } }] }),
      Campaign.countDocuments({ status: "active", deadline: { $lt: now }, $expr: { $gte: ["$currentAmount", "$goalAmount"] } }),
      Campaign.countDocuments({ status: "active", deadline: { $lt: now }, $expr: { $lt: ["$currentAmount", "$goalAmount"] } }),
      Campaign.find({ status: "pending" })
        .populate("owner", "fullName email profilePicture")
        .sort({ createdAt: -1 }),
      Pledge.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
      Campaign.aggregate([{ $group: { _id: "$category", totalRevenue: { $sum: "$currentAmount" }, count: { $sum: 1 } } }, { $sort: { totalRevenue: -1 } }]),
      Campaign.find({ status: { $ne: "pending" } }).sort({ currentAmount: -1 }).limit(5).select("title slug currentAmount goalAmount category"),
      Pledge.aggregate([
        { $match: { backer: { $ne: null } } },
        { $group: { _id: "$backer", totalPaid: { $sum: "$amount" } } },
        { $sort: { totalPaid: -1 } },
        { $limit: 5 }
      ]),
      Pledge.find().sort({ createdAt: -1 }).limit(5).select("backerName amount createdAt campaign").lean()
    ]);

    const totalRevenue = pledges.length > 0 ? pledges[0].total : 0;

    const revenueByCategory = revenueByCategoryRaw.map(r => ({
      name: r._id || "Other",
      value: r.totalRevenue,
      count: r.count
    })).filter(r => r.value > 0);

    const populatedUsers = await User.find({ _id: { $in: topUsersRaw.map(u => u._id) } }).select("fullName email profilePicture");
    const topUsers = topUsersRaw.map(r => {
      const u = populatedUsers.find(p => p._id.toString() === r._id.toString());
      return { id: r._id, name: u ? u.fullName : "Unknown", email: u?.email, totalPaid: r.totalPaid };
    });

    return NextResponse.json({
      totalUsers,
      totalCampaigns,
      endedCampaignsCount,
      successfulCampaigns,
      failedCampaigns,
      totalRevenue,
      pendingCampaigns,
      recentPledges,
      analytics: {
        revenueByCategory,
        topCampaigns: topCampaignsRaw.map(c => ({ id: c._id.toString(), name: c.title, slug: c.slug || c._id.toString(), amount: c.currentAmount, goal: c.goalAmount, category: c.category })),
        topUsers
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ message: "Failed to fetch stats" }, { status: 500 });
  }
}
