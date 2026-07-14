import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminOrderControl from "./AdminOrderControl";
import {
  LayoutDashboard,
  Plus,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from "lucide-react";

const AdminPage = () => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState(null); //

  const toggle = (panel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-10 sm:py-12 pt-20 min-[380px]:pt-24 sm:pt-28 md:pt-32">
      <div className="max-w-7xl mx-auto px-3.5 min-[380px]:px-4 sm:px-6 lg:px-8 2xl:px-12 min-[1920px]:px-20">
        <div className="mb-6 min-[380px]:mb-7 sm:mb-8 md:mb-10">
          <h1 className="text-xl min-[380px]:text-2xl sm:text-3xl font-bold text-[#1A302B] tracking-tight">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-xs min-[380px]:text-sm mt-1">
            Manage your ECOCART store.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 min-[380px]:gap-2.5 sm:flex sm:flex-wrap sm:gap-3 mb-6 min-[380px]:mb-7 sm:mb-8">
          <button
            onClick={() => navigate("/admin/add-product")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#1A302B] text-white px-2 min-[380px]:px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-black active:scale-95 transition-all shadow-md text-[10px] min-[380px]:text-[11px] sm:text-sm whitespace-nowrap"
          >
            <Plus size={14} className="shrink-0 sm:w-4 sm:h-4" />
            <span className="sm:hidden">Add</span>
            <span className="hidden sm:inline">Add Product</span>
          </button>

          <button
            onClick={() => toggle("dashboard")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 min-[380px]:px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all shadow-md text-[10px] min-[380px]:text-[11px] sm:text-sm whitespace-nowrap active:scale-95 ${
              activePanel === "dashboard"
                ? "bg-[#C28E77] text-white hover:bg-[#b07c66]"
                : "bg-white text-[#1A302B] border border-gray-200 hover:border-[#1A302B]"
            }`}
          >
            <LayoutDashboard size={14} className="shrink-0 sm:w-4 sm:h-4" />
            <span className="sm:hidden">
              {activePanel === "dashboard" ? "Hide" : "Dashboard"}
            </span>
            <span className="hidden sm:inline">
              {activePanel === "dashboard"
                ? "Hide Dashboard"
                : "View Dashboard"}
            </span>
            {activePanel === "dashboard" ? (
              <ChevronUp
                size={13}
                className="shrink-0 sm:w-[15px] sm:h-[15px]"
              />
            ) : (
              <ChevronDown
                size={13}
                className="shrink-0 sm:w-[15px] sm:h-[15px]"
              />
            )}
          </button>

          <button
            onClick={() => toggle("orders")}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 min-[380px]:px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all shadow-md text-[10px] min-[380px]:text-[11px] sm:text-sm whitespace-nowrap active:scale-95 ${
              activePanel === "orders"
                ? "bg-[#1A302B] text-white hover:bg-black"
                : "bg-white text-[#1A302B] border border-gray-200 hover:border-[#1A302B]"
            }`}
          >
            <ClipboardList size={14} className="shrink-0 sm:w-4 sm:h-4" />
            <span className="sm:hidden">
              {activePanel === "orders" ? "Hide" : "Orders"}
            </span>
            <span className="hidden sm:inline">
              {activePanel === "orders" ? "Hide Orders" : "Order Control"}
            </span>
            {activePanel === "orders" ? (
              <ChevronUp
                size={13}
                className="shrink-0 sm:w-[15px] sm:h-[15px]"
              />
            ) : (
              <ChevronDown
                size={13}
                className="shrink-0 sm:w-[15px] sm:h-[15px]"
              />
            )}
          </button>
        </div>

        {activePanel === "dashboard" && <AdminDashboard />}

        {activePanel === "orders" && <AdminOrderControl />}
      </div>
    </div>
  );
};

export default AdminPage;
