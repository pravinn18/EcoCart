import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  sendOtp,
  verifyOtpAndRegister,
  resetPassword,
  sendForgotPasswordOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", registerUser); 
router.post("/login", loginUser); 
router.post("/logout", logoutUser);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister); 
router.post("/reset-password", resetPassword);
router.post("/forgot-password-otp", sendForgotPasswordOtp);
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
