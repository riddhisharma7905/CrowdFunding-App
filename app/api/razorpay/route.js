import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getAuthenticatedUser } from "@/app/lib/helpers";

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { message: "You must be signed in to back a campaign" },
        { status: 401 }
      );
    }

    // Ensure Razorpay keys are present
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay keys not found in environment.");
        return NextResponse.json(
          { message: "Server misconfiguration. Cannot process payments." },
          { status: 500 }
        );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const body = await request.json();
    const { amount } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        return NextResponse.json(
          { message: "Invalid payment amount." },
          { status: 400 }
        );
    }

    // Razorpay amount is in sub-units (paise for INR)
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { message: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
