import React, { useEffect, useState, useCallback } from "react";
import axios from "../config/axios";
import { Link } from "react-router-dom";
import {
  PackageOpen,
  Loader2,
  ChevronRight,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  RotateCcw,
} from "lucide-react";



const statusStyle = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-600" },
  paid: { bg: "bg-green-50", text: "text-green-600" },
  delivered: { bg: "bg-blue-50", text: "text-blue-600" },
  cancelled: { bg: "bg-red-50", text: "text-red-500" },
  refunded: { bg: "bg-purple-50", text: "text-purple-600" },
  outofstock: { bg: "bg-red-50", text: "text-red-600" },
};

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
  }, [createdAt, remaining]);

  if (remaining <= 0) return null;

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  return (
    <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
      <Clock size={9} />
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
};

const generateInvoice = async (order) => {
  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  })();

  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = 210;
  const margin = 18;
  let y = 0;

  const line = (x1, y1, x2, y2, color = [220, 220, 220]) => {
    doc.setDrawColor(...color);
    doc.line(x1, y1, x2, y2);
  };
  const text = (str, x, yy, opts = {}) => {
    doc.setFontSize(opts.size || 10);
    doc.setFont("helvetica", opts.style || "normal");
    doc.setTextColor(...(opts.color || [50, 50, 50]));
    doc.text(String(str), x, yy, { align: opts.align || "left" });
  };
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const formatINR = (n) =>
    "Rs. " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

  doc.setFillColor(26, 48, 43); // #1A302B
  doc.rect(0, 0, pw, 38, "F");

  text("INVOICE", margin, 16, {
    size: 22,
    style: "bold",
    color: [255, 255, 255],
  });
  text("Thank you for your order!", margin, 24, {
    size: 9,
    color: [180, 210, 200],
  });

  doc.setFillColor(194, 142, 119); // #C28E77
  doc.circle(pw - margin - 4, 19, 8, "F");
  text("✓", pw - margin - 4, 22, {
    size: 10,
    style: "bold",
    color: [255, 255, 255],
    align: "center",
  });

  y = 48;

  doc.setFillColor(249, 249, 249);
  doc.roundedRect(margin, y, pw - margin * 2, 22, 3, 3, "F");

  text("ORDER ID", margin + 5, y + 7, {
    size: 7,
    style: "bold",
    color: [150, 150, 150],
  });
  text(`#${order._id}`, margin + 5, y + 14, {
    size: 8,
    style: "bold",
    color: [26, 48, 43],
  });

  text("DATE", pw / 2 - 10, y + 7, {
    size: 7,
    style: "bold",
    color: [150, 150, 150],
  });
  text(formatDate(order.createdAt), pw / 2 - 10, y + 14, {
    size: 8,
    color: [60, 60, 60],
  });

  text("PAYMENT", pw - margin - 5, y + 7, {
    size: 7,
    style: "bold",
    color: [150, 150, 150],
    align: "right",
  });
  text(order.paymentMethod || "COD", pw - margin - 5, y + 14, {
    size: 8,
    color: [60, 60, 60],
    align: "right",
  });

  y += 30;

  const colW = (pw - margin * 2 - 6) / 2;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, colW, 38, 3, 3, "FD");
  text("BILL TO", margin + 5, y + 8, {
    size: 7,
    style: "bold",
    color: [194, 142, 119],
  });
  const billName = userInfo?.name || "Customer";
  const billEmail = userInfo?.email || "";
  text(billName, margin + 5, y + 16, {
    size: 9,
    style: "bold",
    color: [26, 48, 43],
  });
  if (billEmail)
    text(billEmail, margin + 5, y + 23, { size: 8, color: [100, 100, 100] });

  const addr = order.shippingAddress;
  const rx = margin + colW + 6;
  doc.roundedRect(rx, y, colW, 38, 3, 3, "FD");
  text("SHIP TO", rx + 5, y + 8, {
    size: 7,
    style: "bold",
    color: [194, 142, 119],
  });
  if (addr) {
    const addrLine1 = addr.address || "";
    const addrLine2 = [addr.city, addr.postalCode].filter(Boolean).join(", ");
    const addrLine3 = addr.country || "";
    text(addrLine1, rx + 5, y + 16, { size: 8, color: [26, 48, 43] });
    if (addrLine2)
      text(addrLine2, rx + 5, y + 23, { size: 8, color: [80, 80, 80] });
    if (addrLine3)
      text(addrLine3, rx + 5, y + 30, { size: 8, color: [80, 80, 80] });
  } else {
    text("No address provided", rx + 5, y + 16, {
      size: 8,
      color: [150, 150, 150],
    });
  }

  y += 46;

  doc.setFillColor(26, 48, 43);
  doc.roundedRect(margin, y, pw - margin * 2, 10, 2, 2, "F");
  text("ITEM", margin + 5, y + 7, {
    size: 8,
    style: "bold",
    color: [255, 255, 255],
  });
  text("QTY", pw - margin - 55, y + 7, {
    size: 8,
    style: "bold",
    color: [255, 255, 255],
    align: "center",
  });
  text("UNIT PRICE", pw - margin - 32, y + 7, {
    size: 8,
    style: "bold",
    color: [255, 255, 255],
    align: "center",
  });
  text("TOTAL", pw - margin - 5, y + 7, {
    size: 8,
    style: "bold",
    color: [255, 255, 255],
    align: "right",
  });

  y += 13;

  order.orderItems.forEach((item, idx) => {
    const rowH = 10;
    if (idx % 2 === 0) {
      doc.setFillColor(249, 249, 249);
      doc.rect(margin, y - 3, pw - margin * 2, rowH, "F");
    }

    const itemTotal = (item.qty || 1) * (item.price || 0);

    const maxNameWidth = 95;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    let itemName = item.name || "Product";
    while (doc.getTextWidth(itemName) > maxNameWidth && itemName.length > 10) {
      itemName = itemName.slice(0, -4) + "...";
    }

    text(itemName, margin + 5, y + 4, { size: 9, color: [40, 40, 40] });
    text(String(item.qty || 1), pw - margin - 55, y + 4, {
      size: 9,
      color: [60, 60, 60],
      align: "center",
    });
    text(formatINR(item.price || 0), pw - margin - 32, y + 4, {
      size: 9,
      color: [60, 60, 60],
      align: "center",
    });
    text(formatINR(itemTotal), pw - margin - 5, y + 4, {
      size: 9,
      style: "bold",
      color: [26, 48, 43],
      align: "right",
    });

    y += rowH;
  });

  y += 4;
  line(margin, y, pw - margin, y, [194, 142, 119]);
  y += 8;

  const totalsX = pw - margin - 75;

  const addTotalRow = (label, value, bold = false, highlight = false) => {
    if (highlight) {
      doc.setFillColor(26, 48, 43);
      doc.roundedRect(totalsX - 5, y - 5, 75 + 5, 10, 2, 2, "F");
    }
    text(label, totalsX, y, {
      size: bold ? 10 : 9,
      style: bold ? "bold" : "normal",
      color: highlight ? [180, 210, 200] : [100, 100, 100],
    });
    text(value, pw - margin - 2, y, {
      size: bold ? 11 : 9,
      style: bold ? "bold" : "normal",
      color: highlight ? [255, 255, 255] : [40, 40, 40],
      align: "right",
    });
    y += bold ? 12 : 9;
  };

  const itemsTotal = order.orderItems.reduce(
    (sum, item) => sum + (item.qty || 1) * (item.price || 0),
    0,
  );
  const shipping = (order.totalPrice || 0) - itemsTotal;

  addTotalRow("Subtotal", formatINR(itemsTotal));
  if (shipping > 0) addTotalRow("Shipping", formatINR(shipping));
  if (shipping === 0) addTotalRow("Shipping", "FREE");
  y += 2;
  addTotalRow("TOTAL", formatINR(order.totalPrice || 0), true, true);

  y += 12;

  const statusLabel = order.isCancelled
    ? "CANCELLED"
    : order.isDelivered
      ? "DELIVERED"
      : order.isPaid
        ? "PAID"
        : "PENDING";

  const statusColors = {
    CANCELLED: [220, 60, 60],
    DELIVERED: [37, 99, 235],
    PAID: [22, 163, 74],
    PENDING: [217, 119, 6],
  };
  const sc = statusColors[statusLabel] || [100, 100, 100];

  doc.setFillColor(...sc);
  doc.roundedRect(margin, y, 40, 9, 2, 2, "F");
  text(`Status: ${statusLabel}`, margin + 4, y + 6, {
    size: 7,
    style: "bold",
    color: [255, 255, 255],
  });

  const footerY = 282;
  line(margin, footerY, pw - margin, footerY, [220, 220, 220]);
  text(
    "This is a computer-generated invoice and does not require a signature.",
    pw / 2,
    footerY + 6,
    {
      size: 7,
      color: [160, 160, 160],
      align: "center",
    },
  );

  doc.setFillColor(194, 142, 119);
  doc.rect(0, 295, pw, 2, "F");

  // ── Save ──
  doc.save(`Invoice_${order._id.slice(-8)}.pdf`);
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(null);

  

 const fetchOrders = useCallback(async () => {
   try {
     const { data } = await axios.get(
       `/api/orders/myorders`,
     );

     setOrders(data);
   } catch (err) {
     console.error(err);
   } finally {
     setLoading(false);
   }
 }, []);
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const canCancel = (order) => {
    if (order.isCancelled || order.isDelivered) return false;
    const diff = Date.now() - new Date(order.createdAt).getTime();
    return diff <= 5 * 60 * 1000;
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setCancelling(orderId);
    try {
     await axios.put(`/api/orders/${orderId}/cancel`);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, isCancelled: true, orderStatus: "Cancelled" }
            : o,
        ),
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Cancellation failed. Please try again.",
      );
    } finally {
      setCancelling(null);
    }
  };


  const handleInvoice = async (order) => {
    setGeneratingInvoice(order._id);
    try {
   await generateInvoice(order);
    } catch (err) {
      console.error("Invoice error:", err);
      alert("Could not generate invoice. Please try again.");
    } finally {
      setGeneratingInvoice(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 pt-28">
        <Loader2 className="animate-spin text-[#C28E77]" size={40} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Loading your orders...
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 pt-28 px-6 text-center">
        <div className="bg-gray-50 p-8 rounded-full">
          <PackageOpen size={40} className="text-gray-200" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-black">No orders yet</h2>
          <p className="text-gray-500">Your order history will appear here.</p>
        </div>
        <Link
          to="/"
          className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-10 sm:py-12 pt-28 sm:pt-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
      
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A302B] tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {orders.length} order{orders.length !== 1 ? "s" : ""} placed
          </p>
        </div>

       
        {orders.some(canCancel) && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-5 text-xs font-semibold text-amber-700">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              You can cancel recent orders within <strong>5 minutes</strong> of
              placing them.
            </span>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
             const status = order.isRefunded
               ? "refunded"
               : order.isCancelled
                 ? "cancelled"
                 : order.isDelivered
                   ? "delivered"
                   : order.isPaid
                     ? "paid"
                     : "pending";

            const style = statusStyle[status] || statusStyle.pending;
            const eligible = canCancel(order);
            const isCancelling = cancelling === order._id;
            const isGenerating = generatingInvoice === order._id;

            return (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-md transition-all"
              >
            
                <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-gray-50 gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Order ID
                    </p>
                    <p className="text-xs font-mono text-gray-600 truncate">
                      {order._id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {eligible && (
                      <CancelCountdown createdAt={order.createdAt} />
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${style.bg} ${style.text}`}
                    >
                      {order.isRefunded
                        ? "Refunded"
                        : order.orderStatus || status}
                    </span>
                  </div>
                </div>

                {order.isRefunded && (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2 mb-4 text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                    <RotateCcw size={12} />
                    Refund Processed
                    {order.refundedAt && (
                      <span className="ml-auto font-normal tracking-normal text-purple-400 normal-case">
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
                )}

            
                <div className="space-y-3 mb-4 sm:mb-5">
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Link
                        to={`/orders/${order._id}`}
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F9F9F9] rounded-xl overflow-hidden flex items-center justify-center p-1.5 sm:p-2 flex-shrink-0 border border-gray-100 hover:border-[#C28E77] hover:shadow-md transition-all group"
                      >
                        <img
                          src={
                            item.image
                          }
                          alt={item.name}
                          className="object-contain h-full w-full group-hover:scale-110 transition-transform duration-200"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-[#1A302B] truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400">
                          Qty: {item.qty} · ₹
                          {item.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 sm:pt-4 border-t border-gray-50">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                   
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                        Total
                      </p>
                      <p className="text-base sm:text-lg font-bold text-[#1A302B]">
                        ₹{order.totalPrice?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                        Payment
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-600">
                        {order.paymentMethod || "COD"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                        Placed On
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                   
                    {eligible && !order.isCancelled && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        disabled={isCancelling}
                        className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isCancelling ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <XCircle size={11} />
                        )}
                        {isCancelling ? "Cancelling…" : "Cancel Order"}
                      </button>
                    )}

                    {!eligible && <div />}

                    <div className="flex items-center gap-3 ml-auto">
                 
                      <button
                        onClick={() => handleInvoice(order)}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 bg-[#1A302B]/5 text-[#1A302B] hover:bg-[#1A302B]/10 border border-[#1A302B]/10 px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <FileText size={11} />
                        )}
                        {isGenerating ? "Generating…" : "Invoice"}
                      </button>

                      <Link
                        to={`/orders/${order._id}`}
                        className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#C28E77] hover:text-[#1A302B] transition-colors"
                      >
                        Details <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
