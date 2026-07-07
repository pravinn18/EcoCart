import express from "express";
import {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtpAndRegister,
  resetPassword,
  sendForgotPasswordOtp,
} from "../controllers/authController.js";

const router = express.Router();
router.post("/register", registerUser); // POST /api/auth/register  (legacy)
router.post("/login", loginUser); // POST /api/auth/login

router.post("/send-otp", sendOtp); // POST /api/auth/send-otp
router.post("/verify-otp", verifyOtpAndRegister); // POST /api/auth/verify-otp
router.post("/reset-password", resetPassword);
router.post("/forgot-password-otp", sendForgotPasswordOtp);

export default router;
