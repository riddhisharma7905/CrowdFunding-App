import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const TOKEN_COOKIE_NAME = "backit_token";

/**
 * Reads the JWT cookie and returns the authenticated user's ID,
 * or null if unauthenticated / invalid token.
 */
export async function getAuthenticatedUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    return typeof payload === "object" && payload.userId
      ? payload.userId
      : null;
  } catch {
    return null;
  }
}

/**
 * Reads the JWT cookie and returns both userId and email,
 * or null if unauthenticated.
 */
export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "object" && payload.userId) {
      return { userId: payload.userId, email: payload.email || null };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Serializes a Mongoose campaign document into a plain object
 * suitable for a JSON response.
 */
export function serializeCampaign(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  const ownerId =
    obj.owner && typeof obj.owner === "object"
      ? obj.owner._id.toString()
      : obj.owner?.toString() || null;

  return {
    id: obj._id.toString(),
    title: obj.title,
    category: obj.category,
    shortDescription: obj.shortDescription,
    fullDescription: obj.fullDescription,
    imageUrl: obj.imageUrl,
    goalAmount: obj.goalAmount,
    currentAmount: obj.currentAmount,
    backers: obj.backers,
    deadline: obj.deadline,
    status: obj.status,
    owner: ownerId,
    ownerName: obj.owner?.fullName ? obj.owner.fullName : "Anonymous",
    updates: (obj.updates || []).map(u => ({
      _id: u._id?.toString(),
      content: u.content,
      createdAt: u.createdAt,
    })).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}

/**
 * Serializes a Mongoose user document for public display.
 */
export function serializePublicUser(doc, followersCount = 0) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    fullName: obj.fullName,
    bio: obj.bio || "",
    birthdate: obj.birthdate || null,
    gender: obj.gender || null,
    occupation: obj.occupation || "",
    city: obj.city || "",
    country: obj.country || "",
    pincode: obj.pincode || "",
    followers: followersCount,
    createdAt: obj.createdAt,
  };
}

/**
 * Serializes a Mongoose user document for the authenticated user's own view.
 */
export function serializePrivateUser(doc) {
  const obj = doc.toObject ? doc.toObject() : doc;

  return {
    id: obj._id.toString(),
    fullName: obj.fullName,
    email: obj.email,
    bio: obj.bio || "",
    birthdate: obj.birthdate || null,
    gender: obj.gender || null,
    occupation: obj.occupation || "",
    city: obj.city || "",
    country: obj.country || "",
    pincode: obj.pincode || "",
    contactNumber: obj.contactNumber || "",
    followers: obj.followers ? obj.followers.length : 0,
    createdAt: obj.createdAt,
  };
}
