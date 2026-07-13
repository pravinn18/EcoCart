import React, { useEffect, useState } from "react";
import axios from "../config/axios";
import AdSlider from "../components/AdSlider";
import CategorySection from "../components/CategorySection";
import SpecialOffers from "../components/SpecialOffers";
import ProductRow from "../components/ProductRow";
import ShopByLifestyle from "../components/ShopByLifestyle";
import EcoCartPlusSection from "../components/EcoCartPlusSection";



const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
   
    axios
      .get(`/api/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Product fetch error:", err));

    
    axios
      .get(`/api/categories`)
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Category fetch error:", err));
  }, []);



  const lifestyle = [
    {
      _id: 1,
      title: "Healthy Living",
      subtitle: "Clean essentials for a better you",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e",
      link: "/category/Vegetables",
    },

    {
      _id: 2,
      title: "Daily Staples",
      subtitle: "Everything you need everyday",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
      link: "/category/Rice",
    },

    {
      _id: 3,
      title: "Chef's Pantry",
      subtitle: "Premium picks for your kitchen",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5",
      link: "/category/Oil",
    },

    {
      _id: 4,
      title: "Weekend Gatherings",
      subtitle: "Delight in every moment",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      link: "/category/Snacks",
    },
  ];

  return (
    <div className="bg-white min-h-screen pt-24">
      <div className="px-6 md:px-10 mt-4">
        <AdSlider />
      </div>

      <CategorySection />

      <EcoCartPlusSection />

      <ShopByLifestyle />

      <SpecialOffers />

      <div className="mt-8 space-y-4">
        {categories.length === 0 ? (
          <div className="px-16 py-10 text-gray-400">
            Loading your selections...
          </div>
        ) : (
          categories.map((cat) => (
            <ProductRow
              key={cat._id}
              title={cat.name}
              categoryName={cat.name}
              products={products}
            />
          ))
        )}
      </div>

      <div className="pb-20"></div>
    </div>
  );
};

export default Home;
