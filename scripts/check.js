import './loadEnv.js';
import mongoose from 'mongoose';
import connectDB from '../lib/db.js';
import Campaign from '../models/Campaign.js';

async function run() {
  await connectDB();
  const c = await Campaign.findOne({ updates: { $ne: [] } });
  if (c) {
    console.log(JSON.stringify(c.updates, null, 2));
  } else {
    console.log('No updates found. Posting one...');
    const c2 = await Campaign.findOne();
    if (c2) {
      await Campaign.findByIdAndUpdate(c2._id, {
        $push: {
          updates: {
            content: "Test Update",
            createdAt: new Date()
          }
        }
      });
      const c3 = await Campaign.findById(c2._id);
      console.log(JSON.stringify(c3.updates, null, 2));
    }
  }
  process.exit(0);
}
run();
