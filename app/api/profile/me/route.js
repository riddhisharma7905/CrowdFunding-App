import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import Campaign from "@/app/models/Campaign";
import {
  getAuthenticatedUserId,
  serializeCampaign,
  serializePrivateUser,
} from "@/app/lib/helpers";

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
        profile: serializePrivateUser(user),
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
    const {
      fullName,
      bio,
      birthdate,
      gender,
      occupation,
      location,
      contactNumber,
    } = body || {};

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

    // Always update location since it sent from frontend
    update.location = typeof location === "string" ? location : "";

    // Always update contactNumber, remove all non-digits and validate
    if (typeof contactNumber === "string") {
      const cleanNumber = contactNumber.replace(/\D/g, "");
      // Validate: must be 10 digits exactly or empty
      if (cleanNumber.length === 0 || cleanNumber.length === 10) {
        update.contactNumber = cleanNumber;
      } else {
        return NextResponse.json(
          { message: "Contact number must be exactly 10 digits" },
          { status: 400 },
        );
      }
    } else {
      update.contactNumber = "";
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(userId, update, {
      returnDocument: "after",
    }).exec();

    if (!updated) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { profile: serializePrivateUser(updated) },
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
