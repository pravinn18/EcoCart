import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios";
import { computeOffer, getNewUserOfferItemId } from "../utils/offerUtils";

const CartContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"))?.token;
    } catch {
      return null;
    }
  };

  const getUserInfo = () => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  };

  const fetchCart = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await axios.get(`${BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(data || []);
    } catch (error) {
      console.log("FETCH CART ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const saveCartToDatabase = async (updatedCart) => {
    try {
      const token = getToken();
      if (!token) return;
      await axios.post(
        `${BASE_URL}/api/cart/save`,
        { items: updatedCart },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      console.log("SAVE CART ERROR:", error.response?.data || error.message);
    }
  };

  const addToCart = async (product) => {
    try {
      const stock = Number(product.quantity || product.stock || 0);
      if (stock <= 0) {
        alert("Product is out of stock");
        return;
      }

      const userInfo = getUserInfo();


      const {
        finalPrice,
        discountPercent,
        discountStack,
        offerType,
        mrp,
        saved,
      } = computeOffer(product, userInfo, false);

     
      const offerBreakdown =
        discountStack.length > 0
          ? {
              offerType: offerType || "STANDARD OFFER",
              mrp,
              paid: finalPrice,
              saved,
              totalDiscountPercent: discountPercent,
              discountStack,
            }
          : null;

      let updatedCart = [];
      const exist = cartItems.find((item) => item._id === product._id);

      if (exist) {
        if (exist.quantity >= stock) {
          alert(`Only ${stock} items available in stock`);
          return;
        }
        updatedCart = cartItems.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: item.quantity + (product.qty || 1),
                // Refresh offerBreakdown in case offer changed
                offerBreakdown,
                discountPrice: finalPrice,
              }
            : item,
        );
      } else {
        if ((product.qty || 1) > stock) {
          alert(`Only ${stock} items available in stock`);
          return;
        }
        updatedCart = [
          ...cartItems,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            discountPrice: finalPrice,
            image: product.image,
            weight: product.weight,
            quantity: product.qty || 1,
            stock,
          
            offerBreakdown,
          },
        ];
      }

      const invalidItem = updatedCart.find(
        (item) => item.quantity > Number(item.stock || stock),
      );
      if (invalidItem) {
        alert(`Only ${invalidItem.stock} items available`);
        return;
      }

      setCartItems(updatedCart);
      await saveCartToDatabase(updatedCart);
    } catch (error) {
      console.log("ADD TO CART ERROR:", error.message);
    }
  };

  const removeFromCart = async (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    await saveCartToDatabase(updatedCart);
  };

  const updateQuantity = async (id, amount) => {
    const updatedCart = cartItems.map((item) => {
      if (item._id === id) {
        const maxStock = Number(item.stock || item.quantity);
        const newQty = item.quantity + amount;
        if (newQty < 1) return item;
        if (newQty > maxStock) {
          alert(`Only ${maxStock} items available in stock`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(updatedCart);
    await saveCartToDatabase(updatedCart);
  };

  const clearCart = async () => {
    setCartItems([]);
    await saveCartToDatabase([]);
  };

  const totalAmount = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.discountPrice || item.price) * item.quantity,
    0,
  );

  const userInfo = getUserInfo();
  const newUserOfferItemId = getNewUserOfferItemId(cartItems, userInfo);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        loading,
        fetchCart,
        newUserOfferItemId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
