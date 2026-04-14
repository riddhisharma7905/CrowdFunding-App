import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "";

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Convert file to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64Data}`;

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

    const uploadFormData = new URLSearchParams();
    uploadFormData.append("file", dataUri);
    uploadFormData.append("api_key", apiKey);
    uploadFormData.append("timestamp", timestamp.toString());
    uploadFormData.append("signature", signature);
    if (folder) {
      uploadFormData.append("folder", folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadFormData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to upload to Cloudinary");
    }

    return NextResponse.json({ url: data.secure_url }, { status: 200 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { message: "Failed to upload image", error: error.message },
      { status: 500 }
    );
  }
}
