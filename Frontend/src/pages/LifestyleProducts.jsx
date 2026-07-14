import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import axios from "../config/axios";

import ProductCard from "../components/ProductCard";

import { ChevronLeft } from "lucide-react";

export default function () {
  const { name } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/products/lifestyle/${name}`)

      .then((res) => {
        setProducts(res.data);
      });
  }, [name]);

  return (
    <div className="pt-28 px-6 md:px-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A302B] transition-colors mb-4"
      >
        <ChevronLeft size={14} /> Back
      </button>

      <h1
        className="

text-4xl
font-bold
mb-10

"
      >
        {name}
      </h1>

      <div
        className="

grid

grid-cols-2

md:grid-cols-4

gap-6

"
      >
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
