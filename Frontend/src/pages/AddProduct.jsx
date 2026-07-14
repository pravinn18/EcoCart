import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";

import {
  PackagePlus,
  Upload,
  X,
  IndianRupee,
  Tag,
  Package,
  ChevronLeft,
} from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
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
      const { data } = await axios.get(`/api/lifestyle`);

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
      await axios.post(`/api/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Product Added ✅");

      setForm({
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

      setImage(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      alert("Error adding product ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 min-[380px]:pt-24 sm:pt-28 pb-10 sm:pb-12 px-3 min-[380px]:px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A302B] transition-colors mb-4 min-[380px]:mb-5 sm:mb-6"
        >
          <ChevronLeft size={14} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-5 min-[380px]:gap-6 sm:gap-8 lg:gap-10">
          <div className="bg-white rounded-2xl min-[380px]:rounded-3xl sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl p-4 min-[380px]:p-5 sm:p-7 md:p-8 lg:p-10 border border-gray-100 order-2 lg:order-1">
            <h1 className="text-lg min-[380px]:text-xl sm:text-2xl md:text-3xl font-black mb-6 sm:mb-8 lg:mb-10 flex items-center gap-2 sm:gap-3 text-gray-900">
              <PackagePlus className="text-green-600 w-5 h-5 min-[380px]:w-6 min-[380px]:h-6 sm:w-7 sm:h-7" />{" "}
              ADD PRODUCT
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 min-[380px]:gap-4 sm:gap-5 md:gap-6">
              <div className="md:col-span-2">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Product Name"
                  className="w-full bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
                />
              </div>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Category"
                className="bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
              />

              <input
                name="lifestyle"
                value={form.lifestyle}
                onChange={handleChange}
                placeholder="Lifestyle (Gym, Vegan, Organic...)"
                className="bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
              />

              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="Brand"
                className="bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
              />

              <div className="relative">
                <Package
                  className="absolute left-3 min-[380px]:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={15}
                />
                <input
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  placeholder="Weight"
                  className="w-full bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 pl-9 min-[380px]:pl-10 sm:pl-11 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
                />
              </div>

              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="Unit (kg, g, L...)"
                className="bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
              />

              <div className="relative">
                <IndianRupee
                  className="absolute left-3 min-[380px]:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={15}
                />
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="MRP Price"
                  className="w-full bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 pl-9 min-[380px]:pl-10 sm:pl-11 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="relative">
                <Tag
                  className="absolute left-3 min-[380px]:left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-green-600"
                  size={15}
                />
                <input
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                  placeholder="Discount Price"
                  className="w-full bg-green-50 p-3 min-[380px]:p-3.5 sm:p-4 pl-9 min-[380px]:pl-10 sm:pl-11 rounded-xl min-[380px]:rounded-2xl border outline-none text-green-700 font-bold text-sm sm:text-base focus:border-green-500 transition-colors"
                />
              </div>

              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                className="bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors"
              />

              <div className="md:col-span-2">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows={4}
                  className="w-full bg-gray-50 p-3 min-[380px]:p-3.5 sm:p-4 rounded-xl min-[380px]:rounded-2xl border outline-none text-sm sm:text-base focus:border-green-500 focus:bg-white transition-colors resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-6 sm:mt-8 bg-gray-900 text-white py-3.5 min-[380px]:py-4 sm:py-5 rounded-2xl min-[380px]:rounded-3xl font-black text-sm min-[380px]:text-base sm:text-lg tracking-wide hover:bg-green-600 active:scale-[0.99] transition-all shadow-lg shadow-gray-900/10"
            >
              ADD PRODUCT
            </button>
          </div>

          <div className="lg:sticky lg:top-28 order-1 lg:order-2">
            <div className="aspect-square bg-white rounded-2xl min-[380px]:rounded-3xl sm:rounded-[2.5rem] lg:rounded-[3rem] border-2 min-[380px]:border-[3px] lg:border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-xl lg:shadow-2xl relative max-w-xs min-[380px]:max-w-sm sm:max-w-none mx-auto">
              {preview ? (
                <>
                  <img
                    src={preview}
                    className="w-full h-full object-contain p-6 min-[380px]:p-8 sm:p-10"
                    alt="Preview"
                  />
                  <button
                    onClick={() => {
                      setPreview(null);
                      setImage(null);
                    }}
                    className="absolute top-3 right-3 min-[380px]:top-4 min-[380px]:right-4 sm:top-5 sm:right-5 bg-red-500 text-white p-1.5 min-[380px]:p-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X
                      size={16}
                      className="min-[380px]:w-[18px] min-[380px]:h-[18px]"
                    />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center h-full w-full px-4 text-center">
                  <Upload
                    size={32}
                    className="text-green-600 mb-2 min-[380px]:mb-3 min-[380px]:w-9 min-[380px]:h-9 sm:w-10 sm:h-10"
                  />
                  <p className="font-bold text-sm min-[380px]:text-base">
                    Upload Image
                  </p>
                  <input type="file" hidden onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
