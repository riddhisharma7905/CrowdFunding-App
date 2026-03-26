const mongoose = require('mongoose');
const fs = require('fs');

async function migrate() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const mongoUriMatch = env.match(/MONGODB_URI=(.*)/);
  if (!mongoUriMatch) {
    console.error("NO MONGODB_URI");
    process.exit(1);
  }
  let uri = mongoUriMatch[1].trim();
  if (uri.startsWith('"') && uri.endsWith('"')) uri = uri.slice(1, -1);
  if (uri.startsWith("'") && uri.endsWith("'")) uri = uri.slice(1, -1);

  await mongoose.connect(uri);
  
  const Pledge = mongoose.models.Pledge || mongoose.model('Pledge', new mongoose.Schema({
    backer: mongoose.Schema.Types.ObjectId,
    backerEmail: String
  }), 'pledges');

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    email: String
  }), 'users');

  const unlinkedPledges = await Pledge.find({ backer: { $exists: false } });
  console.log(`FOUND ${unlinkedPledges.length} UNLINKED PLEDGES.`);

  let linkedCount = 0;
  for (const pledge of unlinkedPledges) {
    const user = await User.findOne({ email: pledge.backerEmail });
    if (user) {
      await Pledge.updateOne({ _id: pledge._id }, { $set: { backer: user._id } });
      linkedCount++;
    }
  }

  console.log(`SUCCESSFULLY LINKED ${linkedCount} PLEDGES.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
