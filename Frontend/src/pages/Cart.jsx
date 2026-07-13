import React from "react";
import { useCart } from "../context/CartContext";
import { computeOffer } from "../utils/offerUtils";
import {
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalAmount,
    loading,
    newUserOfferItemId,
  } = useCart();

  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  })();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 pt-28">
        <Loader2 className="animate-spin text-[#C28E77]" size={40} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Syncing your selection...
        </p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 pt-28">
        <div className="bg-gray-50 p-8 rounded-full">
          <Trash2 size={40} className="text-gray-200" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-black">
            Your cart is empty
          </h2>
          <p className="text-gray-500">
            Discover our premium organic collection.
          </p>
        </div>
        <Link
          to="/"
          className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const totalSaved = cartItems.reduce((acc, item) => {
    const isNewUserItem = item._id === newUserOfferItemId;
    const { saved } = computeOffer(item, userInfo, isNewUserItem);
    return acc + saved * item.quantity;
  }, 0);

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-12 pt-28 sm:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
       
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8 sm:mb-12 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
          <span className="text-[#C28E77]">01 Cart</span>
          <div className="h-[1px] w-8 sm:w-12 bg-gray-200" />
          <span className="text-gray-400">02 Address</span>
          <div className="h-[1px] w-8 sm:w-12 bg-gray-200" />
          <span className="text-gray-400">03 Payment</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
       
          <div className="lg:col-span-2 space-y-4">
        
            <div className="bg-white p-4 rounded-lg flex items-center justify-between border border-gray-100 shadow-sm">
              <span className="text-sm font-semibold text-black">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)} Items
                Selected
              </span>
              <div className="flex items-center gap-3">
                {totalSaved > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Saving ₹{totalSaved.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Subtotal: ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {cartItems.map((item) => {
              const isNewUserItem = item._id === newUserOfferItemId;
              const { finalPrice } = computeOffer(
                item,
                userInfo,
                isNewUserItem,
              );

              const displayPrice = Number(item.discountPrice || item.price);
              const hasDiscount = displayPrice < Number(item.price);

              const availableStock = Number(
                item.quantity_in_stock ??
                  item.stock ??
                  item.quantity_available ??
                  Infinity,
              );

              return (
                <div
                  key={item._id}
                  className="bg-white p-4 sm:p-6 rounded-lg border border-gray-100 flex gap-4 sm:gap-6 relative group transition-all hover:shadow-md"
                >
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-[#F9F9F9] rounded-xl overflow-hidden flex items-center justify-center p-3 sm:p-4 flex-shrink-0">
                    <img
                      src={
                        item.image?.startsWith("http")
                          ? item.image
                          : `${BASE_URL}${item.image}`
                      }
                      alt={item.name}
                      className="object-contain h-full w-full"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5 pr-6">
                    <p className="text-[10px] text-[#C28E77] font-bold uppercase tracking-widest truncate">
                      {item.weight || "Standard"}
                    </p>

                    <h3 className="text-sm sm:text-base font-semibold text-black leading-tight truncate">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base sm:text-lg font-bold text-black">
                        ₹{displayPrice.toLocaleString("en-IN")}
                      </p>
                      {hasDiscount && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-2 sm:mt-3">
                      <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 sm:p-2 hover:text-[#C28E77] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 sm:px-4 text-sm font-bold min-w-[36px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          disabled={item.quantity >= availableStock}
                          className="p-1.5 sm:p-2 hover:text-[#C28E77] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      {item.quantity >= availableStock &&
                        availableStock !== Infinity && (
                          <span className="text-[9px] font-bold text-orange-500 uppercase tracking-wider">
                            Max stock
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 space-y-6 shadow-sm lg:sticky lg:top-32">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-black border-b border-gray-50 pb-4">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-black font-semibold">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {totalSaved > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Offer Savings</span>
                    <span className="text-emerald-600 font-bold text-[12px]">
                      − ₹{totalSaved.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-[10px] tracking-wider">
                    Free Delivery
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-black font-semibold">
                    Calculated at next step
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
                <span className="text-base font-bold text-black uppercase tracking-tighter">
                  Grand Total
                </span>
                <span className="text-2xl font-bold text-black">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout/address")}
                className="w-full bg-[#1A302B] text-white py-4 sm:py-5 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#1a302b1c]"
              >
                Proceed to Checkout
                <ChevronRight size={16} />
              </button>

              <div className="pt-4 flex flex-col items-center gap-3 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                  <ShieldCheck size={16} className="text-green-600" />
                  Secure Checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
