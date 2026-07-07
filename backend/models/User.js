import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    isPlusMember: {
      type: Boolean,
      default: false,
    },

    plusExpiryDate: {
      type: Date,
      default: null,
    },

    streakCount: {
      type: Number,
      default: 0,
    },

    lastStreakRewardDate: {
      type: Date,
      default: null,
    },

    isNewUser: {
      type: Boolean,
      default: true,
    },

    firstOrderDone: {
      type: Boolean,
      default: false,
    },

    totalOrdersPlaced: {
      type: Number,
      default: 0,
    },

    hasPaidForPlus: {
      type: Boolean,
      default: false,
    },

    paidForPlusAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
