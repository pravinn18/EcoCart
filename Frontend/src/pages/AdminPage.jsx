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
    <div className="bg-[#F9F9F9] min-h-screen py-12 pt-28 sm:pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
      
        <div className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A302B] tracking-tight">
            Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your ECOCART store.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
        
          <button
            onClick={() => navigate("/admin/add-product")}
            className="flex items-center gap-2 bg-[#1A302B] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-semibold hover:bg-black transition-all shadow-md text-sm"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => toggle("dashboard")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-semibold transition-all shadow-md text-sm ${
              activePanel === "dashboard"
                ? "bg-[#C28E77] text-white hover:bg-[#b07c66]"
                : "bg-white text-[#1A302B] border border-gray-200 hover:border-[#1A302B]"
            }`}
          >
            <LayoutDashboard size={16} />
            <span>
              {activePanel === "dashboard"
                ? "Hide Dashboard"
                : "View Dashboard"}
            </span>
            {activePanel === "dashboard" ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
            )}
          </button>

          
          <button
            onClick={() => toggle("orders")}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-semibold transition-all shadow-md text-sm ${
              activePanel === "orders"
                ? "bg-[#1A302B] text-white hover:bg-black"
                : "bg-white text-[#1A302B] border border-gray-200 hover:border-[#1A302B]"
            }`}
          >
            <ClipboardList size={16} />
            <span>
              {activePanel === "orders" ? "Hide Orders" : "Order Control"}
            </span>
            {activePanel === "orders" ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
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
