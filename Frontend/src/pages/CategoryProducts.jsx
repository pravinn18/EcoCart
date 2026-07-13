import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../config/axios";
import { ChevronLeft, Loader2, PackageOpen } from "lucide-react";
import ProductCard from "../components/ProductCard";

const CategoryProducts = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products`);
        const filtered = data.filter(
          (p) => p.category?.toLowerCase() === categoryName?.toLowerCase(),
        );
        setProducts(filtered);
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryName]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 pt-28">
        <Loader2 className="animate-spin text-[#C28E77]" size={40} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Loading products...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6">
       
        <div className="flex items-center gap-4 mb-10">
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 rounded-xl text-[#1A302B] transition"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
              Category
            </p>
            <h1 className="text-3xl font-bold text-[#1A302B] capitalize tracking-tight">
              {categoryName}
            </h1>
          </div>
        </div>

        {products.length > 0 && (
          <p className="text-sm text-gray-400 mb-6">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="bg-gray-50 p-8 rounded-full">
              <PackageOpen size={40} className="text-gray-200" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-700">
                No products found
              </h2>
              <p className="text-gray-400 text-sm">
                No products in the "{categoryName}" category yet.
              </p>
            </div>
            <Link
              to="/"
              className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
            >
              Back to Home
            </Link>
          </div>
        ) : (
         
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
