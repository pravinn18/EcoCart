import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Product from "../models/Product.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getLifestyleProducts,
} from "../controllers/productController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  upload.single("image"),
  createProduct
);
router.get("/lifestyle/:name", getLifestyleProducts);

router.get("/search", searchProducts);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.put("/:id", upload.single("image"), updateProduct);

router.delete("/:id", deleteProduct);

router.put("/:id/stock", async (req, res) => {
  try {
    const { name, category, brand, weight, quantity, mfgDate, expiryDate } =
      req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (weight !== undefined) product.weight = weight;

    product.stock = Number(quantity);

    if (mfgDate !== undefined) product.mfgDate = mfgDate;
    if (expiryDate !== undefined) product.expiryDate = expiryDate;

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

export default router;
