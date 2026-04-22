import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
  const db = mongoose.connection.db;
  const campaigns = await db.collection("campaigns").find({}).toArray();
  console.log(campaigns.map(c => ({ title: c.title, imageUrl: c.imageUrl })));
  process.exit(0);
});
