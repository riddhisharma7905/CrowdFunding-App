import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import User from "@/models/User";
import {
  getAuthenticatedUserId,
  serializeCampaign,
} from "@/lib/helpers";

const TOKEN_COOKIE_NAME = "backit_token";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const myOnly = searchParams.get("myOnly");

    let query = {};

    
    if (myOnly === "true") {
      const userId = await getAuthenticatedUserId();

      if (!userId) {
        return NextResponse.json(
          { message: "Authentication required" },
          { status: 401 },
        );
      }

      query.owner = userId;
    } else {
      
      query.deadline = { $gt: new Date() };
      query.status = "active";
    }

    const campaigns = await Campaign.find(query)
      .populate("owner", "fullName")
      .sort({ createdAt: -1 })
      .exec();

    const serialized = campaigns.map((c) => serializeCampaign(c));

    return NextResponse.json({ campaigns: serialized }, { status: 200 });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { message: "Failed to load campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      shortDescription,
      fullDescription,
      goalAmount,
      durationDays,
      imageUrl,
      slug,
    } = body || {};

    if (
      !title ||
      !category ||
      !shortDescription ||
      !fullDescription ||
      !goalAmount ||
      !durationDays ||
      !slug
    ) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 },
      );
    }

    const numericGoal = Number(goalAmount);
    const numericDuration = Number(durationDays);

    if (!numericGoal || numericGoal < 1) {
      return NextResponse.json(
        { message: "Goal amount must be a positive number" },
        { status: 400 },
      );
    }

    if (!numericDuration || numericDuration < 1) {
      return NextResponse.json(
        { message: "Duration must be at least 1 day" },
        { status: 400 },
      );
    }

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "You must be signed in to create a campaign" },
        { status: 401 },
      );
    }

    await connectDB();

    const now = new Date();
    const deadline = new Date(
      now.getTime() + numericDuration * 24 * 60 * 60 * 1000,
    );

    const campaign = await Campaign.create({
      title,
      slug,
      category,
      shortDescription,
      fullDescription,
      goalAmount: numericGoal,
      currentAmount: 0,
      backers: 0,
      deadline,
      imageUrl: imageUrl || "/hero.jpg",
      owner: userId,
    });

    return NextResponse.json(
      {
        message: "Campaign created successfully",
        campaign: serializeCampaign(campaign),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { message: "Failed to create campaign" },
      { status: 500 },
    );
  }
}
