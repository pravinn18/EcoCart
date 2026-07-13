import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
};

export const createProduct = async (req, res) => {

console.log("BODY:", req.body);
console.log("FILE:", req.file);

  try {
    const {
      name,
      brand,
      category,
      lifestyle,
      weight,
      unit,
      price,
      discountPrice,
      stock,
      description,
    } = req.body;

    let image = "";
    let public_id = "";

    if (req.file) {
      const result = await streamUpload(req.file.buffer);

      image = result.secure_url;

      public_id = result.public_id;
    }

    const product = new Product({
      name,
      brand,
      category,
      lifestyle: lifestyle?.trim(),

      weight,
      unit,

      price: Number(price),

      discountPrice: Number(discountPrice) || 0,

      stock: Number(stock),

      description,

      image,
      public_id,
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);
    console.error(error.stack);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      lifestyle,
      weight,
      unit,
      price,
      discountPrice,
      stock,
      description,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      if (req.file) {
        if (product.public_id) {
          await cloudinary.uploader.destroy(product.public_id);
        }
        const result = await streamUpload(req.file.buffer);
        product.image = result.secure_url;
        product.public_id = result.public_id;
      }

      product.name = name || product.name;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.lifestyle = lifestyle?.trim() || product.lifestyle;
      product.weight = weight || product.weight;
      product.unit = unit || product.unit;
      product.price = price || product.price;
      product.discountPrice = discountPrice || product.discountPrice;
      product.stock = stock || product.stock;
      product.description = description || product.description;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);
    console.error(error.stack);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      if (product.public_id) {
        await cloudinary.uploader.destroy(product.public_id);
      }
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);
    console.error(error.stack);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q, sort, brands, discount, availability, lifestyle } = req.query;

    let filter = {};

  if (lifestyle?.trim()) {
    filter.lifestyle = {
      $regex: `^${lifestyle.trim()}$`,
      $options: "i",
    };
  }

    if (q?.trim()) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ];
    }

    if (brands?.trim()) {
      const brandList = brands
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);

      if (brandList.length === 1) {
        filter.brand = { $regex: `^${brandList[0]}$`, $options: "i" };
      } else if (brandList.length > 1) {
        filter.brand = {
          $in: brandList.map((b) => new RegExp(`^${b}$`, "i")),
        };
      }
    }

    if (availability === "instock") {
      filter.stock = { $gt: 10 };
    } else if (availability === "lowstock") {
      filter.stock = { $gt: 0, $lte: 10 };
    } else if (availability === "outofstock") {
      filter.stock = 0;
    }

    let products = await Product.find(filter);

    if (discount) {
      const minDiscount = Number(discount);
      products = products.filter((p) => {
        const pct =
          p.price > 0 ? ((p.price - p.discountPrice) / p.price) * 100 : 0;
        return pct >= minDiscount;
      });
    }

    if (sort === "low-high") {
      products.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (sort === "high-low") {
      products.sort((a, b) => b.discountPrice - a.discountPrice);
    } else if (sort === "popular") {
      products.sort((a, b) => b.salesCount - a.salesCount);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLifestyleProducts = async (req, res) => {
  try {
    const lifestyleName = decodeURIComponent(req.params.name).trim();

    const products = await Product.find({
      lifestyle: {
        $regex: `^${lifestyleName}$`,
        $options: "i",
      },
    });

    res.json(products);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR");
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
};