import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Campaign = mongoose.model('Campaign', new mongoose.Schema({}, { strict: false }));
  const topCampaignsRaw = await Campaign.find({
    status: { $in: ["active", "completed"] }
  }).sort({ currentAmount: -1 }).limit(5);

  console.log(topCampaignsRaw.map(c => ({ id: c._id, name: c.title, slug: c.slug, amount: c.currentAmount, goal: c.goalAmount, category: c.category })));
  process.exit(0);
});
