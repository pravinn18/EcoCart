import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  LogOut,
  ChevronRight,
  Mail,
  Shield,
  Edit2,
  Check,
  X,
  Crown,
  Loader2,
} from "lucide-react";
import axios from "../config/axios";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Profile = () => {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { cartItems } = useCart();

  const [userInfo, setUserInfo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [orders, setOrders] = useState([]);

  const fetchOrders = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userInfo"));
      if (!user) {
        navigate("/login");
        return;
      }
      setUserInfo(user);
      setName(user.name || "");

      const { data } = await axios.get(`${BASE_URL}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Save name to DB and update localStorage
  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === userInfo.name) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      setSaveError("");
      const { data } = await axios.put(
        `${BASE_URL}/api/users/profile`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${userInfo.token}` } },
      );
      // data should return updated user; fallback to local if server returns partial
      const updated = { ...userInfo, name: data.name || name.trim() };
      localStorage.setItem("userInfo", JSON.stringify(updated));
      setUserInfo(updated);
      setEditing(false);
    } catch (err) {
      setSaveError(
        err.response?.data?.message || "Failed to update name. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setName(userInfo.name || "");
    setSaveError("");
    setEditing(false);
  };

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (!userInfo) return null;

  const avatar = userInfo.name?.charAt(0).toUpperCase();

  // Only Terms left in menu (Orders & Wishlist removed per requirement)
  const menuItems = [
    {
      icon: FileText,
      label: "Terms & Conditions",
      sub: "Read our policies",
      to: "/terms",
    },
  ];

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-[#1A302B] flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {avatar}
          </div>

          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="border-b-2 border-[#1A302B] text-lg font-bold text-[#1A302B] bg-transparent outline-none w-full max-w-[220px] pb-0.5"
                    autoFocus
                    disabled={saving}
                  />
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin text-[#1A302B] flex-shrink-0"
                    />
                  ) : (
                    <>
                      <button
                        onClick={handleSaveName}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition flex-shrink-0"
                        title="Save"
                      >
                        <Check size={15} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition flex-shrink-0"
                        title="Cancel"
                      >
                        <X size={15} />
                      </button>
                    </>
                  )}
                </div>
                {saveError && (
                  <p className="text-xs text-red-500 mt-1">{saveError}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl font-bold text-[#1A302B]">
                  {userInfo.name}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1A302B] transition"
                  title="Edit name"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-gray-400 text-sm justify-center sm:justify-start">
                <Mail size={13} />
                <span>{userInfo.email}</span>
              </div>
              {userInfo.isAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#C28E77] bg-[#C28E7715] px-3 py-1 rounded-full mx-auto sm:mx-0">
                  <Shield size={11} /> Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Orders", value: orders.length, to: "/orders" },
            { label: "Wishlist", value: wishlist.length, to: "/wishlist" },
            { label: "Cart", value: cartItems.length, to: "/cart" },
          ].map(({ label, value, to }) => (
            <Link
              key={label}
              to={to}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-all group"
            >
              <p className="text-2xl font-bold text-[#1A302B] group-hover:text-[#C28E77] transition-colors">
                {value}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
                {label}
              </p>
            </Link>
          ))}
        </div>

        {/* ── PLUS UPSELL (if not plus member) ── */}
        {!userInfo.isPlusMember && (
          <Link
            to="/plus"
            className="flex items-center gap-4 px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5 hover:bg-amber-100 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Crown size={18} className="text-amber-500 fill-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-700">EcoCart Plus</p>
              <p className="text-[11px] text-amber-500 mt-0.5">
                Free delivery, 5% extra discount & more
              </p>
            </div>
            <ChevronRight
              size={16}
              className="text-amber-400 group-hover:text-amber-600 transition-colors flex-shrink-0"
            />
          </Link>
        )}

        {/* ── MENU ITEMS ── */}
        {menuItems.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
            {menuItems.map(({ icon: Icon, label, sub, to }, i) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all group ${
                  i < menuItems.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F9F9F9] flex items-center justify-center group-hover:bg-[#1A302B] transition-colors flex-shrink-0">
                  <Icon
                    size={16}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A302B]">
                    {label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-gray-300 group-hover:text-[#C28E77] transition-colors flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        )}

        {/* ── LOGOUT ── */}
        <button
          onClick={logoutHandler}
          className="w-full flex items-center justify-center gap-3 bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
