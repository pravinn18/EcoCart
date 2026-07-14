import React, { useState, useEffect, useRef } from "react";
import axios from "../config/axios";
import { Plus, Camera, Link as LinkIcon, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      const { data } = await axios.get(`/api/offers`);
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
      await axios.post(`/api/offers`, formData, {
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
      await axios.delete(`/api/offers/${id}`);
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
        `/api/offers/${id}`,
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
      await axios.put(`/api/offers/image/${activeOfferId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    <section className="w-full bg-white py-6 sm:py-8 md:py-10 px-3 sm:px-6 md:px-10 group">
      <input
        type="file"
        ref={fileUpdateInputRef}
        hidden
        onChange={handleUpdateImage}
      />

      <div className="flex justify-between items-center mb-4 sm:mb-5 md:mb-6">
        <h2 className="text-lg sm:text-2xl md:text-3xl 2xl:text-4xl font-bold text-gray-900 tracking-tight">
          Special Offers
        </h2>

        {isAdmin && (
          <label className="bg-[#76b895] hover:bg-emerald-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-pointer flex items-center gap-1.5 sm:gap-2 font-medium text-xs sm:text-sm transition-all shadow-sm">
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden xs:inline">New Offer</span>
            <input type="file" hidden onChange={handleAddNewOffer} />
          </label>
        )}
      </div>

      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="hidden lg:group-hover:block absolute -left-6 z-10 p-2 text-gray-400 hover:text-gray-900"
        >
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-gray-400 border-b-[6px] border-b-transparent" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-3 sm:pb-4 snap-x custom-scrollbar scroll-smooth"
        >
          {offers.map((offer) => (
            <div
              key={offer._id}
              onClick={() => handleOfferClick(offer)}
              className="relative min-w-[210px] w-[210px] h-[130px] sm:min-w-[280px] sm:w-[280px] sm:h-[175px] md:min-w-[360px] md:w-[360px] md:h-[220px] 2xl:min-w-[420px] 2xl:w-[420px] 2xl:h-[260px] rounded-2xl sm:rounded-[28px] overflow-hidden shadow-sm snap-start group/card cursor-pointer bg-[#f8f6f1] flex-shrink-0"
            >
              <img
                src={offer.image}
                alt="Offer"
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover/card:scale-[1.03]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/800x450?text=Offer";
                }}
              />

              {isAdmin && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 sm:gap-3 opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveOfferId(offer._id);

                      if (fileUpdateInputRef.current) {
                        fileUpdateInputRef.current.click();
                      }
                    }}
                    className="bg-white text-gray-900 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-[11px] sm:text-sm hover:bg-gray-100 flex items-center gap-1.5 sm:gap-2"
                  >
                    <Camera size={14} className="sm:w-4 sm:h-4" />
                    Change Image
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(offer._id);
                    }}
                    className="bg-[#e11d48] text-white px-5 sm:px-10 py-1.5 sm:py-2 rounded-full font-bold text-[11px] sm:text-sm hover:bg-red-700 flex items-center gap-1.5 sm:gap-2"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    Delete
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetLink(offer._id);
                    }}
                    className="bg-[#2563eb] text-white px-5 sm:px-10 py-1.5 sm:py-2 rounded-full font-bold text-[11px] sm:text-sm hover:bg-blue-700 flex items-center gap-1.5 sm:gap-2"
                  >
                    <LinkIcon size={14} className="sm:w-4 sm:h-4" />
                    Set Link
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="hidden lg:group-hover:block absolute -right-6 z-10 p-2 text-gray-400 hover:text-gray-900"
        >
          <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-gray-400 border-b-[6px] border-b-transparent" />
        </button>
      </div>
    </section>
  );
};

export default SpecialOffers;
