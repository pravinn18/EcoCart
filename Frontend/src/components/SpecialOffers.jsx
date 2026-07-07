import React, { useState, useEffect, useRef } from "react";
import axios from "../config/axios";
import { Plus, Camera, Link as LinkIcon, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SpecialOffers = () => {
  const [offers, setOffers] = useState([]);
  const scrollRef = useRef(null);
  const fileUpdateInputRef = useRef(null);
  const [activeOfferId, setActiveOfferId] = useState(null);

  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdmin = userInfo?.isAdmin;

  const fetchOffers = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/offers`);
      setOffers(data.length ? data : []);
    } catch (error) {
      console.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -clientWidth : clientWidth,
        behavior: "smooth",
      });
    }
  };


  const handleOfferClick = (offer) => {
    if (!offer.link) return;

    if (offer.link.startsWith("http")) {
      window.open(offer.link, "_blank");
    } else {
      navigate(offer.link);
    }
  };

  const handleAddNewOffer = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${BASE_URL}/api/offers`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("New offer added!");
      fetchOffers();
    } catch {
      alert("Failed to add offer.");
    } finally {
      e.target.value = null;
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/offers/${id}`);
      fetchOffers();
    } catch {
      alert("Could not delete offer.");
    }
  };


  const handleSetLink = async (id) => {
    const url = prompt(
      "Enter redirect URL or Path (e.g., /category/fruits or https://google.com):",
    );

    if (!url) return;

    try {
      await axios.put(
        `${BASE_URL}/api/offers/${id}`,
        { link: url },
        { headers: { "Content-Type": "application/json" } },
      );

      fetchOffers();
    } catch {
      alert("Failed to update link.");
    }
  };

  const handleUpdateImage = async (e) => {
    const file = e.target.files[0];

    if (!file || !activeOfferId) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.put(
        `${BASE_URL}/api/offers/image/${activeOfferId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      fetchOffers();
    } catch {
      alert("Update failed.");
    } finally {
      setActiveOfferId(null);

      if (fileUpdateInputRef.current) {
        fileUpdateInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="w-full bg-white py-10 px-4 md:px-10 group">
      <input
        type="file"
        ref={fileUpdateInputRef}
        hidden
        onChange={handleUpdateImage}
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Special Offers</h2>

        {isAdmin && (
          <label className="bg-[#76b895] hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 font-medium transition-all shadow-sm">
            <Plus size={18} /> New Offer
            <input type="file" hidden onChange={handleAddNewOffer} />
          </label>
        )}
      </div>

      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="hidden group-hover:block absolute -left-6 z-10 p-2 text-gray-400 hover:text-gray-900"
        >
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-gray-400 border-b-[6px] border-b-transparent" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x custom-scrollbar scroll-smooth"
        >
          {offers.map((offer) => (
            <div
              key={offer._id}
              onClick={() => handleOfferClick(offer)}
              className="
      relative
      min-w-[280px]
      md:min-w-[360px]
      h-[220px]
      rounded-[28px]
      overflow-hidden
      shadow-sm
      snap-start
      group/card
      cursor-pointer
      bg-[#f8f6f1]
    "
            >
              <img
                src={offer.image}
                alt="Offer"
                className="
        w-full
        h-full
        object-cover
        transition-all
        duration-700
        ease-out
        group-hover/card:scale-[1.03]
      "
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x450?text=Offer";
                }}
              />

              {isAdmin && (
                <div
                  className="
        absolute
        inset-0
        bg-black/50
        flex
        flex-col
        items-center
        justify-center
        gap-3
        opacity-0
        group-hover/card:opacity-100
        transition-opacity
      "
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveOfferId(offer._id);

                      if (fileUpdateInputRef.current) {
                        fileUpdateInputRef.current.click();
                      }
                    }}
                    className="
            bg-white
            text-gray-900
            px-6
            py-2
            rounded-full
            font-bold
            text-sm
            hover:bg-gray-100
            flex
            items-center
            gap-2
          "
                  >
                    <Camera size={16} />
                    Change Image
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(offer._id);
                    }}
                    className="
            bg-[#e11d48]
            text-white
            px-10
            py-2
            rounded-full
            font-bold
            text-sm
            hover:bg-red-700
            flex
            items-center
            gap-2
          "
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetLink(offer._id);
                    }}
                    className="
            bg-[#2563eb]
            text-white
            px-10
            py-2
            rounded-full
            font-bold
            text-sm
            hover:bg-blue-700
            flex
            items-center
            gap-2
          "
                  >
                    <LinkIcon size={16} />
                    Set Link
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden group-hover:block absolute -right-6 z-10 p-2 text-gray-400 hover:text-gray-900"
        >
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-400 border-b-[6px] border-b-transparent" />
        </button>
      </div>
    </section>
  );
};

export default SpecialOffers;
