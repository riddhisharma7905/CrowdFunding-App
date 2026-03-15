import mongoose from "mongoose";

const PledgeSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    backerName: {
      type: String,
      required: true,
      trim: true,
    },
    backerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Pledge || mongoose.model("Pledge", PledgeSchema);
