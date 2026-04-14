import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Campaign from "@/models/Campaign";
import {
  getAuthenticatedUserId,
  serializeCampaign,
  serializePrivateUser,
} from "@/lib/helpers";

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
      city,
      country,
      pincode,
      contactNumber,
      profilePicture,
    } = body || {};

    const update = {};

    if (typeof profilePicture === "string") {
      update.profilePicture = profilePicture;
    }

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
      if (["male", "female", "non-binary", "prefer-not-to-say"].includes(gender)) {
        update.gender = gender;
      } else if (gender === "") {
        // @ts-ignore
        update.$unset = { ...update.$unset, gender: 1 };
      }
    }

    if (typeof occupation === "string") {
      update.occupation = occupation;
    }

    // Always update city, country, and pincode since they are sent from frontend
    update.city = typeof city === "string" ? city : "";
    update.country = typeof country === "string" ? country : "";

    // Always update pincode, remove all non-digits and validate
    if (typeof pincode === "string") {
      const cleanPincode = pincode.replace(/\D/g, "");
      if (cleanPincode.length === 0 || cleanPincode.length === 6) {
        update.pincode = cleanPincode;
      } else {
        return NextResponse.json(
          { message: "Pincode must be exactly 6 digits" },
          { status: 400 },
        );
      }
    } else {
      update.pincode = "";
    }

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

    try {
      console.log("UPDATING USER:", userId, "WITH:", JSON.stringify(update, null, 2));

      const updated = await User.findByIdAndUpdate(userId, update, {
        returnDocument: "after",
        runValidators: true,
      }).exec();

      if (!updated) {
        console.error("USER NOT FOUND FOR UPDATE:", userId);
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      console.log("UPDATE SUCCESSFUL. NEW PROFILE:", JSON.stringify(serializePrivateUser(updated), null, 2));

      return NextResponse.json(
        { profile: serializePrivateUser(updated) },
        { status: 200 },
      );
    } catch (dbError) {
      console.error("PROFILE UPDATE DB ERROR:", dbError);
      if (dbError.name === "ValidationError") {
        const firstError = Object.values(dbError.errors)[0].message;
        return NextResponse.json({ message: firstError }, { status: 400 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
