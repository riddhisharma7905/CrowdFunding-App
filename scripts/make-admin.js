
const mongoose = require("mongoose");
const readline = require("readline");


require("dotenv").config({ path: ".env.local" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Please ensure MONGODB_URI is set in .env.local");
  process.exit(1);
}


const UserSchema = new mongoose.Schema({
  email: String,
  role: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function makeAdmin() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    rl.question("Enter the email of the user to make admin: ", async (email) => {
      if (!email) {
        console.log("Email cannot be empty.");
        process.exit(1);
      }

      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found with email:", email);
      } else {
        user.role = "admin";
        await user.save();
        console.log(`Successfully made ${email} an admin!`);
      }

      await mongoose.disconnect();
      rl.close();
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
}

makeAdmin();
