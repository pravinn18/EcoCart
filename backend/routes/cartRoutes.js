import express from "express";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/save", protect, async (req, res) => {
  try {
    const { items } = req.body;

    const formattedItems = items.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.image,
      weight: item.weight,
    }));

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (cart) {
      cart.items = formattedItems;
      await cart.save();
    } else {
      cart = await Cart.create({
        user: req.user._id,
        items: formattedItems,
      });
    }

    res.json(cart);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Cart Save Error",
    });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.json([]);
    }

    const items = cart.items.map((item) => ({
      _id: item.product,
      quantity: item.quantity,
      name: item.name,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.image,
      weight: item.weight,
    }));

    res.json(items);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Fetch Cart Error",
    });
  }
});

export default router;
