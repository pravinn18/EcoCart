import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const MAX_CYCLES = 4;
const PLUS_BUY_PRICE = 299;

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (
      user.isPlusMember &&
      user.plusExpiryDate &&
      new Date(user.plusExpiryDate) < new Date()
    ) {
      user.isPlusMember = false;
      user.plusExpiryDate = null;
      user.streakCount = 0;

      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error("profile error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;

    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      isAdmin: updated.isAdmin,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/activate-plus", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if ((user.streakCount || 0) < MAX_CYCLES) {
      return res.status(400).json({
        message: `Need ${
          MAX_CYCLES - (user.streakCount || 0)
        } more cycle(s) to unlock Plus`,
      });
    }

    if (user.isPlusMember) {
      return res.status(400).json({
        message: "You are already a Plus member",
      });
    }

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);

    user.isPlusMember = true;
    user.plusExpiryDate = expiry;

    user.streakCount = 0;
    user.lastStreakRewardDate = null;

    await user.save();

    res.json({
      message: "Plus activated successfully!",
      plusExpiryDate: expiry,
      isPlusMember: true,
      streakCount: 0,
    });
  } catch (err) {
    console.error("activate-plus error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/buy-plus", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.isPlusMember) {
      return res.status(400).json({
        message: "You are already a Plus member",
      });
    }


    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 90);

    user.isPlusMember = true;
    user.plusExpiryDate = expiry;
    user.hasPaidForPlus = true;
    user.paidForPlusAt = new Date();

    await user.save();

    res.json({
      message: `Plus activated for ₹${PLUS_BUY_PRICE}!`,
      plusExpiryDate: expiry,
      isPlusMember: true,
      hasPaidForPlus: true,
    });
  } catch (err) {
    console.error("buy-plus error:", err);

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/record-order", protect, async (req, res) => {
  try {
    console.log("RECORD ORDER BODY:", req.body);

    
    const totalPrice = Number(req.body?.totalPrice);

    if (isNaN(totalPrice) || totalPrice <= 0) {
      return res.status(400).json({
        message: "Valid totalPrice is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const now = new Date();

    if (
      user.isPlusMember &&
      user.plusExpiryDate &&
      new Date(user.plusExpiryDate) < now
    ) {
      user.isPlusMember = false;
      user.plusExpiryDate = null;
      user.streakCount = 0;
      user.lastStreakRewardDate = null;
    }

    if (user.isNewUser) {
      user.isNewUser = false;
    }

    if (!user.firstOrderDone) {
      user.firstOrderDone = true;
    }

    const isPlus = user.isPlusMember || false;

    const earnedPoints = isPlus
      ? Math.floor(totalPrice / 10) * 2
      : Math.floor(totalPrice / 10);

    user.loyaltyPoints = Number(user.loyaltyPoints || 0) + earnedPoints;

    user.totalOrdersPlaced = Number(user.totalOrdersPlaced || 0) + 1;

    if (totalPrice >= 500) {
      const currentStreak = Number(user.streakCount || 0);

      if (!user.lastStreakRewardDate) {
        user.streakCount = 1;
        user.lastStreakRewardDate = now;
      } else {
        const lastReward = new Date(user.lastStreakRewardDate);

        const diffDays = Math.floor(
          (now.getTime() - lastReward.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays >= 14 && diffDays <= 28) {
          user.streakCount = Math.min(currentStreak + 1, MAX_CYCLES);

          user.lastStreakRewardDate = now;
        }

        else if (diffDays > 28) {
          user.streakCount = 1;
          user.lastStreakRewardDate = now;
        }

      }
    }

    await user.save();

    res.status(200).json({
      message: "Order recorded successfully",

      loyaltyPoints: user.loyaltyPoints,
      streakCount: user.streakCount,
      isPlusMember: user.isPlusMember,
      isNewUser: user.isNewUser,
      firstOrderDone: user.firstOrderDone,
      plusExpiryDate: user.plusExpiryDate,
      lastStreakRewardDate: user.lastStreakRewardDate,
      totalOrdersPlaced: user.totalOrdersPlaced,
    });
  } catch (err) {
    console.error("record-order error:", err);

    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

export default router;
