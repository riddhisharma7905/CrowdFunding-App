import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import Campaign from "@/app/models/Campaign";
import User from "@/app/models/User";

function serializeCampaign(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    title: obj.title,
    category: obj.category,
    shortDescription: obj.shortDescription,
    fullDescription: obj.fullDescription,
    imageUrl: obj.imageUrl,
    goalAmount: obj.goalAmount,
    currentAmount: obj.currentAmount,
    backers: obj.backers,
    deadline: obj.deadline,
    status: obj.status,
    ownerId: obj.owner ? obj.owner.toString() : null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

const TOKEN_COOKIE_NAME = "backit_token";

export async function GET() {
  try {
    await connectDB();

    const campaigns = await Campaign.find().sort({ createdAt: -1 }).exec();

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
    } = body || {};

    if (
      !title ||
      !category ||
      !shortDescription ||
      !fullDescription ||
      !goalAmount ||
      !durationDays
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

    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "You must be signed in to create a campaign" },
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
        { message: "Invalid or expired session. Please sign in again." },
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
      category,
      shortDescription,
      fullDescription,
      goalAmount: numericGoal,
      currentAmount: 0,
      backers: 0,
      deadline,
      imageUrl: imageUrl || "/hero.jpg",
      owner: payload.userId,
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
