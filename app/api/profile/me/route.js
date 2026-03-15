import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import Campaign from "@/app/models/Campaign";

const TOKEN_COOKIE_NAME = "backit_token";

function serializeCampaign(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    title: obj.title,
    category: obj.category,
    shortDescription: obj.shortDescription,
    imageUrl: obj.imageUrl,
    goalAmount: obj.goalAmount,
    currentAmount: obj.currentAmount,
    backers: obj.backers,
    status: obj.status,
    createdAt: obj.createdAt,
  };
}

function serializeUser(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    fullName: obj.fullName,
    email: obj.email,
    bio: obj.bio || "",
    birthdate: obj.birthdate || null,
    gender: obj.gender || null,
    occupation: obj.occupation || "",
    createdAt: obj.createdAt,
  };
}

async function getAuthenticatedUserId() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const payload = jwt.verify(token, jwtSecret);
  return typeof payload === "object" && payload.userId ? payload.userId : null;
}

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

    const user = await User.findById(userId).exec();
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const campaigns = await Campaign.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json(
      {
        profile: serializeUser(user),
        campaigns: campaigns.map((c) => serializeCampaign(c)),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error loading profile:", error);
    return NextResponse.json(
      { message: "Failed to load profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { fullName, bio, birthdate, gender, occupation } = body || {};

    const update = {};

    if (typeof fullName === "string" && fullName.trim()) {
      update.fullName = fullName.trim();
    }

    if (typeof bio === "string") {
      update.bio = bio;
    }

    if (birthdate) {
      const date = new Date(birthdate);
      if (!Number.isNaN(date.getTime())) {
        update.birthdate = date;
      }
    }

    if (typeof gender === "string") {
      update.gender = gender;
    }

    if (typeof occupation === "string") {
      update.occupation = occupation;
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).exec();

    if (!updated) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { profile: serializeUser(updated) },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
