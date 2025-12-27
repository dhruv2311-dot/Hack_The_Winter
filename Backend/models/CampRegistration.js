import mongoose from "mongoose";

const campRegistrationSchema = new mongoose.Schema(
  {
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NgoCamp",
      required: true
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CampSlot",
      required: true
    },

    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    mobileNumber: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    bloodGroup: {
      type: String,
      required: true
    },

    donationDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("CampRegistration", campRegistrationSchema);
