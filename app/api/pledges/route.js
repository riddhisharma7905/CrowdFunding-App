import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import crypto from "crypto";
import connectDB from "@/lib/db";
import Campaign from "@/models/Campaign";
import Pledge from "@/models/Pledge";
import User from "@/models/User"; 
import { getAuthenticatedUser } from "@/lib/helpers";


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { message: "campaignId query parameter is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const pledges = await Pledge.find({ campaign: campaignId })
      .populate("backer", "city country")
      .sort({ createdAt: -1 })
      .lean();

    
    const countryBackerMap = {};
    if (pledges && pledges.length > 0) {
      pledges.forEach((p) => {
        const backer = p.backer;
        if (backer && typeof backer === "object" && backer.country) {
          const country = backer.country.trim();
          const backerId = backer._id?.toString() || p.backer?.toString();
          
          if (country && backerId) {
            
            const normalizedCountry = country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
            if (!countryBackerMap[normalizedCountry]) {
              countryBackerMap[normalizedCountry] = new Set();
            }
            countryBackerMap[normalizedCountry].add(backerId);
          }
        }
      });
    }

    const locationStats = {};
    Object.keys(countryBackerMap).forEach(country => {
      locationStats[country] = countryBackerMap[country].size;
    });

    const serialized = pledges.map((p) => ({
      id: p._id.toString(),
      campaignId: p.campaign.toString(),
      amount: p.amount,
      backerName: p.backerName,
      backerEmail: p.backerEmail,
      createdAt: p.createdAt?.toISOString?.() || null,
    }));

    return NextResponse.json({ pledges: serialized, locationStats });
  } catch (error) {
    console.error("Error loading pledges", error);
    return NextResponse.json(
      { message: "Failed to load pledges" },
      { status: 500 },
    );
  }
}


export async function POST(request) {
  try {
    
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "You must be signed in to back a campaign" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { 
        campaignId, 
        amount, 
        backerName, 
        backerEmail,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature 
    } = body;

    if (!campaignId || !amount || !backerName || !backerEmail) {
      return NextResponse.json(
        {
          message:
            "Missing required fields including payment details.",
        },
        { status: 400 },
      );
    }

    
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          { message: "Payment verification failed. Invalid signature." },
          { status: 400 },
        );
      }
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { message: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    await connectDB();

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { message: "Campaign not found" },
        { status: 404 },
      );
    }

    
    const now = new Date();
    if (campaign.deadline < now || campaign.status !== "active") {
      return NextResponse.json(
        { message: "This campaign has ended and is no longer accepting pledges." },
        { status: 400 },
      );
    }

    
    const existingPledge = await Pledge.findOne({
      campaign: campaignId,
      backer: authUser.userId,
    });

    const isFirstTimeBacker = !existingPledge;

    const pledge = await Pledge.create({
      campaign: campaignId,
      backer: authUser.userId,
      amount: numericAmount,
      backerName,
      backerEmail,
    });

    
    
    const updateQuery = {
      $inc: { currentAmount: numericAmount },
    };
    if (isFirstTimeBacker) {
      
      updateQuery.$inc.backers = 1;
    }

    await Campaign.findByIdAndUpdate(campaignId, updateQuery);

    return NextResponse.json(
      {
        pledge: {
          id: pledge._id.toString(),
          campaignId,
          amount: pledge.amount,
          backerName: pledge.backerName,
          backerEmail: pledge.backerEmail,
          createdAt: pledge.createdAt?.toISOString?.() || null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating pledge", error);
    return NextResponse.json(
      { message: "Failed to create pledge" },
      { status: 500 },
    );
  }
}
