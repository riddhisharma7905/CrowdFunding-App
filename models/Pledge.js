import mongoose from "mongoose";

const PledgeSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    backer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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


if (mongoose.models.Pledge) {
  delete mongoose.models.Pledge;
}

const Pledge = mongoose.model("Pledge", PledgeSchema);

export default Pledge;
