import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
  const { wishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F9F9F9] flex flex-col items-center justify-center gap-6 pt-28 px-6 text-center">
        <div className="bg-red-50 p-8 rounded-full">
          <Heart size={40} className="text-red-200" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-black">
            Your wishlist is empty
          </h2>
          <p className="text-gray-400 text-sm">
            Save products you love by tapping the ♡ icon.
          </p>
        </div>
        <Link
          to="/"
          className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Heart size={18} className="fill-red-500 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A302B] tracking-tight">
              My Wishlist
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {wishlist.length} saved product{wishlist.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
