import mongoose from "mongoose";

const campSlotSchema = new mongoose.Schema(
  {
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NgoCamp",
      required: true
    },

    slotTime: {
      type: String,
      required: true
      // example: "09:00 - 10:00"
    },

    maxDonors: {
      type: Number,
      required: true
    },

    bookedCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("CampSlot", campSlotSchema);
