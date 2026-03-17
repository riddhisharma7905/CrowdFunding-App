import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";

const TOKEN_COOKIE_NAME = "backit_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { authenticated: false, message: "Server configuration error" },
        { status: 500 },
      );
    }

    const payload = jwt.verify(token, jwtSecret);

    await connectDB();
    const user = await User.findById(payload.userId).select("fullName email");

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: payload.userId,
          email: payload.email,
          fullName: user.fullName,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
