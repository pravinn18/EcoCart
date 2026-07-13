import React, { useEffect, useState, useCallback } from "react";
import axios from "../config/axios";
import jsPDF from "jspdf";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  MapPin,
  Loader2,
  Filter,
  Clock,
  AlertTriangle,
  RotateCcw,
  FileText,
  X,
  Tag,
  TrendingDown,
  Layers,
  BadgePercent,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-600", label: "Pending" },
  paid: { bg: "bg-green-50", text: "text-green-700", label: "Paid" },
  "in transit": {
    bg: "bg-blue-50",
    text: "text-blue-600",
    label: "In Transit",
  },
  "out for delivery": {
    bg: "bg-orange-50",
    text: "text-orange-600",
    label: "Out for Delivery",
  },
  delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    label: "Delivered",
  },
  cancelled: {
    bg: "bg-red-50",
    text: "text-red-500",
    label: "Cancelled",
  },
  refunded: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    label: "Refunded",
  },
};

const getOrderStatus = (order) => {
  if (order.isRefunded) return "refunded";
  if (order.isCancelled) return "cancelled";
  if (order.isDelivered) return "delivered";
  if (order.orderStatus === "Out for Delivery") return "out for delivery";
  if (order.orderStatus === "In Transit") return "in transit";
  if (order.isPaid) return "paid";
  return "pending";
};


const ActionBtn = ({
  onClick,
  disabled,
  loading,
  icon: Icon,
  label,
  colorClass,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed border ${colorClass}`}
  >
    {loading ? (
      <Loader2 size={11} className="animate-spin" />
    ) : (
      <Icon size={11} />
    )}
    <span className="hidden xs:inline sm:inline">{label}</span>
  </button>
);


const OfferAnalysisPanel = ({ orderItems }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  const itemsWithOffers =
    orderItems?.filter((item) => item.offerBreakdown) || [];
  const totalSaved = itemsWithOffers.reduce((acc, item) => {
    return acc + Number(item.offerBreakdown?.saved || 0) * item.qty;
  }, 0);

  const allOfferTypes = [
    ...new Set(
      itemsWithOffers
        .map((item) => item.offerBreakdown?.offerType)
        .filter(Boolean),
    ),
  ];

  if (itemsWithOffers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 px-4 py-3 flex items-center gap-2">
        <BadgePercent size={13} className="text-gray-300 shrink-0" />
        <p className="text-[10px] text-gray-400 font-medium">
          No offers were applied on this order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
    
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#FBF3EF] border border-[#F0E0D8] rounded-xl p-2.5 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-[#C28E77] mb-1">
            Total Saved
          </p>
          <p className="text-sm font-extrabold text-[#C28E77]">
            ₹{totalSaved.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-blue-400 mb-1">
            Items w/ Offers
          </p>
          <p className="text-sm font-extrabold text-blue-600">
            {itemsWithOffers.length}/{orderItems?.length || 0}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-2.5 text-center">
          <p className="text-[8px] font-bold uppercase tracking-widest text-purple-400 mb-1">
            Offer Types
          </p>
          <p className="text-sm font-extrabold text-purple-600">
            {allOfferTypes.length}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {orderItems?.map((item, i) => {
          const offer = item.offerBreakdown;
          const isExpanded = expandedItem === i;

          return (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden"
            >
            
              <button
                onClick={() => setExpandedItem(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50/70 transition text-left"
              >
                <div className="w-7 h-7 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0">
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
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-gray-700 truncate">
                    {item.name}
                  </p>
                  {offer ? (
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-[#C28E77] bg-[#FBF3EF] px-1.5 py-0.5 rounded-full border border-[#F0E0D8]">
                        {offer.offerType || "Offer"}
                      </span>
                      <span className="text-[8px] font-bold text-emerald-600">
                        {offer.totalDiscountPercent}% off
                      </span>
                      <span className="text-[8px] text-gray-400">
                        · saved ₹{Number(offer.saved || 0) * item.qty}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      No offer applied
                    </p>
                  )}
                </div>
                {offer && (
                  <span className="text-gray-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp size={13} />
                    ) : (
                      <ChevronDown size={13} />
                    )}
                  </span>
                )}
              </button>

            
              {offer && isExpanded && (
                <div className="border-t border-gray-50 bg-gray-50/40 px-3 py-3 space-y-3">
                
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                        MRP
                      </p>
                      <p className="text-xs font-bold text-gray-400 line-through">
                        ₹{offer.mrp}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center border border-emerald-100">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">
                        Paid
                      </p>
                      <p className="text-xs font-bold text-emerald-600">
                        ₹{offer.paid}
                      </p>
                    </div>
                    <div className="bg-[#FBF3EF] rounded-lg p-2 text-center border border-[#F0E0D8]">
                      <p className="text-[8px] font-bold uppercase tracking-widest text-[#C28E77] mb-0.5">
                        Per Item
                      </p>
                      <p className="text-xs font-bold text-[#C28E77]">
                        −₹{offer.saved}
                      </p>
                    </div>
                  </div>

               
                  {offer.discountStack?.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Layers size={10} className="text-gray-400" />
                        <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                          Discount Layers Applied
                        </p>
                      </div>
                      <div className="space-y-1">
                        {offer.discountStack.map((d, di) => (
                          <div
                            key={di}
                            className="flex items-center justify-between bg-white rounded-lg px-2.5 py-1.5 border border-gray-100"
                          >
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-gray-700 truncate">
                                {d.label}
                              </p>
                              {d.detail && (
                                <p className="text-[8px] text-gray-400">
                                  {d.detail}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 shrink-0 ml-2 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                              +{d.percent}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

            
                  {offer.totalDiscountPercent != null && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown size={10} className="text-gray-400" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                          Total Discount
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-white bg-[#1A302B] px-2.5 py-1 rounded-full">
                        {offer.totalDiscountPercent}% OFF
                      </span>
                    </div>
                  )}

                  {item.qty > 1 && (
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5">
                      <Tag size={9} className="text-blue-400 shrink-0" />
                      <p className="text-[9px] font-medium text-blue-600">
                        Qty {item.qty} × ₹{offer.saved} saved ={" "}
                        <span className="font-bold">
                          ₹{Number(offer.saved) * item.qty} total saved
                        </span>{" "}
                        on this item
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OrderRow = ({ order, onAction, onInvoice, invoiceLoadingId }) => {
  const [expanded, setExpanded] = useState(false);
  const [acting, setActing] = useState(null);
  
  const [showOfferAnalysis, setShowOfferAnalysis] = useState(true);

  const status = getOrderStatus(order);
  const sc = STATUS_CONFIG[status];

 
  const offerCount =
    order.orderItems?.filter((item) => item.offerBreakdown)?.length || 0;

  const handleAction = async (actionType, payload = {}) => {
    setActing(actionType);
    await onAction(order._id, actionType, payload);
    setActing(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
  
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 cursor-pointer hover:bg-gray-50/70 transition"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#F3F4F6] rounded-xl flex items-center justify-center shrink-0">
            <Package size={15} className="text-[#C28E77]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-mono text-gray-400 truncate">
              #{order._id}
            </p>
            <p className="text-sm font-bold text-[#1A302B] truncate">
              {order.shippingAddress?.fullName || "Unknown Customer"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-sm font-bold text-gray-700">
              ₹{order.totalPrice?.toLocaleString("en-IN")}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full ${sc.bg} ${sc.text}`}
            >
              {sc.label}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvoice(order);
            }}
            disabled={invoiceLoadingId === order._id}
            title="Download Invoice"
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-[#1A302B] hover:border-[#C28E77] bg-white shadow-sm transition disabled:opacity-50"
          >
            {invoiceLoadingId === order._id ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <FileText size={11} />
            )}
            <span className="hidden sm:inline">Invoice</span>
          </button>

          <span className="text-gray-400 shrink-0">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/40">
          <div className="p-4 sm:p-5 space-y-4">
           
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CreditCard size={11} className="text-blue-500" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    Payment
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {order.isRefunded
                    ? "Refunded"
                    : order.isPaid
                      ? "Paid"
                      : "Unpaid"}
                </p>
                <p className="text-xs text-gray-400">
                  {order.paymentMethod || "COD"}
                </p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm sm:col-span-2">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MapPin size={11} className="text-orange-500" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    Shipping
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700">
                  {order.shippingAddress?.fullName}
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {order.shippingAddress?.addressLine1}
                  {order.shippingAddress?.addressLine2
                    ? `, ${order.shippingAddress.addressLine2}`
                    : ""}
                  {`, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} — ${order.shippingAddress?.pincode}`}
                </p>
                {order.shippingAddress?.phone && (
                  <p className="text-xs font-bold text-[#C28E77] mt-1">
                    📞 {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>

          
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 py-2 border-b border-gray-50">
                Items ({order.orderItems?.length})
              </p>
              <div className="divide-y divide-gray-50">
                {order.orderItems?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Qty {item.qty} × ₹{item.price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 shrink-0">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

         
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowOfferAnalysis((p) => !p)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50/70 transition border-b border-gray-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#1A302B] flex items-center justify-center">
                    <BadgePercent size={11} className="text-[#C28E77]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                      Offer Analysis
                    </p>
                   
                    {offerCount > 0 && (
                      <span className="text-[8px] font-bold text-[#C28E77] bg-[#FBF3EF] border border-[#F0E0D8] px-1.5 py-0.5 rounded-full">
                        {offerCount} item{offerCount !== 1 ? "s" : ""} w/ offers
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-gray-400">
                  {showOfferAnalysis ? (
                    <ChevronUp size={13} />
                  ) : (
                    <ChevronDown size={13} />
                  )}
                </span>
              </button>

              {showOfferAnalysis && (
                <div className="p-3">
                  <OfferAnalysisPanel orderItems={order.orderItems} />
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
              <Clock size={11} />
              Placed:{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date(order.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {!order.isCancelled && !order.isDelivered ? (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                {order.orderStatus !== "In Transit" && (
                  <ActionBtn
                    onClick={() =>
                      handleAction("status", { action: "inTransit" })
                    }
                    disabled={!!acting}
                    loading={acting === "status-transit"}
                    icon={Package}
                    label="In Transit"
                    colorClass="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                  />
                )}

                {order.orderStatus !== "Out for Delivery" && (
                  <ActionBtn
                    onClick={() =>
                      handleAction("status", { action: "outForDelivery" })
                    }
                    disabled={!!acting}
                    loading={acting === "status-ofd"}
                    icon={Truck}
                    label="Out for Delivery"
                    colorClass="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-100"
                  />
                )}

                <ActionBtn
                  onClick={() => handleAction("deliver")}
                  disabled={!!acting}
                  loading={acting === "deliver"}
                  icon={CheckCircle2}
                  label="Mark Delivered"
                  colorClass="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"
                />

                <ActionBtn
                  onClick={() => {
                    if (
                      window.confirm(
                        "Cancel this order? This cannot be undone.",
                      )
                    ) {
                      handleAction("cancel");
                    }
                  }}
                  disabled={!!acting}
                  loading={acting === "cancel"}
                  icon={XCircle}
                  label="Cancel Order"
                  colorClass="bg-red-50 text-red-500 hover:bg-red-100 border-red-100"
                />
              </div>
            ) : order.isCancelled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-50 text-red-500 border border-red-100">
                  <XCircle size={13} />
                  Order Cancelled
                </div>

                {order.isRefunded ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                    <RotateCcw size={13} />
                    Refunded
                    {order.refundedAt && (
                      <span className="ml-1 font-normal tracking-normal text-[10px] text-purple-400">
                        on{" "}
                        {new Date(order.refundedAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    <ActionBtn
                      onClick={() => {
                        if (
                          window.confirm(
                            "Refund this order? The payment will be marked as refunded to the customer.",
                          )
                        ) {
                          handleAction("refund");
                        }
                      }}
                      disabled={!!acting}
                      loading={acting === "refund"}
                      icon={RotateCcw}
                      label="Refund Order"
                      colorClass="bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 size={13} />
                Order Delivered
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminOrderControl = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get(
        `/api/orders/admin/allorders`,
      );
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sorted);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAction = useCallback(
    async (orderId, actionType, payload = {}) => {
      try {
      

        if (actionType === "deliver") {
        await axios.put(
          `/api/orders/${orderId}/deliver`,
          {},
        );
        } else if (actionType === "status") {
         await axios.put(
           `/api/orders/${orderId}/status`,
           payload,
         );
        } else if (actionType === "cancel") {
         await axios.put(
           `/api/orders/${orderId}/cancel`,
           {},
         );
        } else if (actionType === "refund") {
         await axios.put(
           `/api/orders/${orderId}/refund`,
           {},
         ); }

        await fetchOrders();
      } catch (err) {
        alert(
          err.response?.data?.message || "Action failed. Please try again.",
        );
      }
    },
    [fetchOrders],
  );

  const handleInvoice = useCallback(async (order) => {
    setInvoiceLoadingId(order._id);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = 50;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(26, 48, 43);
      doc.text("INVOICE", margin, y);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`Order ID: ${order._id}`, pageWidth - margin, y - 14, {
        align: "right",
      });
      doc.text(
        `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`,
        pageWidth - margin,
        y,
        { align: "right" },
      );

      y += 10;
      doc.setDrawColor(194, 142, 119);
      doc.setLineWidth(1.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 25;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(26, 48, 43);
      doc.text("BILL TO", margin, y);
      y += 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(
        order.shippingAddress?.fullName || "Unknown Customer",
        margin,
        y,
      );
      y += 14;

      const addressLines = doc.splitTextToSize(
        `${order.shippingAddress?.addressLine1 || ""}${
          order.shippingAddress?.addressLine2
            ? `, ${order.shippingAddress.addressLine2}`
            : ""
        }, ${order.shippingAddress?.city || ""}, ${
          order.shippingAddress?.state || ""
        } - ${order.shippingAddress?.pincode || ""}`,
        300,
      );
      doc.text(addressLines, margin, y);
      y += addressLines.length * 14;

      if (order.shippingAddress?.phone) {
        doc.text(`Phone: ${order.shippingAddress.phone}`, margin, y);
        y += 14;
      }

      let yRight =
        y -
        (addressLines.length * 14 + (order.shippingAddress?.phone ? 14 : 0)) -
        14;
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT", pageWidth - margin, yRight, { align: "right" });
      yRight += 16;
      doc.setFont("helvetica", "normal");
      doc.text(
        `Method: ${order.paymentMethod || "COD"}`,
        pageWidth - margin,
        yRight,
        { align: "right" },
      );
      yRight += 14;
      doc.text(
        `Status: ${order.isPaid ? "Paid" : "Unpaid"}`,
        pageWidth - margin,
        yRight,
        { align: "right" },
      );

      y += 20;

      doc.setFillColor(26, 48, 43);
      doc.rect(margin, y, pageWidth - margin * 2, 24, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("ITEM", margin + 8, y + 16);
      doc.text("QTY", pageWidth - margin - 180, y + 16, { align: "right" });
      doc.text("PRICE", pageWidth - margin - 100, y + 16, { align: "right" });
      doc.text("TOTAL", pageWidth - margin - 8, y + 16, { align: "right" });
      y += 24;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      let subtotal = 0;
      let totalSaved = 0;

      order.orderItems?.forEach((item, i) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }

        const rowH = 22;
        if (i % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(margin, y, pageWidth - margin * 2, rowH, "F");
        }

        doc.setTextColor(60, 60, 60);
        const nameLines = doc.splitTextToSize(item.name, 240);
        doc.text(nameLines[0], margin + 8, y + 14);

        doc.text(String(item.qty), pageWidth - margin - 180, y + 14, {
          align: "right",
        });
        doc.text(
          `Rs. ${item.price?.toFixed(2)}`,
          pageWidth - margin - 100,
          y + 14,
          { align: "right" },
        );
        const lineTotal = item.price * item.qty;
        subtotal += lineTotal;

        if (item.offerBreakdown?.saved) {
          totalSaved += Number(item.offerBreakdown.saved) * item.qty;
        }

        doc.text(
          `Rs. ${lineTotal.toFixed(2)}`,
          pageWidth - margin - 8,
          y + 14,
          { align: "right" },
        );

        y += rowH;
      });

      y += 10;
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y, pageWidth - margin, y);
      y += 20;

      const totalsX = pageWidth - margin - 8;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Subtotal", totalsX - 100, y, { align: "right" });
      doc.text(`Rs. ${subtotal.toFixed(2)}`, totalsX, y, { align: "right" });
      y += 18;

      if (order.shippingPrice) {
        doc.text("Shipping", totalsX - 100, y, { align: "right" });
        doc.text(`Rs. ${order.shippingPrice?.toFixed(2)}`, totalsX, y, {
          align: "right",
        });
        y += 18;
      }

      if (order.taxPrice) {
        doc.text("Tax", totalsX - 100, y, { align: "right" });
        doc.text(`Rs. ${order.taxPrice?.toFixed(2)}`, totalsX, y, {
          align: "right",
        });
        y += 18;
      }

      if (totalSaved > 0) {
        doc.setTextColor(194, 142, 119);
        doc.text("Offer Savings", totalsX - 100, y, { align: "right" });
        doc.text(`- Rs. ${totalSaved.toFixed(2)}`, totalsX, y, {
          align: "right",
        });
        y += 18;
      }

      y += 4;
      doc.setDrawColor(26, 48, 43);
      doc.setLineWidth(0.8);
      doc.line(totalsX - 160, y, totalsX, y);
      y += 18;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(26, 48, 43);
      doc.text("Grand Total", totalsX - 100, y, { align: "right" });
      doc.text(`Rs. ${order.totalPrice?.toFixed(2)}`, totalsX, y, {
        align: "right",
      });

      y += 40;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Order Status: ${getOrderStatus(order).toUpperCase()}`,
        margin,
        y,
      );
      y += 14;
      doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, margin, y);

      doc.save(`Invoice_${order._id}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate invoice.");
    } finally {
      setInvoiceLoadingId(null);
    }
  }, []);

  const filtered = orders.filter((o) => {
    const status = getOrderStatus(o);
    const matchesFilter = filter === "all" || status === filter;
    const matchesSearch =
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      (o.shippingAddress?.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = orders.reduce((acc, o) => {
    const s = getOrderStatus(o);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[#C28E77]" size={36} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Loading orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 text-center">
        <div className="bg-red-50 p-6 rounded-full">
          <XCircle size={36} className="text-red-300" />
        </div>
        <p className="text-red-500 font-semibold text-sm">{error}</p>
        <button
          onClick={fetchOrders}
          className="bg-[#1A302B] text-white px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
   
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Order Control</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition text-sm font-semibold"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by order ID or customer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C28E77] focus:border-transparent"
          />
        </div>
        <div className="relative shrink-0">
          <Filter
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C28E77] appearance-none cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All ({orders.length})</option>
            <option value="pending">
              Pending {counts.pending ? `(${counts.pending})` : ""}
            </option>
            <option value="paid">
              Paid {counts.paid ? `(${counts.paid})` : ""}
            </option>
            <option value="in transit">
              In Transit{" "}
              {counts["in transit"] ? `(${counts["in transit"]})` : ""}
            </option>
            <option value="out for delivery">
              Out for Delivery{" "}
              {counts["out for delivery"]
                ? `(${counts["out for delivery"]})`
                : ""}
            </option>
            <option value="delivered">
              Delivered {counts.delivered ? `(${counts.delivered})` : ""}
            </option>
            <option value="cancelled">
              Cancelled {counts.cancelled ? `(${counts.cancelled})` : ""}
            </option>
            <option value="refunded">
              Refunded {counts.refunded ? `(${counts.refunded})` : ""}
            </option>
          </select>
        </div>
      </div>

      {counts.paid > 0 && filter === "all" && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5 text-xs font-bold text-amber-700">
          <AlertTriangle size={13} className="shrink-0" />
          {counts.paid} paid order{counts.paid !== 1 ? "s" : ""} awaiting
          processing
        </div>
      )}

    
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              onAction={handleAction}
              onInvoice={handleInvoice}
              invoiceLoadingId={invoiceLoadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrderControl;
