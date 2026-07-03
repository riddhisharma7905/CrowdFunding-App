import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const TOKEN_COOKIE_NAME = "backit_token";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    
    const authHeader = req.headers.get("cookie") || "";
    const cookieValue = authHeader
      .split("; ")
      .find((row) => row.startsWith(TOKEN_COOKIE_NAME + "="));

    if (!cookieValue) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = cookieValue.split("=")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const currentUserId = decoded.userId;

    const creatorId = id;

    
    if (currentUserId === creatorId) {
      return new Response(
        JSON.stringify({ error: "You cannot follow yourself" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    
    const creator = await User.findById(creatorId);
    if (!creator) {
      return new Response(JSON.stringify({ error: "Creator not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const alreadyFollowing = creator.followers.some(
      (f) => String(f) === String(currentUserId),
    );

    if (!alreadyFollowing) {
      
      creator.followers.push(currentUserId);
      await creator.save();
    }

    return new Response(
      JSON.stringify({
        message: "Followed successfully",
        followers: creator.followers.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Error following creator", err);
    return new Response(JSON.stringify({ error: "Failed to follow creator" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    
    const authHeader = req.headers.get("cookie") || "";
    const cookieValue = authHeader
      .split("; ")
      .find((row) => row.startsWith(TOKEN_COOKIE_NAME + "="));

    if (!cookieValue) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = cookieValue.split("=")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    const currentUserId = decoded.userId;

    const creatorId = id;

    const creator = await User.findById(creatorId);
    if (!creator) {
      return new Response(JSON.stringify({ error: "Creator not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    
    creator.followers = creator.followers.filter(
      (f) => String(f) !== String(currentUserId),
    );
    await creator.save();

    return new Response(
      JSON.stringify({
        message: "Unfollowed successfully",
        followers: creator.followers.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("Error unfollowing creator", err);
    return new Response(
      JSON.stringify({ error: "Failed to unfollow creator" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
