import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ name: String }));
  await Category.deleteMany({ name: { $nin: ['Technology', 'Home', 'Fitness', 'Health', 'Art', 'Games', 'Education', 'Animal', 'Environment'] } });
  console.log('Old categories deleted');
  process.exit(0);
}
clean();
