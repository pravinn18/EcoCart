import express from "express";

import upload from "../middleware/upload.js";

import {
  getLifestyle,
  createLifestyle,
  deleteLifestyle,
  updateLifestyle,
  updateLifestyleImage,
} from "../controllers/lifestyleController.js";

const router = express.Router();

router.get(
  "/",

  getLifestyle,
);

router.post(
  "/",

  upload.single("image"),

  createLifestyle,
);

router.put(
  "/:id",

  updateLifestyle,
);

router.put(
  "/image/:id",

  upload.single("image"),

  updateLifestyleImage,
);

router.delete(
  "/:id",

  deleteLifestyle,
);

export default router;
