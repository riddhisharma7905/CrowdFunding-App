import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/helpers";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });

    const exists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (exists) return NextResponse.json({ message: "Category already exists" }, { status: 400 });

    const category = await Category.create({ name, description });
    return NextResponse.json({ message: "Category created", category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create category" }, { status: 500 });
  }
}
