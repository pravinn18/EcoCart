import express from "express";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// ROUTES
import adRoutes from "./routes/adRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import lifestyleRoutes from "./routes/lifestyleRoutes.js";


const app = express();

// ── MIDDLEWARE ─────────────────────────────────────────────

// ✅ CORS
const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ✅ IMPORTANT: BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/payment", paymentRoutes);
// ✅ COOKIE PARSER

// ── STATIC FILES ──────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── API ROUTES ────────────────────────────────────────────
app.use("/api/ads", adRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/offers", offerRoutes);

app.use(
  "/api/lifestyle",

  lifestyleRoutes,
);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/users", userRoutes);

app.use("/api/upload", uploadRoutes);

// ── DATABASE ──────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("Mongo Error:", err);
  });

// ── SERVER ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
