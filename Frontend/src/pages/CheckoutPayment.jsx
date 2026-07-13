import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "../config/axios";
import loadRazorpay from "../utils/loadRazorpay";
import {
  ChevronRight,
  Truck,
  CreditCard,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";


const CheckoutPayment = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  const address = JSON.parse(sessionStorage.getItem("checkoutAddress") || "{}");
useEffect(() => {
  if (success) return;

  if (
    !address.fullName ||
    !address.phone ||
    !address.addressLine1 ||
    !address.city ||
    !address.state ||
    !address.pincode
  ) {
    alert("Please select a delivery address.");
    navigate("/checkout/address", { replace: true });
  }
}, [address, navigate, success]);

  const buildOrderItems = () =>
    cartItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
      image: item.image,
      price: item.discountPrice || item.price,
      product: item._id,
      offerBreakdown: item.offerBreakdown || null,
    }));

  const handlePlaceOrder = async () => {
    if (placing) return;

    try {
      setPlacing(true);

      if (cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }

      for (const item of cartItems) {
        const { data: latestProduct } = await axios.get(
          `/api/products/${item._id}`,
        );
        const availableStock = Number(
          latestProduct.quantity || latestProduct.stock || 0,
        );
        if (availableStock === 0) {
          alert(`${item.name} is out of stock`);
          return;
        }
        if (item.quantity > availableStock) {
          alert(`Only ${availableStock} quantity available for ${item.name}`);
          return;
        }
      }

      const config = {
        withCredentials: true,
      };

      const orderItems = buildOrderItems();

      if (paymentMethod === "COD") {
        await axios.post(
          `/api/orders`,
          {
            orderItems,
            shippingAddress: address,
            paymentMethod: "COD",
            totalPrice: totalAmount,
          },
          config,
        );
        await clearCart();
    setSuccess(true);

    setTimeout(() => {
      sessionStorage.removeItem("checkoutAddress");
      navigate("/orders", { replace: true });
    }, 2500);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Failed to load Razorpay");
        return;
      }

      const { data: razorpayOrder } = await axios.post(
        `/api/payment/create-order`,
        { amount: totalAmount },
        config,
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "ECOCART",
        description: "Order Payment",
        prefill: { name: address.fullName || "", contact: address.phone || "" },
        theme: { color: "#1A302B" },
        modal: {
          ondismiss: () => {
            setPlacing(false);
          },
        },
        handler: async function (response) {
          try {
            const { data: verify } = await axios.post(
              `/api/payment/verify-payment`,
              response,
              config,
            );
            if (!verify.success) {
              alert("Payment verification failed");
              return;
            }

            await axios.post(
              `$/api/orders`,
              {
                orderItems,
                shippingAddress: address,
                paymentMethod: "Online",
                totalPrice: totalAmount,
              },
              config,
            );

            await axios.post(
              `/api/users/record-order`,
              {
                totalPrice: Number(totalAmount),
              },
              config,
            );

            try {
              const { data: loyaltyData } = await axios.post(
                `/api/users/record-order`,
                { totalPrice: Number(totalAmount) },
                config,
              );
              const stored = JSON.parse(
                localStorage.getItem("userInfo") || "{}",
              );
              localStorage.setItem(
                "userInfo",
                JSON.stringify({
                  ...stored,
                  isNewUser: loyaltyData?.isNewUser ?? stored.isNewUser,
                  streakCount: loyaltyData?.streakCount ?? stored.streakCount,
                  isPlusMember:
                    loyaltyData?.isPlusMember ?? stored.isPlusMember,
                  loyaltyPoints:
                    loyaltyData?.loyaltyPoints ?? stored.loyaltyPoints,
                  plusExpiryDate:
                    loyaltyData?.plusExpiryDate ?? stored.plusExpiryDate,
                  lastStreakRewardDate:
                    loyaltyData?.lastStreakRewardDate ??
                    stored.lastStreakRewardDate,
                }),
              );
            } catch (loyaltyErr) {
              console.log(
                "Loyalty update skipped:",
                loyaltyErr.response?.data || loyaltyErr.message,
              );
            }

            await clearCart();
            sessionStorage.removeItem("checkoutAddress");
            setSuccess(true);
            setTimeout(() => {
              navigate("/orders", {
                replace: true,
              });
            }, 2500);
          } catch (err) {
            console.error(err);
            alert("Order creation failed");
          }
        },
      };
      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function () {
        setPlacing(false);

        alert("Payment failed.");
      });

      paymentObject.open();
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      alert(
        error.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center space-y-6 pt-20 px-6 text-center">
        <div className="bg-green-50 p-8 rounded-full">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1A302B]">Order Placed!</h2>
          <p className="text-gray-400 text-sm">
            Redirecting you to your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-12 pt-28 sm:pt-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-10 sm:mb-12 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
          <span className="text-gray-400">01 Cart</span>
          <div className="h-[1px] w-8 sm:w-12 bg-gray-200" />
          <span className="text-gray-400">02 Delivery</span>
          <div className="h-[1px] w-8 sm:w-12 bg-gray-200" />
          <span className="text-[#C28E77]">03 Payment</span>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Delivering To
            </p>
            <p className="font-semibold text-[#1A302B] text-sm">
              {address.fullName}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ""},{" "}
              {address.city}, {address.state} — {address.pincode}
            </p>
            <p className="text-gray-500 text-sm">{address.phone}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">
              Payment Method
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod("COD")}
                className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "COD"
                    ? "border-[#1A302B] bg-[#1A302B08]"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === "COD" ? "bg-[#1A302B]" : "bg-gray-50"}`}
                >
                  <Truck
                    size={15}
                    className={
                      paymentMethod === "COD" ? "text-white" : "text-gray-400"
                    }
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-[#1A302B]">
                    Cash on Delivery
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Pay when your order arrives
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "COD" ? "border-[#1A302B] bg-[#1A302B]" : "border-gray-300"}`}
                >
                  {paymentMethod === "COD" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod("Online")}
                className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === "Online"
                    ? "border-[#C28E77] bg-[#C28E7708]"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === "Online" ? "bg-[#C28E77]" : "bg-gray-50"}`}
                >
                  <CreditCard
                    size={15}
                    className={
                      paymentMethod === "Online"
                        ? "text-white"
                        : "text-gray-400"
                    }
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-bold text-[#1A302B]">Pay Online</p>
                  <p className="text-[11px] text-gray-400">
                    UPI, Cards, Net Banking
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "Online" ? "border-[#C28E77] bg-[#C28E77]" : "border-gray-300"}`}
                >
                  {paymentMethod === "Online" && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Order Summary
            </p>
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center text-sm gap-2"
              >
                <span className="text-gray-600 min-w-0 truncate">
                  {item.name}{" "}
                  <span className="text-gray-400">× {item.quantity}</span>
                </span>
                <span className="font-semibold text-[#1A302B] flex-shrink-0">
                  ₹
                  {(
                    (item.discountPrice || item.price) * item.quantity
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-50 pt-4 flex justify-between items-center">
              <span className="text-sm sm:text-base font-bold text-black uppercase tracking-tighter">
                Grand Total
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#1A302B]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing || cartItems.length === 0}
            className="w-full bg-[#1A302B] text-white py-4 sm:py-5 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#1a302b1c] disabled:opacity-60"
          >
            {placing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                Place Order
                <ChevronRight size={16} />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            <ShieldCheck size={14} className="text-green-600" />
            Secure Checkout
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
