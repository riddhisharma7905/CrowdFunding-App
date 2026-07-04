import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }));
  const camps = await Campaign.find({ status: "rejected" });
  console.log(camps.map(c => ({ title: c.title, status: c.status, adminFeedback: c.adminFeedback })));
  process.exit(0);
});
