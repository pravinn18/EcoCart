import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,

  isPlusMember: user.isPlusMember ?? false,
  isNewUser: user.isNewUser ?? true,
  loyaltyPoints: user.loyaltyPoints ?? 0,
  streakCount: user.streakCount ?? 0,
  plusExpiryDate: user.plusExpiryDate ?? null,
  lastStreakRewardDate: user.lastStreakRewardDate ?? null,
  totalOrdersPlaced: user.totalOrdersPlaced ?? 0,
  firstOrderDone: user.firstOrderDone ?? false,

  token: generateToken(user._id),
});

const otpStore = new Map();

const createTransporter = () =>
  nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 2525,
    secure: false,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailKey = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: emailKey });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: emailKey,
      password,
      isNewUser: true,
      firstOrderDone: false,
      loyaltyPoints: 0,
      streakCount: 0,
      totalOrdersPlaced: 0,
      isPlusMember: false,
    });
    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const response = userResponse(user);
    delete response.token;

    res.status(201).json(response);
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    console.log("===== LOGIN REQUEST =====");
    console.log("Request Body:", req.body);

    const { email, password } = req.body;

    const emailKey = email?.toLowerCase().trim();
    console.log("Searching email:", emailKey);

    

    const user = await User.findOne({ email: emailKey });

    console.log("User Found:", user);

    if (!user) {
      console.log("❌ USER NOT FOUND");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = user.matchPassword
      ? await user.matchPassword(password)
      : await bcrypt.compare(password, user.password);

    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ PASSWORD INCORRECT");
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.log("✅ LOGIN SUCCESS");

    if (
      user.isPlusMember &&
      user.plusExpiryDate &&
      new Date(user.plusExpiryDate) < new Date()
    ) {
      user.isPlusMember = false;
      user.plusExpiryDate = null;
      await user.save();
    }

    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Setting Cookie...");

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const response = userResponse(user);
    delete response.token;

    res.status(200).json(response);
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};




export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const emailKey = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: emailKey,
    });

    if (existing) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = Date.now() + 2 * 60 * 1000;

    otpStore.set(emailKey, {
      otp,
      expiresAt,
    });

    console.log("OTP for", emailKey, "=", otp);

    const transporter = createTransporter();

    await transporter.verify();

    console.log("SMTP Connected Successfully");

    await transporter.sendMail({
      from: '"Ecocart" <ecocartec@gmail.com>',
      to: emailKey || email,
      subject: "Your Ecocart Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f5f0eb;font-family:Georgia,serif;">
          <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#0f2219 0%,#1A302B 100%);padding:36px 32px 28px;text-align:center;">
              <h1 style="color:#fff;font-size:22px;letter-spacing:6px;margin:0 0 6px;text-transform:uppercase;">ECOCART</h1>
              <p style="color:#C28E77;font-size:10px;letter-spacing:3px;margin:0;text-transform:uppercase;">Email Verification</p>
            </div>
            <div style="height:3px;background:linear-gradient(90deg,transparent,#C28E77,transparent);"></div>
            <div style="padding:36px 32px;">
              <p style="color:#333;font-size:15px;margin:0 0 8px;">Hello!</p>
              <p style="color:#666;font-size:13px;line-height:1.7;margin:0 0 28px;">
                Use the code below to complete your Ecocart registration.
                Expires in <strong style="color:#1A302B;">2 minutes</strong>.
              </p>
             <div style="text-align:center;margin:0 0 28px;">
  <div style="display:inline-block;background:#f8f5f0;border:2px solid #C28E77;border-radius:16px;padding:20px 32px;max-width:100%;box-sizing:border-box;">
    <span style="font-size:36px;font-weight:700;letter-spacing:6px;color:#1A302B;font-family:Georgia,serif;display:block;">
      OTP_PLACEHOLDER
    </span>
  </div>
</div>
              <p style="color:#999;font-size:11px;text-align:center;margin:0;">Never share this code with anyone.</p>
            </div>
            <div style="background:#1A302B;padding:16px;text-align:center;">
              <p style="color:rgba(255,255,255,0.3);font-size:10px;margin:0;letter-spacing:2px;text-transform:uppercase;">Ecocart · Secure Verification</p>
            </div>
          </div>
        </body>
        </html>
      `.replace("OTP_PLACEHOLDER", otp),
    });

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

export const verifyOtpAndRegister = async (req, res) => {
  try {
    console.log("VERIFY OTP BODY:", req.body);

    const { name, email, password, otp } = req.body || {};

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailKey = email.toLowerCase().trim();

    const record = otpStore.get(emailKey);

    console.log("OTP RECORD:", record);

    if (!record) {
      return res.status(400).json({
        message: "OTP expired or not found",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(emailKey);

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Incorrect OTP",
      });
    }

    otpStore.delete(emailKey);

    const existingUser = await User.findOne({
      email: emailKey,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: emailKey,
      password,
      isAdmin: false,

      isNewUser: true,
      firstOrderDone: false,
      loyaltyPoints: 0,
      streakCount: 0,
      totalOrdersPlaced: 0,
      isPlusMember: false,
      plusExpiryDate: null,
      lastStreakRewardDate: null,
    });
    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const response = userResponse(user);
    delete response.token;

    res.status(201).json(response);
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const emailKey = email.toLowerCase().trim();

    const record = otpStore.get(emailKey);

    if (!record) {
      return res.status(400).json({
        message: "OTP expired or not found",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(emailKey);

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (record.otp !== otp.toString().trim()) {
      return res.status(400).json({
        message: "Incorrect OTP",
      });
    }

    const user = await User.findOne({
      email: emailKey,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password = password;

    await user.save();

    otpStore.delete(emailKey);

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Failed to reset password",
      error: error.message,
    });
  }
};

export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const emailKey = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailKey });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = Date.now() + 2 * 60 * 1000;

    otpStore.set(emailKey, {
      otp,
      expiresAt,
    });

    const transporter = createTransporter();

    await transporter.sendMail({
      from: '"Ecocart" <ecocartec@gmail.com>',
      to: emailKey,
      subject: "Ecocart Password Reset OTP",
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Expires in 2 minutes.</p>
      `,
    });

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Forgot password OTP error:", error);

    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
  });

  res.json({
    message: "Logged out",
  });
};