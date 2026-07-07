import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import { jsPDF } from "jspdf";
import {
  TrendingUp,
  RotateCcw,
  ShoppingBag,
  Users,
  XCircle,
  RefreshCw,
  FileText,
  Loader2,
  ChevronRight,
  BarChart2,
  PackageX,
  ClipboardList,
  Truck,
  Package,
  AlertTriangle,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StatCard = ({ title, value, icon: Icon, accent, gradient }) => (
  <div className="bg-white rounded-3xl shadow-md p-5 sm:p-6 relative overflow-hidden group hover:shadow-xl transition-all">
    <div
      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition"
      style={{ background: `linear-gradient(135deg, ${gradient})` }}
    />
    <div className="flex justify-between items-center mb-3 sm:mb-4 relative z-10">
      <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </span>

      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        <Icon size={17} />
      </div>
    </div>

    <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 relative z-10 break-all">
      {value}
    </div>
  </div>
);

const MiniCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 text-center hover:shadow-md transition">
    <div className="flex justify-center mb-2 text-[#C28E77]">
      <Icon size={17} />
    </div>

    <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {title}
    </p>

    <p className="text-lg sm:text-xl font-bold text-gray-700">{value}</p>
  </div>
);


const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const getUserInfo = () => {
    try {
      const stored = localStorage.getItem("userInfo");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  };

  const getDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const userInfo = getUserInfo();

    
      if (!userInfo?.token) {
        setError("Please login as admin");
        setLoading(false);
        return;
      }

 
      if (!userInfo?.isAdmin) {
        setError("Admin access denied");
        setLoading(false);
        return;
      }

 
      const { data } = await axios.get(
        `${BASE_URL}/api/orders/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      setData(data);
    } catch (err) {
      console.log("Dashboard Error:", err.response?.data || err.message);

      if (err.response?.status === 401) {
        setError("Unauthorized. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Admin access denied.");
      } else {
        setError("Failed to fetch dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    getDashboardData();
  }, []);

  const nd = {
    totalRevenue: data?.totalRevenue ?? 0,
    totalRefunded: data?.totalRefunded ?? 0,
    paidOrders: data?.paidOrders ?? 0,
    usersCount: data?.usersCount ?? 0,
    cancelledOrders: data?.cancelledOrders ?? 0,
    refundedOrders: data?.refundedOrders ?? 0,
    totalOrders: data?.totalOrders ?? 0,
    codOrders: data?.codOrders ?? 0,
    productsCount: data?.productsCount ?? 0,
    lowStockProducts: data?.lowStockProducts || [],
  };

  
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 40;
    const brand = "#1A302B";
    const copper = "#C28E77";

    doc.setFillColor(brand);
    doc.rect(0, 0, pageWidth, 100, "F");

    doc.setFillColor(copper);
    doc.rect(0, 100, pageWidth, 4, "F");

    doc.setTextColor("#FFFFFF");
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ECOCART", margin, 52);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("ADMINISTRATION DASHBOARD REPORT", margin, 75);

    doc.text(
      `GENERATED: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 130,
      75,
    );

    let yPos = 140;

    const cardW = (pageWidth - margin * 2 - 20) / 2;
    const cardH = 65;

    const stats = [
      { label: "Net Revenue", value: `₹${nd.totalRevenue}` },
      { label: "Refunded Orders", value: nd.refundedOrders },
      { label: "Paid Orders", value: nd.paidOrders },
      { label: "Total Users", value: nd.usersCount },
      { label: "Cancelled Orders", value: nd.cancelledOrders },
      { label: "Total Orders", value: nd.totalOrders },
      { label: "COD Orders", value: nd.codOrders },
      { label: "Total Products", value: nd.productsCount },
    ];

    stats.forEach((stat, i) => {
      const x = margin + (i % 2) * (cardW + 20);

      const y = yPos + Math.floor(i / 2) * (cardH + 15);

      doc.setFillColor("#F8FAFC");
      doc.roundedRect(x, y, cardW, cardH, 6, 6, "F");

      doc.setFillColor(copper);
      doc.rect(x, y + 15, 3, 35, "F");

      doc.setFontSize(9);
      doc.setTextColor("#64748B");
      doc.setFont("helvetica", "bold");

      doc.text(stat.label.toUpperCase(), x + 15, y + 22);

      doc.setFontSize(16);
      doc.setTextColor("#1E293B");

      doc.text(`${stat.value}`, x + 15, y + 48);
    });

    yPos += Math.ceil(stats.length / 2) * (cardH + 15) + 40;

    doc.setFontSize(16);
    doc.setTextColor(brand);
    doc.setFont("helvetica", "bold");

    doc.text("Inventory Alerts", margin, yPos);

    doc.setDrawColor(copper);
    doc.setLineWidth(1.5);

    doc.line(margin, yPos + 5, margin + 110, yPos + 5);

    yPos += 35;

    if (nd.lowStockProducts.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor("#64748B");
      doc.setFont("helvetica", "normal");

      doc.text("All inventory levels are currently healthy.", margin, yPos);
    } else {
      doc.setFontSize(10);
      doc.setTextColor("#94A3B8");

      doc.text("PRODUCT NAME", margin, yPos);

      doc.text("REMAINING STOCK", pageWidth - margin - 100, yPos);

      yPos += 10;

      doc.setDrawColor("#E2E8F0");
      doc.setLineWidth(0.5);

      doc.line(margin, yPos, pageWidth - margin, yPos);

      yPos += 20;

      nd.lowStockProducts.forEach((p) => {
        if (yPos > 780) {
          doc.addPage();
          yPos = 50;
        }

        doc.setTextColor("#334155");
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        doc.text(p.name, margin, yPos);

        doc.setTextColor("#EF4444");
        doc.setFont("helvetica", "bold");

       
        doc.text(
          `${p.quantity || p.stock || 0} Units`,
          pageWidth - margin - 100,
          yPos,
        );

        yPos += 20;

        doc.setDrawColor("#F1F5F9");
        doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
      });
    }

    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setFontSize(9);
      doc.setTextColor("#94A3B8");

      doc.text(
        `Ecocart Business Report - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        820,
        { align: "center" },
      );
    }

    doc.save(`Ecocart_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };


  const handleResetMonthly = async () => {
    if (!window.confirm("Reset all monthly stats?")) return;

    try {
      const userInfo = getUserInfo();

      await axios.put(
        `${BASE_URL}/api/orders/reset-monthly-data`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );

      alert("Monthly stats reset successfully ✅");

      getDashboardData();
    } catch (err) {
      console.log(err);

      alert("Reset failed ❌");
    }
  };

  
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#C28E77]" size={40} />

          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Crunching Stats...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle size={48} className="text-red-300 mx-auto" />

          <p className="text-red-500 font-semibold">{error}</p>

          <button
            onClick={getDashboardData}
            className="bg-[#1A302B] text-white px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

 
  return (
    <div className="mt-10">
      
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 sm:mb-8">
        <BarChart2 size={13} />

        <span>Admin</span>

        <ChevronRight size={12} />

        <span className="text-[#C28E77]">Dashboard</span>
      </div>

   
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
            Overview
          </h2>

          <p className="text-gray-500 mt-1 text-sm">
            Monitor revenue, orders and inventory in real-time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={getDashboardData}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-md hover:shadow-xl transition-all text-xs sm:text-sm font-semibold"
          >
            <RefreshCw size={13} /> Refresh
          </button>

          <button
            onClick={handleResetMonthly}
            className="flex items-center justify-center gap-2 bg-white text-red-500 border border-red-200 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-md hover:bg-red-600 hover:text-white hover:shadow-xl transition-all text-xs sm:text-sm font-semibold"
          >
            <RotateCcw size={13} /> Reset Monthly
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 bg-[#1A302B] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow-md hover:bg-black hover:shadow-xl transition-all text-xs sm:text-sm font-semibold"
          >
            <FileText size={13} /> Export PDF
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Net Revenue"
          value={`₹${nd.totalRevenue.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          accent="#1A302B"
          gradient="#1A302B, #2d5a4e"
        />

        <StatCard
          title="Refunded"
          value={`₹${nd.totalRefunded.toLocaleString("en-IN")}`}
          icon={RotateCcw}
          accent="#EF4444"
          gradient="#EF4444, #f87171"
        />

        <StatCard
          title="Paid Orders"
          value={nd.paidOrders}
          icon={ShoppingBag}
          accent="#C28E77"
          gradient="#C28E77, #d4a896"
        />

        <StatCard
          title="Total Users"
          value={nd.usersCount}
          icon={Users}
          accent="#6366F1"
          gradient="#6366F1, #818cf8"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10 border-b-2 border-gray-200 pb-8 sm:pb-10">
        <MiniCard
          title="Cancelled"
          value={nd.cancelledOrders}
          icon={PackageX}
        />

        <MiniCard title="Refunded" value={nd.refundedOrders} icon={RotateCcw} />

        <MiniCard
          title="Total Orders"
          value={nd.totalOrders}
          icon={ClipboardList}
        />

        <MiniCard title="COD Orders" value={nd.codOrders} icon={Truck} />

        <MiniCard title="Products" value={nd.productsCount} icon={Package} />
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-[#C28E77]" />

            <h2 className="text-base sm:text-lg font-bold text-gray-700">
              ⚠️ Low Stock Alerts
            </h2>
          </div>

          <span
            className={`text-[10px] font-bold px-3 py-1 rounded-full ${
              nd.lowStockProducts.length === 0
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {nd.lowStockProducts.length === 0
              ? "All Healthy ✅"
              : `${nd.lowStockProducts.length} Items`}
          </span>
        </div>

        {nd.lowStockProducts.length === 0 ? (
          <div className="p-10 sm:p-12 text-center text-gray-400 text-sm">
            Inventory levels are healthy. ✅
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left">Product</th>

                  <th className="px-4 sm:px-6 py-4 text-right">Stock</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {nd.lowStockProducts.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 sm:px-6 py-4 font-medium text-gray-700">
                      {item.name}
                    </td>

                    <td className="px-4 sm:px-6 py-4 text-right">
                      <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
                        {item.quantity || item.stock || 0} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
