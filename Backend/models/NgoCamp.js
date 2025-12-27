import mongoose from "mongoose";

const ngoCampSchema = new mongoose.Schema(
  {
    /* 🔗 NGO Reference */
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // IMPORTANT: match your User model name
      required: true
    },

    /* 🏷️ Camp Basic Info */
    campName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    /* 📍 Location Details */
    location: {
      type: String,
      required: true
    },

    city: {
      type: String
    },

    state: {
      type: String
    },

    pincode: {
      type: String
    },

    /* 🗓️ Date & Time */
    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    /* 📞 Contact Person */
    contactPersonName: {
      type: String
    },

    contactMobile: {
      type: String
    },

    /* 🩸 Camp Configuration */
    totalSlots: {
      type: Number,
      default: 0
    },

    expectedDonors: {
      type: Number,
      default: 0
    },

    /* 🔄 Status Management */
    status: {
      type: String,
      enum: ["pending", "approved", "active", "completed", "cancelled"],
      default: "pending"
    },

    /* 🛡️ Admin / System */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("NgoCamp", ngoCampSchema);
