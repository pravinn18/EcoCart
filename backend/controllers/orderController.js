import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";


const MonthlyReset =
  mongoose.models.MonthlyReset ||
  mongoose.model(
    "MonthlyReset",
    new mongoose.Schema({
      revenueOffset: { type: Number, default: 0 },
      refundedOffset: { type: Number, default: 0 },
      paidOffset: { type: Number, default: 0 },
      cancelledOffset: { type: Number, default: 0 },
      refundedCountOffset: { type: Number, default: 0 },
      totalOffset: { type: Number, default: 0 },
      codOffset: { type: Number, default: 0 },
      resetAt: { type: Date, default: null },
    }),
  );

const buildOfferBreakdown = (product, isPlus, isNewUser, itemPrice) => {
  const cap = isPlus ? 30 : 25;
  const discountStack = [];
  let runningTotal = 0;

  const tryAdd = (label, percent, detail = null) => {
    const remaining = cap - runningTotal;
    if (remaining <= 0) return; // already at cap
    const applied = Math.min(percent, remaining);
    const entry = { label, percent: applied };
    if (detail) entry.detail = detail;
    discountStack.push(entry);
    runningTotal += applied;
  };

  if (isNewUser) {
    tryAdd("New User Offer", 20);
  }

  if (product.expiryDate) {
    const daysToExpiry = Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysToExpiry <= 3 && daysToExpiry > 0) {
      tryAdd(
        "Expiring Soon",
        20,
        `Expires in ${daysToExpiry} day${daysToExpiry !== 1 ? "s" : ""}`,
      );
    } else if (daysToExpiry <= 7) {
      tryAdd("Expiring Soon", 15, `Expires in ${daysToExpiry} days`);
    } else if (daysToExpiry <= 10) {
      tryAdd("Expiring Soon", 10, `Expires in ${daysToExpiry} days`);
    }
  }

  const stock = product.stock ?? 999;
  if (stock > 0 && stock <= 10) {
    tryAdd("Low Stock", 5, `Only ${stock} left`);
  }

  const views = product.views || 0;
  if (views < 50) {
    tryAdd("Low Views", 5, `${views} views`);
  }

  const sales = product.salesCount || 0;
  if (sales < 5) {
    tryAdd("Low Sales", 5, `${sales} sold`);
  }

  if (isPlus) {
    tryAdd("Plus Member Bonus", 5);
  }

  const mrp = product.mrp && product.mrp > 0 ? product.mrp : itemPrice;
  const paid = itemPrice;
  const saved = Math.max(0, mrp - paid);

  let offerType = "STANDARD OFFER";
  if (isNewUser) offerType = "NEW USER OFFER";
  else if (
    product.expiryDate &&
    Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ) <= 10
  ) {
    offerType = "EXPIRY OFFER";
  } else if (isPlus) offerType = "PLUS OFFER";

  return discountStack.length > 0
    ? {
        mrp,
        paid,
        saved,
        offerType,
        totalDiscountPercent: runningTotal,
        cap,
        discountStack,
      }
    : null;
};

export const createOrder = async (req, res) => {
  try {
    const { orderItems, totalPrice, shippingAddress, paymentMethod } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }
    console.log("CREATE ORDER HIT");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const price = Number(totalPrice) || 0;

    if (user.isPlusMember && user.plusExpiryDate) {
      if (new Date(user.plusExpiryDate) < now) {
        user.isPlusMember = false;
        user.plusExpiryDate = null;
        user.streakCount = 0;
      }
    }

    const isPlus = user.isPlusMember || false;

    const priorOrderCount = await Order.countDocuments({ user: req.user._id });
    const isNewUser = priorOrderCount === 0 && !user.firstOrderDone;

    let cheapestIdx = 0;
    let cheapestPrice = Infinity;
    orderItems.forEach((item, idx) => {
      if ((item.price ?? 0) < cheapestPrice) {
        cheapestPrice = item.price;
        cheapestIdx = idx;
      }
    });

    const appliedOffers = [];
    if (isNewUser) appliedOffers.push("new_user");

    const finalItems = await Promise.all(
      orderItems.map(async (item, idx) => {
        let dbProduct = null;

        try {
          dbProduct = await Product.findById(item.product || item._id);

          console.log("PRODUCT FOUND:", JSON.stringify(dbProduct, null, 2));
        } catch (err) {
          console.log("PRODUCT ERROR:", err);
        }

        if (!dbProduct) {
          return {
            ...item,
            offerBreakdown: null,
          };
        }

        const applyNewUser = isNewUser && idx === cheapestIdx;

        const breakdown = buildOfferBreakdown(
          dbProduct,
          isPlus,
          applyNewUser,
          item.price,
        );

        return {
          ...item,
          offerBreakdown: breakdown || null,
        };
      }),
    );

    console.log("FINAL ITEMS:", JSON.stringify(finalItems, null, 2));
    console.log("FINAL ITEMS");
    console.log(finalItems);

    const order = new Order({
      user: req.user._id,
      orderItems: finalItems,
      shippingAddress,
      paymentMethod,
      totalPrice: price,
      appliedOffers,
      newUserOfferApplied: isNewUser,
    });

    const createdOrder = await order.save();

    await Promise.all(
      orderItems.map(async (item) => {
        try {
          await Product.findByIdAndUpdate(item.product || item._id, {
            $inc: { salesCount: item.qty || 1 },
          });
        } catch (_) {}
      }),
    );

    if (user.isNewUser) user.isNewUser = false;
    if (!user.firstOrderDone) user.firstOrderDone = true;

    const pointsEarned = isPlus
      ? Math.floor(price / 10) * 2
      : Math.floor(price / 10);
    user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
    user.totalOrdersPlaced = (user.totalOrdersPlaced || 0) + 1;

    if (price >= 500) {
      const currentStreak = Number(user.streakCount || 0);

      if (!user.lastStreakRewardDate) {
        user.streakCount = 1;
        user.lastStreakRewardDate = now;
      } else {
        const diffDays = Math.floor(
          (now.getTime() - new Date(user.lastStreakRewardDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (diffDays >= 14 && diffDays <= 28) {
          user.streakCount = Math.min(currentStreak + 1, 4);
          user.lastStreakRewardDate = now;
        } else if (diffDays > 28) {
          user.streakCount = 1;
          user.lastStreakRewardDate = now;
        }
      }
    }
    console.log("ORDER ABOUT TO SAVE");
    console.log(JSON.stringify(finalItems, null, 2));

    await user.save();

    res.status(201).json({
      ...createdOrder.toObject(),
      userUpdates: {
        loyaltyPoints: user.loyaltyPoints,
        streakCount: user.streakCount,
        isPlusMember: user.isPlusMember,
        isNewUser: user.isNewUser,
        firstOrderDone: user.firstOrderDone,
        lastStreakRewardDate: user.lastStreakRewardDate,
        plusExpiryDate: user.plusExpiryDate,
      },
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!order.isCancelled)
      return res
        .status(400)
        .json({ message: "Only cancelled orders can be refunded" });
    if (order.isRefunded)
      return res.status(400).json({ message: "Order already refunded" });

    order.isRefunded = true;
    order.refundedAt = Date.now();
    await order.save();

    res.json({ message: "Order refunded successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const resetMonthlyData = async (req, res) => {
  try {
    const [revenueResult] = await Order.aggregate([
      { $match: { isPaid: true, isRefunded: false } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const [refundedResult] = await Order.aggregate([
      { $match: { isRefunded: true } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const paidOrders = await Order.countDocuments({ isPaid: true });
    const cancelledOrders = await Order.countDocuments({
      isCancelled: true,
    });
    const refundedOrders = await Order.countDocuments({
      isRefunded: true,
    });
    const totalOrders = await Order.countDocuments({});
    const codOrders = await Order.countDocuments({
      paymentMethod: "COD",
    });

    await MonthlyReset.findOneAndUpdate(
      {},
      {
        revenueOffset: revenueResult?.total || 0,
        refundedOffset: refundedResult?.total || 0,
        paidOffset: paidOrders,
        cancelledOffset: cancelledOrders,
        refundedCountOffset: refundedOrders,
        totalOffset: totalOrders,
        codOffset: codOrders,
        resetAt: new Date(),
      },
      { upsert: true, new: true },
    );

    res.json({
      message: "Monthly stats reset successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Reset failed",
    });
  }
};

console.log("Controller create order");