const mongoose = require('mongoose');
const fs = require('fs');

async function test() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const mongoUriMatch = env.match(/MONGODB_URI=(.*)/);
  if (!mongoUriMatch) {
    console.error("NO MONGODB_URI");
    process.exit(1);
  }
  let uri = mongoUriMatch[1].trim();
  if (uri.startsWith('"') && uri.endsWith('"')) uri = uri.slice(1, -1);
  if (uri.startsWith("'") && uri.endsWith("'")) uri = uri.slice(1, -1);
  
  console.log("CONNECTING TO:", uri);

  await mongoose.connect(uri);
  const UserSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    city: String,
    country: String,
    pincode: String
  }, { collection: 'users' });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const user = await User.findOne({ email: 'riddhisharma7905@gmail.com' });
  if (!user) {
    console.log("USER NOT FOUND");
    process.exit(0);
  }
  console.log("CURRENT USER DATA:", JSON.stringify(user, null, 2));

  console.log("UPDATING TO MUMBAI/INDIA...");
  await User.updateOne({ email: 'riddhisharma7905@gmail.com' }, { city: 'Mumbai', country: 'India' });
  
  const updated = await User.findOne({ email: 'riddhisharma7905@gmail.com' });
  console.log("UPDATED USER DATA:", JSON.stringify(updated, null, 2));
  process.exit(0);
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
