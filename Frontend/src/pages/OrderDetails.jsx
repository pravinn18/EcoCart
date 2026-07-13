import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../config/axios";
import {
  ChevronLeft,
  Package,
  CreditCard,
  MapPin,
  Loader2,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  ShoppingCart,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { BASE_URL } from "../config/api";


const CancelCountdown = ({ createdAt }) => {
  const [remaining, setRemaining] = useState(() => {
    const diff = 5 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
    return diff > 0 ? diff : 0;
  });

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      const diff = 5 * 60 * 1000 - (Date.now() - new Date(createdAt).getTime());
      setRemaining(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (remaining <= 0) return null;

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="font-mono text-amber-600 font-bold">
      {mins}:{secs.toString().padStart(2, "0")} remaining
    </span>
  );
};

const DeliveryTracker = ({ order }) => {
  if (order.isCancelled) return null;

  const currentStep = order.isDelivered
    ? 3
    : order.orderStatus === "Out for Delivery"
      ? 2
      : order.orderStatus === "In Transit"
        ? 1
        : 0;

  const steps = [
    {
      label: "Order Placed",
      icon: <ShoppingCart size={12} />,
      time: order.createdAt,
    },
    {
      label: "In Transit",
      icon: <Package size={12} />,
      time: order.inTransitAt || null,
    },
    {
      label: "Out for Delivery",
      icon: <Truck size={12} />,
      time: order.assignedAt || null,
    },
    {
      label: "Delivered",
      icon: <CheckCircle2 size={12} />,
      time: order.deliveredAt || null,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex items-center gap-2">
        <Truck size={14} className="text-[#C28E77]" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Delivery Status
        </h3>
      </div>
      <div className="px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex items-start justify-between relative">
        
          <div className="absolute top-[13px] left-[13px] right-[13px] h-[2px] bg-gray-100 z-0" />
         
          <div
            className="absolute top-[13px] left-[13px] h-[2px] bg-[#1A302B] z-0 transition-all duration-500"
            style={{
              width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${
                currentStep === steps.length - 1 ? "26px" : "0px"
              })`,
            }}
          />
          {steps.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div
                key={step.label}
                className="flex flex-col items-center gap-1.5 sm:gap-2 z-10 flex-1"
              >
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    done
                      ? "bg-[#1A302B] border-[#1A302B] text-white"
                      : "bg-white border-gray-200 text-gray-300"
                  }`}
                >
                  {step.icon}
                </div>
                <p
                  className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-tight text-center leading-tight ${
                    active
                      ? "text-[#C28E77]"
                      : done
                        ? "text-gray-600"
                        : "text-gray-300"
                  }`}
                >
                  {step.label}
                </p>
                {done && step.time && (
                  <p className="text-[7px] sm:text-[8px] text-gray-400 font-semibold text-center">
                    {new Date(step.time).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
     const { data } = await axios.get(`/api/orders/${id}`);
      setOrder(data);
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Order not found.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const canCancel = (order) => {
    if (!order || order.isCancelled || order.isDelivered) return false;
    const diff = Date.now() - new Date(order.createdAt).getTime();
    return diff <= 5 * 60 * 1000;
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(true);
    try {
      await axios.put(`/api/orders/${id}/cancel`, {});
      await fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#C28E77]" size={40} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Loading order...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="bg-red-50 p-8 rounded-full">
          <XCircle size={40} className="text-red-300" />
        </div>
        <p className="text-red-500 font-semibold">
          {error || "Order not found."}
        </p>
        <Link
          to="/orders"
          className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const itemsPriceSum = order.orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0,
  );

  const status = order.isCancelled
    ? "cancelled"
    : order.isDelivered
      ? "delivered"
      : order.isPaid
        ? "paid"
        : "pending";

  const statusConfig = {
    pending: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Pending" },
    paid: { bg: "bg-green-50", text: "text-green-600", label: "Paid" },
    delivered: { bg: "bg-blue-50", text: "text-blue-600", label: "Delivered" },
    cancelled: { bg: "bg-red-50", text: "text-red-500", label: "Cancelled" },
  };
  const sc = statusConfig[status];
  const eligible = canCancel(order);

  return (
    <div className="bg-[#F9F9F9] min-h-screen pb-16 pt-24 sm:pt-28">
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm z-30 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl text-[#1A302B] transition shrink-0"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#1A302B]">
                Order Details
              </h1>
              <p className="text-[9px] sm:text-[10px] font-mono text-gray-400 truncate">
                #{order._id}
              </p>
            </div>
          </div>
          <span
            className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shrink-0 ${sc.bg} ${sc.text}`}
          >
            {sc.label}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 flex flex-col lg:flex-row gap-5 sm:gap-6">
        <div className="flex-1 space-y-4 sm:space-y-5">
          {order.isCancelled && order.isPaid && !order.isRefunded && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
              <Clock size={15} className="text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wide">
                Order cancelled — refund will be processed within 7 business
                days.
              </p>
            </div>
          )}

          {eligible && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-semibold">
                  Cancel window: <CancelCountdown createdAt={order.createdAt} />
                </p>
              </div>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1.5 self-start sm:self-auto bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-60 shrink-0"
              >
                {cancelling ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <XCircle size={11} />
                )}
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <CreditCard size={15} className="text-blue-500" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Payment
              </p>
              <p className="text-sm font-bold text-[#1A302B]">
                {order.isRefunded
                  ? "Refunded"
                  : order.isPaid
                    ? "Paid"
                    : "Unpaid"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {order.paymentMethod || "COD"}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 sm:col-span-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                <MapPin size={15} className="text-orange-500" />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Shipping Address
              </p>
              <p className="text-sm font-bold text-[#1A302B]">
                {order.shippingAddress?.fullName || "—"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2
                  ? `, ${order.shippingAddress.addressLine2}`
                  : ""}
                {`, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}`}
              </p>
              {order.shippingAddress?.phone && (
                <div className="flex items-center gap-1.5 mt-2 text-[#C28E77]">
                  <Phone size={11} />
                  <p className="text-[11px] font-bold">
                    {order.shippingAddress.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DeliveryTracker order={order} />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-[#C28E77]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Order Items
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-gray-500">
                {order.orderItems.length} Items
              </span>
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              {order.orderItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 sm:gap-4 p-3 bg-[#F9F9F9] rounded-xl hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-1.5 shrink-0">
                      <img
                        src={
                          item.image
                            ? item.image.startsWith("http")
                              ? item.image
                              : `${BASE_URL}${item.image}`
                            : "/placeholder.png"
                        }
                        alt={item.name}
                        className="object-contain h-full w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#1A302B] truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">
                        Qty {item.qty} × ₹{item.price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#1A302B] shrink-0">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-60 xl:w-72 shrink-0">
          <div className="lg:sticky lg:top-24">
            <div className="bg-[#1A302B] text-white rounded-2xl shadow-xl p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C28E77] mb-1">
                Order Total
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-5 sm:mb-6">
                ₹{order.totalPrice?.toLocaleString("en-IN")}
              </h2>

              <div className="space-y-3 border-t border-white/10 pt-4 sm:pt-5 text-xs font-semibold uppercase tracking-wider">
                <div className="flex justify-between text-white/50">
                  <span>Items Subtotal</span>
                  <span className="text-white">
                    ₹{itemsPriceSum.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span className="flex items-center gap-1">
                    <Truck size={11} /> Delivery
                  </span>
                  <span className="text-[#C28E77]">Free</span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-[10px]">
                      Grand Total
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#C28E77]">
                      ₹{order.totalPrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/40">
                  <Clock size={11} className="text-[#C28E77]" />
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {" · "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <Link
                to="/orders"
                className="mt-5 sm:mt-6 w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition text-white text-[11px] font-bold uppercase tracking-widest py-3 rounded-full"
              >
                <ChevronLeft size={14} /> Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
