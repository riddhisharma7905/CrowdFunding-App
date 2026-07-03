import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/helpers";

export async function PUT(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { name, description } = await request.json();

    if (!name) return NextResponse.json({ message: "Name is required" }, { status: 400 });

    const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true });
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    return NextResponse.json({ message: "Category updated", category });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findById(authUser.userId);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    // Optionally check if campaigns use this category before deleting. 
    // For now, allow deletion. Next time they edit a campaign, they'll pick a new one.
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
