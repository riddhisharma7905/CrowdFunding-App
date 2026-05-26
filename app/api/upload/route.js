import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(request) {
  try {
    const { folder } = await request.json();

    // Cloudinary credentials
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary credentials missing in environment variables.");
      return NextResponse.json(
        { message: "Server misconfiguration. Cloudinary not configured." },
        { status: 500 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create signature payload
    let signatureStr = `timestamp=${timestamp}`;
    if (folder) {
      signatureStr = `folder=${folder}&${signatureStr}`;
    }
    signatureStr += apiSecret;

    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: folder || ""
    }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
