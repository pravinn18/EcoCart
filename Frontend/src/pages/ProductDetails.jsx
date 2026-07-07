import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../config/axios";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import { computeOffer } from "../utils/offerUtils";
import {
  ChevronLeft,
  ShoppingBag,
  Check,
  Loader2,
  XCircle,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  Pencil,
  X,
  Save,
  PackageCheck,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const toDateInputValue = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    brand: "",
    weight: "",
    quantity: "",
    expiryDate: "",
    mfgDate: "",
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  const userInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo"));
    } catch {
      return null;
    }
  })();

  const isAdmin = userInfo?.isAdmin || userInfo?.role === "admin";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${BASE_URL}/api/products/${id}`);
        setProduct(data);
        if (Number(data.quantity || data.stock || 0) > 0) setQty(1);
        const { data: all } = await axios.get(`${BASE_URL}/api/products`);
        setSimilar(
          all
            .filter(
              (p) =>
                p.category?.toLowerCase() === data.category?.toLowerCase() &&
                p._id !== id,
            )
            .slice(0, 8),
        );
      } catch (err) {
        console.error(err);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const availableStock = Number(product?.quantity || product?.stock || 0);
  const wishlisted = product ? isWishlisted(product._id) : false;

  const { finalPrice, discountPercent } = product
    ? computeOffer(product, userInfo, false)
    : {
        finalPrice: 0,
        discountPercent: 0,
      };

  const hasDiscount = product && finalPrice < Number(product.price);
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock === 1;

  const handleWishlist = () => {
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);
    toggleWishlist(product);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (qty > availableStock) {
      alert(`Only ${availableStock} items available`);
      return;
    }
    addToCart({ ...product, discountPrice: finalPrice, qty });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const increaseQty = () => {
    if (qty < availableStock) setQty((p) => p + 1);
  };
  const decreaseQty = () => setQty((p) => Math.max(1, p - 1));

  const handleOpenEditModal = () => {
    setEditForm({
      name: product?.name || "",
      category: product?.category || "",
      brand: product?.brand || "",
      weight: product?.weight || "",
      quantity: String(product?.quantity || product?.stock || 0),
      expiryDate: toDateInputValue(product?.expiryDate),
      mfgDate: toDateInputValue(product?.mfgDate),
    });
    setEditError("");
    setEditSuccess(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    setEditError("");
    setEditSuccess(false);
    try {
      const token = userInfo?.token;
      const payload = {
        ...(editForm.name && { name: editForm.name }),
        ...(editForm.category && { category: editForm.category }),
        ...(editForm.brand !== undefined && { brand: editForm.brand }),
        ...(editForm.weight !== undefined && { weight: editForm.weight }),
        quantity: Number(editForm.quantity),
        ...(editForm.expiryDate && { expiryDate: editForm.expiryDate }),
        ...(editForm.mfgDate && { mfgDate: editForm.mfgDate }),
      };
      const { data } = await axios.put(
        `${BASE_URL}/api/products/${id}/stock`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setProduct((prev) => ({ ...prev, ...data }));
      setEditSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      setEditError(
        err?.response?.data?.message || "Failed to update. Try again.",
      );
    } finally {
      setEditSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#C28E77]" size={40} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Loading product...
        </p>
      </div>
    );

  if (error || !product)
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="bg-red-50 p-8 rounded-full">
          <XCircle size={40} className="text-red-300" />
        </div>
        <p className="text-red-500 font-semibold">{error}</p>
        <Link
          to="/"
          className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Back to Home
        </Link>
      </div>
    );

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-20 sm:pt-24 lg:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A302B] transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </Link>
          {isAdmin && (
            <button
              onClick={handleOpenEditModal}
              className="inline-flex items-center gap-2 bg-[#1A302B] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md"
            >
              <Pencil size={13} /> Edit Stock
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-16 lg:mb-20">
          
          <div className="w-full lg:w-1/2 relative">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[520px]">
              <img
                src={
                  product.image?.startsWith("http")
                    ? product.image
                    : `${BASE_URL}${product.image}`
                }
                alt={product.name}
                className="w-full max-w-xs sm:max-w-sm lg:max-w-md object-contain transition-transform duration-700 hover:scale-105"
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/400?text=Product")
                }
              />
            </div>

            <button
              onClick={handleWishlist}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10 p-3 rounded-full bg-white shadow-md border border-gray-100 transition-all duration-300 hover:scale-110 active:scale-95"
            >
              <Heart
                size={22}
                className={`transition-all duration-300 ${heartBurst ? "scale-150" : "scale-100"} ${wishlisted ? "fill-red-500 text-red-500" : "fill-none text-gray-300"}`}
              />
            </button>
          </div>

          <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-5 sm:space-y-6">
            
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <Link
                  to={`/category/${product.category.toLowerCase()}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#C28E77] bg-[#C28E771A] px-3 py-1.5 rounded-full hover:bg-[#C28E7730] transition"
                >
                  {product.category}
                </Link>
              )}
              {product.weight && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                  {product.weight}
                </span>
              )}
            </div>

           
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A302B] leading-tight tracking-tight">
              {product.name}
            </h1>

           
            <div className="flex items-end gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-[#1A302B]">
                ₹{finalPrice.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg sm:text-xl text-gray-400 line-through mb-1">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full mb-1">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

         
            {product.description && (
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Description
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {(product.mfgDate || product.expiryDate) && (
              <div className="flex items-center gap-4 flex-wrap text-[11px] text-gray-500 font-medium">
                {product.mfgDate && (
                  <span>
                    <span className="font-bold text-gray-400 uppercase tracking-wider">
                      Mfg:{" "}
                    </span>
                    {new Date(product.mfgDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
                {product.expiryDate && (
                  <span>
                    <span className="font-bold text-gray-400 uppercase tracking-wider">
                      Exp:{" "}
                    </span>
                    {new Date(product.expiryDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            )}

            {isOutOfStock && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                <XCircle size={15} className="text-red-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                  Out of Stock
                </span>
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-3 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest text-orange-500">
                  Only 1 Left — Order Soon!
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {!isOutOfStock && (
                <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
                  <button
                    onClick={decreaseQty}
                    disabled={qty <= 1}
                    className="p-3 hover:text-[#C28E77] transition-colors disabled:opacity-40"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-sm font-bold min-w-[36px] text-center">
                    {qty}
                  </span>
                  <button
                    onClick={increaseQty}
                    disabled={qty >= availableStock}
                    className="p-3 hover:text-[#C28E77] transition-colors disabled:opacity-40"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 rounded-full font-bold uppercase tracking-widest text-[11px] transition-all shadow-lg ${
                  isOutOfStock
                    ? "bg-red-100 text-red-400 cursor-not-allowed border border-red-200"
                    : isAdded
                      ? "bg-green-600 text-white shadow-green-200"
                      : "bg-[#1A302B] text-white hover:bg-black shadow-[#1a302b1c]"
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <XCircle size={16} /> Out of Stock
                  </>
                ) : isAdded ? (
                  <>
                    <Check size={16} strokeWidth={3} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} /> Add to Cart
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              {[
                { icon: ShieldCheck, label: "100% Organic" },
                { icon: Truck, label: "Free Delivery" },
                { icon: RotateCcw, label: "Easy Returns" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F9F9F9] flex items-center justify-center">
                    <Icon size={15} className="text-[#1A302B]" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1A302B] tracking-tight">
                  Similar Products
                </h2>
                <div className="h-1 w-10 bg-[#C28E77] mt-2 rounded-full" />
              </div>
              {product.category && (
                <Link
                  to={`/category/${product.category.toLowerCase()}`}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#1A302B] hover:text-[#C28E77] transition-colors"
                >
                  See All →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {similar.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1A302B] flex items-center justify-center">
                  <PackageCheck size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A302B] uppercase tracking-widest">
                    Edit Stock
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">
                    {product.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  label: "Product Name",
                  key: "name",
                  type: "text",
                  placeholder: "Product name",
                },
                {
                  label: "Category",
                  key: "category",
                  type: "text",
                  placeholder: "e.g. Dairy",
                },
                {
                  label: "Brand",
                  key: "brand",
                  type: "text",
                  placeholder: "e.g. Amul",
                },
                {
                  label: "Weight",
                  key: "weight",
                  type: "text",
                  placeholder: "e.g. 500g",
                },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1A302B] focus:outline-none focus:ring-2 focus:ring-[#1A302B] focus:border-transparent transition"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div className="border-t border-gray-100 pt-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300 mb-3">
                  Stock & Dates
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.quantity}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, quantity: e.target.value }))
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1A302B] focus:outline-none focus:ring-2 focus:ring-[#1A302B] focus:border-transparent transition"
                  placeholder="e.g. 50"
                />
              </div>
              {[
                { label: "Manufacturing Date", key: "mfgDate" },
                { label: "Expiry Date", key: "expiryDate" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    {label}
                  </label>
                  <input
                    type="date"
                    value={editForm[key]}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-[#1A302B] focus:outline-none focus:ring-2 focus:ring-[#1A302B] focus:border-transparent transition"
                  />
                </div>
              ))}
            </div>

            {editError && (
              <p className="mt-4 text-xs text-red-500 font-medium bg-red-50 px-4 py-2.5 rounded-xl">
                {editError}
              </p>
            )}
            {editSuccess && (
              <p className="mt-4 text-xs text-green-600 font-medium bg-green-50 px-4 py-2.5 rounded-xl flex items-center gap-2">
                <Check size={13} strokeWidth={3} /> Updated successfully!
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 rounded-full border border-gray-200 text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editSaving}
                className="flex-1 py-3 rounded-full bg-[#1A302B] text-white text-[11px] font-bold uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {editSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
