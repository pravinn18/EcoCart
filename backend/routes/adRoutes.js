import express from "express";
import multer from "multer";
import Ad from "../models/Ad.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});
router.get("/", async (req, res) => {
  const ads = await Ad.find().sort({ createdAt: -1 });

  res.json(ads);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("File size:", req.file?.size);
    

    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "ads",
            resource_type: "image",
            transformation: [
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        );

        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    console.log("Starting Cloudinary upload...");

    const result = await streamUpload(req.file.buffer);

    console.log("Cloudinary upload complete:", result.secure_url);

    console.log("BODY:", req.body);

    const newAd = new Ad({
      image: result.secure_url,

      title: req.body.title || "New Promotion",

      subtitle: req.body.subtitle || "",

      promotionText: req.body.promotionText || "",

      buttonText: req.body.buttonText || "Shop Now",

      link: req.body.link || "/",
    });

    await newAd.save();

    res.json(newAd);
  } catch (error) {
    console.log("FULL ERROR:");
    console.log(error);

    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
});

router.delete("/:id", async (req, res) => {
  await Ad.findByIdAndDelete(req.params.id);

  res.json({
    message: "Deleted",
  });
});

export default router;
