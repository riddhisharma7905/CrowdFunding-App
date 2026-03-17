import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import Pledge from "@/app/models/Pledge";

const TOKEN_COOKIE_NAME = "backit_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 },
      );
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }

    let payload;
    try {
      payload = jwt.verify(token, jwtSecret);
    } catch {
      return NextResponse.json(
        { message: "Invalid or expired session" },
        { status: 401 },
      );
    }

    await connectDB();

    // Get all pledges by current user (backer)
    const pledges = await Pledge.find({
      backerEmail: payload.email,
    }).lean();

    // Calculate total pledged
    const totalPledged = pledges.reduce(
      (sum, pledge) => sum + pledge.amount,
      0,
    );
    const totalBackings = pledges.length;

    return NextResponse.json({
      totalPledged,
      totalBackings,
      pledges: pledges.map((p) => ({
        id: p._id.toString(),
        campaignId: p.campaign.toString(),
        amount: p.amount,
        backerName: p.backerName,
        createdAt: p.createdAt?.toISOString?.() || null,
      })),
    });
  } catch (error) {
    console.error("Error fetching user pledges:", error);
    return NextResponse.json(
      { message: "Failed to load pledges", error: error.message },
      { status: 500 },
    );
  }
}
