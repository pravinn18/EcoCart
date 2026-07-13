import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Check, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { computeOffer, getBadgeStyle } from "../utils/offerUtils";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const OfferBadge = ({ badge, variant }) => {
  if (!badge) return null;
  const style = getBadgeStyle(variant);


  const parts = badge.split(" · ");
  const main = parts[0];
  const sub = parts[1];

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        pointerEvents: "none",
      }}
    >
      
      <div
        style={{
          background: style.bg,
          color: style.text,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          padding: "3px 9px",
          borderRadius: sub ? "6px 6px 0 6px" : 99,
          boxShadow: `0 2px 10px ${style.shadow}`,
          lineHeight: 1.5,
          whiteSpace: "nowrap",
        }}
      >
        {main}
      </div>

      {sub && (
        <div
          style={{
            background: style.bg,
            color: style.text,
            opacity: 0.75,
            fontSize: 7.5,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "0 0 5px 5px",
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            marginTop: -1,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};


const ProductCard = ({ product }) => {
  const [isAdded, setIsAdded] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  if (!product) return null;

  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  })();

  const wishlisted = isWishlisted(product._id);
  const isOutOfStock = Number(product.stock) <= 0;


  const { finalPrice, badge, badgeVariant, discountPercent } = computeOffer(
    product,
    userInfo,
    false,
  );

  const hasDiscount = finalPrice < Number(product.price);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    addToCart({ ...product, discountPrice: finalPrice });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-2xl p-5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col h-full border border-gray-100">
    
      {!isOutOfStock && badge && (
        <OfferBadge badge={badge} variant={badgeVariant} />
      )}

      
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:scale-110"
      >
        <Heart
          size={15}
          className={`transition-all duration-300 ${heartBurst ? "scale-150" : "scale-100"} ${
            wishlisted
              ? "fill-red-500 text-red-500"
              : "fill-none text-gray-300 group-hover:text-gray-400"
          }`}
        />
      </button>

      <Link to={`/product/${product._id}`} className="block relative">
        
        <div className="aspect-square w-full mb-5 overflow-hidden rounded-xl bg-[#F9F9F9] flex items-center justify-center p-5 relative">
          <img
            src={
              product.image?.startsWith("http")
                ? product.image
                : `{product.image}`
            }
            alt={product.name}
            className={`h-full w-full object-contain transition-transform duration-700 group-hover:scale-105 ${
              isOutOfStock ? "opacity-50" : ""
            }`}
            onError={(e) =>
              (e.target.src = "https://via.placeholder.com/300?text=Product")
            }
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-black/75 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1 px-0.5">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            {product.weight || "Quality Assured"}
          </p>
          <h3 className="text-sm md:text-base font-semibold text-black leading-tight tracking-tight line-clamp-2">
            {product.name}
          </h3>
        </div>
      </Link>

      
      <div className="mt-auto pt-5 px-0.5 flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-base sm:text-lg font-bold text-black">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 line-through">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] font-bold text-emerald-600">
                {discountPercent}% off
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`relative flex items-center justify-center h-10 sm:h-11 rounded-full transition-all duration-500 shadow-md overflow-hidden flex-shrink-0 ${
            isOutOfStock
              ? "w-28 sm:w-32 bg-gray-200 text-gray-400 cursor-not-allowed"
              : isAdded
                ? "w-28 sm:w-32 bg-green-600 text-white"
                : "w-10 sm:w-11 bg-[#1A302B] text-[#C28E77] hover:w-28 sm:hover:w-32 hover:bg-black group/btn"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 px-2.5">
            {isOutOfStock ? (
              <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                Sold Out
              </span>
            ) : isAdded ? (
              <>
                <Check
                  size={16}
                  strokeWidth={3}
                  className="animate-in zoom-in duration-300"
                />
                <span className="text-[9px] font-bold uppercase tracking-widest whitespace-nowrap text-white">
                  Added!
                </span>
              </>
            ) : (
              <>
                <ShoppingBag size={16} strokeWidth={2} />
                <span className="hidden group-hover/btn:block text-white text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
                  Add to Cart
                </span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
