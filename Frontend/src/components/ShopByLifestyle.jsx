import React, { useState, useEffect, useRef } from "react";
import axios from "../config/axios";
import { Plus, Camera, Trash2, Pencil, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ShopByLifestyle = () => {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const fileRef = useRef();
  const scrollRef = useRef();
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const isAdmin = userInfo?.isAdmin;

  const fetchLifestyle = async () => {
    const { data } = await axios.get(`/api/lifestyle`);
    setItems(data);
  };

  useEffect(() => {
    fetchLifestyle();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (item) => {
    navigate(`/lifestyle/${encodeURIComponent(item.title)}`);
  };

  const addLifestyle = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = prompt("Title");
    const subtitle = prompt("Subtitle");
    const lifestyleSlug = title.trim();

    const fd = new FormData();
    fd.append("image", file);
    fd.append("title", title);
    fd.append("subtitle", subtitle);
    fd.append("link", `/lifestyle/${encodeURIComponent(lifestyleSlug)}`);

    await axios.post(`/api/lifestyle`, fd);
    fetchLifestyle();
  };

  const deleteLifestyle = async (id) => {
    await axios.delete(`/api/lifestyle/${id}`);
    fetchLifestyle();
  };

  const editLifestyle = async (item) => {
    const title = prompt("Title", item.title);
    const subtitle = prompt("Subtitle", item.subtitle);
    const link = `/lifestyle/${encodeURIComponent(title)}`;

    await axios.put(`/api/lifestyle/${item._id}`, { title, subtitle, link });
    fetchLifestyle();
  };

  const updateImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("image", file);

    await axios.put(`/api/lifestyle/image/${activeId}`, fd);
    fetchLifestyle();
  };

  return (
    <section className="py-6 px-3 sm:py-7 sm:px-4 md:py-8 md:px-6 lg:py-10 lg:px-10 group">
      <input hidden ref={fileRef} type="file" onChange={updateImage} />

      <div className="flex justify-between items-center mb-4 sm:mb-5 lg:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
          Shop by Lifestyle
        </h2>

        {isAdmin && (
          <label className="bg-[#76b895] text-white px-3 py-1.5 rounded-lg gap-1.5 text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:gap-2 sm:text-sm lg:text-base cursor-pointer flex items-center">
            <Plus className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            New
            <input hidden type="file" onChange={addLifestyle} />
          </label>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto scroll-smooth snap-x custom-scrollbar"
        >
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => handleClick(item)}
              className="relative min-w-[180px] w-[180px] h-[180px] sm:min-w-[220px] sm:w-[220px] sm:h-[220px] md:min-w-[250px] md:w-[250px] md:h-[250px] lg:min-w-[280px] lg:w-[280px] lg:h-[280px] 2xl:min-w-[320px] 2xl:w-[320px] 2xl:h-[320px] rounded-2xl lg:rounded-[28px] overflow-hidden bg-[#F8F6F1] shadow-sm cursor-pointer group/card flex-shrink-0"
            >
              <img
                src={item.image}
                className="w-full h-[110px] sm:h-[140px] md:h-[160px] lg:h-[180px] 2xl:h-[200px] object-cover group-hover/card:scale-105 transition-all duration-700"
              />

              <div className="p-3 sm:p-4 lg:p-5">
                <h3 className="text-sm sm:text-base lg:text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs lg:text-sm text-gray-500">
                  {item.subtitle}
                </p>
              </div>

              {isAdmin && (
                <div className="absolute inset-0 bg-black/50 opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 flex flex-col justify-center items-center gap-2 sm:gap-2.5 lg:gap-3 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveId(item._id);
                      fileRef.current.click();
                    }}
                  >
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editLifestyle(item);
                    }}
                  >
                    <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLifestyle(item._id);
                    }}
                  >
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByLifestyle;
