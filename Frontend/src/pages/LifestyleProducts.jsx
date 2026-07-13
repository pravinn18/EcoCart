import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import axios from "../config/axios";

import ProductCard from "../components/ProductCard";


export default function () {
  const { name } = useParams();

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
