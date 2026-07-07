import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

const ProductRow = ({ title, categoryName, products }) => {
  const scrollRef = useRef(null);

  const filteredProducts = products.filter(
    (p) => p.category?.toLowerCase() === categoryName?.toLowerCase(),
  );

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  if (filteredProducts.length === 0) return null;

  return (
    <div className="w-full py-8 bg-white border-b border-gray-50">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16">
       
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            <div className="h-1 w-12 bg-[#1A3C34] mt-2 rounded-full"></div>
          </div>
          <Link
            to={`/category/${categoryName}`}
            className="text-sm font-bold uppercase tracking-widest text-[#1A3C34] hover:text-[#D4AF37] transition-colors"
          >
            See All
          </Link>
        </div>

    
        <div className="relative group">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x snap-mandatory"
            style={{
              msOverflowStyle: "none",
              scrollbarWidth: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {filteredProducts.map((item) => (
              <div
                key={item._id}
                className="flex-shrink-0 w-[240px] md:w-[280px] snap-start"
              >
                <ProductCard product={item} />
              </div>
            ))}
          </div>

         
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-20 bg-white p-3 rounded-full shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
          >
            <ChevronRight size={24} className="text-[#1A3C34]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductRow;
