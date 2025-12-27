import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "ngo", "bloodbank", "hospital", "admin"],
      required: true
    },

    organizationName: String,
    registrationNumber: String
  },
  { timestamps: true }
);

export default mongoose.model("users", userSchema);
