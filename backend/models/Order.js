import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  offerBreakdown: { type: mongoose.Schema.Types.Mixed }, // <-- added
});

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    orderItems: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
    },

    paymentMethod: {
      type: String,
      default: "COD",
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    appliedOffers: { type: [String], default: [] },
    newUserOfferApplied: { type: Boolean, default: false },

    isPaid: {
      type: Boolean,
      default: false,
    },

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    orderStatus: {
      type: String,
      default: "Pending",
    },

    inTransitAt: {
      type: Date,
    },

    assignedAt: {
      type: Date,
    },

    isRefunded: {
      type: Boolean,
      default: false,
    },

    refundedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
