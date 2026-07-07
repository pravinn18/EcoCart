import express from "express";
import multer from "multer";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.get("/", async (req, res) => {
  const data = await Category.find();

  res.json(data);
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "categories",
            resource_type: "image",
            transformation: [
              {
                quality: "auto",
                fetch_format: "auto",
              },
            ],
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          },
        );

        streamifier.createReadStream(buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const newCategory = new Category({
      name,
      image: result.secure_url,
      public_id: result.public_id,
    });

    await newCategory.save();

    res.json(newCategory);
  } catch (error) {
    console.log("CATEGORY UPLOAD ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);

  res.json({
    message: "Deleted",
  });
});

export default router;
