import express from "express";
import multer from "multer";
import Offer from "../models/Offer.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    res.status(500).json({
      message: "Fetch error",
    });
  }
});

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "offers",
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
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const result = await streamUpload(req.file.buffer);

    const newOffer = await Offer.create({
      image: result.secure_url,
      public_id: result.public_id,
      link: "",
    });

    res.json(newOffer);
  } catch (error) {
    console.log("UPLOAD ERROR:", error);

    res.status(500).json({
      message: "Upload failed",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (offer?.public_id) {
      await cloudinary.uploader.destroy(offer.public_id);
    }

    await Offer.findByIdAndDelete(req.params.id);

    res.json({
      message: "Deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { link } = req.body;

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      { link },
      {
        returnDocument: "after",
      },
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({
      message: "Link update failed",
    });
  }
});

router.put("/image/:id", upload.single("image"), async (req, res) => {
  try {
    const oldOffer = await Offer.findById(req.params.id);

    if (oldOffer?.public_id) {
      await cloudinary.uploader.destroy(oldOffer.public_id);
    }

    const result = await streamUpload(req.file.buffer);

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      {
        image: result.secure_url,
        public_id: result.public_id,
      },
      {
        returnDocument: "after",
      },
    );

    res.json(updated);
  } catch (error) {
    console.log("IMAGE UPDATE ERROR:", error);

    res.status(500).json({
      message: "Image update failed",
    });
  }
});



export default router;
