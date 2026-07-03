const mongoose = require('mongoose');
const fs = require('fs');

async function fixCounts() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const mongoUriMatch = env.match(/MONGODB_URI=(.*)/);
  if (!mongoUriMatch) throw new Error("NO MONGODB_URI");
  
  let uri = mongoUriMatch[1].trim();
  if (uri.startsWith('"') && uri.endsWith('"')) uri = uri.slice(1, -1);
  if (uri.startsWith("'") && uri.endsWith("'")) uri = uri.slice(1, -1);

  await mongoose.connect(uri);
  
  const CampaignSchema = new mongoose.Schema({ backers: Number }, { collection: 'campaigns' });
  const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);

  const PledgeSchema = new mongoose.Schema({
    campaign: mongoose.Schema.Types.ObjectId,
    backer: mongoose.Schema.Types.ObjectId
  }, { collection: 'pledges' });
  const Pledge = mongoose.models.Pledge || mongoose.model('Pledge', PledgeSchema);

  const campaigns = await Campaign.find({});
  console.log(`POLLING ${campaigns.length} CAMPAIGNS...`);

  for (const campaign of campaigns) {
    
    const uniqueBackers = await Pledge.distinct('backer', { campaign: campaign._id });
    const count = uniqueBackers.length;
    
    console.log(`Campaign ${campaign._id}: Current Backers Stat: ${campaign.backers} -> Corrected Unique Backers: ${count}`);
    
    await Campaign.updateOne({ _id: campaign._id }, { $set: { backers: count } });
  }

  console.log("ALL CAMPAIGNS CORRECTED.");
  process.exit(0);
}

fixCounts().catch(err => {
  console.error(err);
  process.exit(1);
});
