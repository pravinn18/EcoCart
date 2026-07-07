import React, { useState, useEffect } from "react";
import axios from "../config/axios";

import {
  PackagePlus,
  Upload,
  X,
  IndianRupee,
  Tag,
  Package,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    lifestyle: "",
    weight: "",
    unit: "",
    price: "",
    discountPrice: "",
    stock: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  

  const fetchLifestyles = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/lifestyle`);

      setLifestyles(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
  if (!form.name || !form.price || !form.stock) {
    alert("Name, Price and Stock required");
    return;
  }

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.post(`${BASE_URL}/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product Added ✅");

      setForm({
        name: "",
        brand: "",
        category: "",
        lifestyle:"",
        weight: "",
        unit: "",
        price: "",
        discountPrice: "",
        stock: "",
        description: "",
      });

      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Error adding product ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-10 border">
          <h1 className="text-3xl font-black mb-10 flex items-center gap-3">
            <PackagePlus className="text-green-600" /> ADD PRODUCT
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full bg-gray-50 p-4 rounded-2xl border outline-none"
              />
            </div>

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="bg-gray-50 p-4 rounded-2xl border outline-none"
            />

            <input
              name="lifestyle"
              value={form.lifestyle}
              onChange={handleChange}
              placeholder="Lifestyle (Gym, Vegan, Organic...)"
              className="
bg-gray-50
p-4
rounded-2xl
border
outline-none
"
            />

            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Brand"
              className="bg-gray-50 p-4 rounded-2xl border outline-none"
            />

            <div className="relative">
              <Package
                className="absolute left-4 top-4 text-gray-400"
                size={16}
              />
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="Weight"
                className="w-full bg-gray-50 p-4 pl-10 rounded-2xl border outline-none"
              />
            </div>

            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="Unit (kg, g, L...)"
              className="bg-gray-50 p-4 rounded-2xl border outline-none"
            />

            <div className="relative">
              <IndianRupee
                className="absolute left-4 top-4 text-gray-400"
                size={16}
              />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="MRP Price"
                className="w-full bg-gray-50 p-4 pl-10 rounded-2xl border outline-none"
              />
            </div>

            <div className="relative">
              <Tag className="absolute left-4 top-4 text-green-600" size={16} />
              <input
                name="discountPrice"
                value={form.discountPrice}
                onChange={handleChange}
                placeholder="Discount Price"
                className="w-full bg-green-50 p-4 pl-10 rounded-2xl border outline-none text-green-700 font-bold"
              />
            </div>

            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              className="bg-gray-50 p-4 rounded-2xl border outline-none"
            />

            <div className="md:col-span-2">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full bg-gray-50 p-4 rounded-2xl border outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full mt-8 bg-gray-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-green-600 transition"
          >
            ADD PRODUCT
          </button>
        </div>

        <div className="sticky top-28">
          <div className="aspect-square bg-white rounded-[3rem] border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-2xl relative">
            {preview ? (
              <>
                <img
                  src={preview}
                  className="w-full h-full object-contain p-10"
                  alt="Preview"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setImage(null);
                  }}
                  className="absolute top-5 right-5 bg-red-500 text-white p-2 rounded-full"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                <Upload size={40} className="text-green-600 mb-3" />
                <p className="font-bold">Upload Image</p>
                <input type="file" hidden onChange={handleImageChange} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
