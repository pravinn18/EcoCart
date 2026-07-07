import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();


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

const buildOfferBreakdown = (product, user, paidPrice) => {
  const price = Number(product.price) || 0;
  const isPlus = Boolean(user?.isPlusMember);
  const cap = isPlus ? 30 : 25;

  const discountStack = [];
  let running = 0;

  const tryAdd = (label, percent, detail = null) => {
    const room = cap - running;
    if (room <= 0) return;
    const applied = Math.min(percent, room);
    const entry = { label, percent: applied };
    if (detail) entry.detail = detail;
    discountStack.push(entry);
    running += applied;
  };

  if (product.expiryDate) {
    const daysLeft = Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) / 86_400_000,
    );
    if (daysLeft > 0 && daysLeft <= 3)
      tryAdd("Expiring Soon", 20, `${daysLeft}d left`);
    else if (daysLeft <= 7)
      tryAdd("Expiring Soon", 15, `${daysLeft} days left`);
    else if (daysLeft <= 10)
      tryAdd("Expiring Soon", 10, `${daysLeft} days left`);
  }

  const stock = Number(product.stock) || 0;
  if (stock > 0 && stock <= 10) tryAdd("Low Stock", 5, `${stock} left`);

  const views = Number(product.views) || 0;
  if (views < 50) tryAdd("Low Views", 5, `${views} views`);

  const sales = Number(product.salesCount) || 0;
  if (sales < 5) tryAdd("Low Sales", 5, `${sales} sold`);

  if (isPlus) tryAdd("Plus Member Bonus", 5);

  const totalDiscountPercent = Math.min(running, cap);
  if (totalDiscountPercent === 0) return null;

  const mrp = price;
  const finalPrice = Math.round(price * (1 - totalDiscountPercent / 100));
  const saved = mrp - finalPrice;

  // offerType
  let offerType = "STANDARD OFFER";
  if (product.expiryDate) {
    const d = Math.ceil(
      (new Date(product.expiryDate).getTime() - Date.now()) / 86_400_000,
    );
    if (d <= 10) offerType = "EXPIRY OFFER";
  } else if (isPlus) {
    offerType = "PLUS OFFER";
  }

  return {
    offerType,
    mrp,
    paid: Number(paidPrice) || finalPrice,
    saved,
    totalDiscountPercent,
    discountStack,
  };
};

router.post("/", protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const user = await User.findById(req.user._id).select(
      "isPlusMember isNewUser totalOrdersPlaced firstOrderDone",
    );

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `${item.name} not found` });
      }

      const availableStock =
        typeof product.quantity === "number"
          ? product.quantity
          : typeof product.stock === "number"
            ? product.stock
            : 0;

      if (availableStock <= 0)
        return res
          .status(400)
          .json({ message: `${product.name} is out of stock` });

      if (availableStock < item.qty)
        return res.status(400).json({
          message: `Only ${availableStock} items available for ${product.name}`,
        });

      if (typeof product.quantity === "number")
        product.quantity = Math.max(0, product.quantity - item.qty);
      if (typeof product.stock === "number")
        product.stock = Math.max(0, product.stock - item.qty);

      const updatedStock =
        typeof product.quantity === "number"
          ? product.quantity
          : typeof product.stock === "number"
            ? product.stock
            : 0;

      product.isOutOfStock = updatedStock <= 0;
      await product.save();
    }
    const formattedOrderItems = await Promise.all(
      orderItems.map(async (item) => {
        let offerBreakdown = item.offerBreakdown || null;

        // Fallback: recompute from product if frontend didn't send it
        if (!offerBreakdown) {
          const product = await Product.findById(item.product).select(
            "price mrp discountPrice stock views salesCount expiryDate",
          );
          if (product) {
            offerBreakdown = buildOfferBreakdown(product, user, item.price);
          }
        }

        return {
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item.product,
          offerBreakdown,
        };
      }),
    );

    const order = await Order.create({
      user: req.user._id,
      orderItems: formattedOrderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      orderStatus: "Pending",
      isPaid: paymentMethod === "Online",
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Place order error:", error);
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
});

router.get("/myorders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error("Fetch orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/admin/allorders", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Fetch all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/admin/dashboard", protect, admin, async (req, res) => {
  try {
    const offset = (await MonthlyReset.findOne({})) || {};

    const orders = await Order.find({});
    const usersCount = await User.countDocuments();
    const products = await Product.find({});

    const paidOrders = orders.filter((o) => o.isPaid);
    const cancelledOrders = orders.filter((o) => o.isCancelled);
    const refundedOrders = orders.filter((o) => o.isRefunded);
    const codOrders = orders.filter((o) => o.paymentMethod === "COD");

    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);

    const totalRefunded = refundedOrders.reduce(
      (acc, o) => acc + o.totalPrice,
      0,
    );

    const lowStockProducts = products.filter((p) => {
      const stock =
        typeof p.quantity === "number"
          ? p.quantity
          : typeof p.stock === "number"
            ? p.stock
            : 0;

      return stock <= 5;
    });

    res.json({
      totalRevenue: Math.max(0, totalRevenue - (offset.revenueOffset || 0)),

      totalRefunded: Math.max(0, totalRefunded - (offset.refundedOffset || 0)),

      paidOrders: Math.max(0, paidOrders.length - (offset.paidOffset || 0)),

      cancelledOrders: Math.max(
        0,
        cancelledOrders.length - (offset.cancelledOffset || 0),
      ),

      refundedOrders: Math.max(
        0,
        refundedOrders.length - (offset.refundedCountOffset || 0),
      ),

      totalOrders: Math.max(0, orders.length - (offset.totalOffset || 0)),

      codOrders: Math.max(0, codOrders.length - (offset.codOffset || 0)),

      usersCount,
      productsCount: products.length,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: "Dashboard fetch failed",
    });
  }
});

router.put("/reset-monthly-data", protect, admin, async (req, res) => {
  try {
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          isRefunded: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRefunded = await Order.aggregate([
      {
        $match: {
          isRefunded: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    await MonthlyReset.findOneAndUpdate(
      {},
      {
        revenueOffset: totalRevenue[0]?.total || 0,

        refundedOffset: totalRefunded[0]?.total || 0,

        paidOffset: await Order.countDocuments({
          isPaid: true,
        }),

        cancelledOffset: await Order.countDocuments({
          isCancelled: true,
        }),

        refundedCountOffset: await Order.countDocuments({
          isRefunded: true,
        }),

        totalOffset: await Order.countDocuments(),

        codOffset: await Order.countDocuments({
          paymentMethod: "COD",
        }),

        resetAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      },
    );

    res.json({
      message: "Monthly stats reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Reset failed",
    });
  }
});

router.put("/:id/deliver", protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.orderStatus = "Delivered";
    order.isPaid = true;

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    console.error("Deliver error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
});

router.put("/:id/status", protect, admin, async (req, res) => {
  try {
    const { action } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (action === "inTransit") {
      order.orderStatus = "In Transit";
      order.inTransitAt = new Date();
    } else if (action === "outForDelivery") {
      order.orderStatus = "Out for Delivery";
      order.assignedAt = new Date();
    } else if (action === "deliver") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.orderStatus = "Delivered";
      order.isPaid = true;
    } else if (action === "cancel") {
      order.isCancelled = true;
      order.orderStatus = "Cancelled";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Failed to update status" });
  }
});

router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const minutesSincePlaced =
      (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60;

    if (minutesSincePlaced > 5)
      return res
        .status(400)
        .json({ message: "Cancellation window has passed (5 minutes)." });

    if (order.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (typeof product.quantity === "number") product.quantity += item.qty;
        if (typeof product.stock === "number") product.stock += item.qty;
        product.isOutOfStock = false;
        await product.save();
      }
    }

    order.isCancelled = true;
    order.orderStatus = "Cancelled";
    const updated = await order.save();
    res.json(updated);
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

router.put("/:id/refund", protect, admin, async (req, res) => {
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
    order.refundedAt = new Date();
    const updated = await order.save();
    res.json({ message: "Order refunded successfully", order: updated });
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ message: "Failed to refund order" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

export default router;
