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

    fd.append(
      "image",

      file,
    );

    fd.append(
      "title",

      title,
    );

    fd.append(
      "subtitle",

      subtitle,
    );

  fd.append("link", `/lifestyle/${encodeURIComponent(lifestyleSlug)}`);

    await axios.post(
      `/api/lifestyle`,

      fd,
    );

    fetchLifestyle();
  };

  const deleteLifestyle = async (id) => {
    await axios.delete(`/api/lifestyle/${id}`);

    fetchLifestyle();
  };

  const editLifestyle = async (item) => {
    const title = prompt(
      "Title",

      item.title,
    );

    const subtitle = prompt(
      "Subtitle",

      item.subtitle,
    );

   const link = `/lifestyle/${encodeURIComponent(title)}`;

 await axios.put(
   `/api/lifestyle/${item._id}`,

   {
     title,
     subtitle,
     link,
   },
 );

    fetchLifestyle();
  };

  const updateImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const fd = new FormData();

    fd.append(
      "image",

      file,
    );

    await axios.put(
      `/api/lifestyle/image/${activeId}`,

      fd,
    );

    fetchLifestyle();
  };

  return (
    <section className="py-10 px-4 md:px-10 group">
      <input hidden ref={fileRef} type="file" onChange={updateImage} />

      <div
        className="

flex

justify-between

items-center

mb-6

"
      >
        <h2
          className="

text-3xl

font-semibold

"
        >
          Shop by Lifestyle
        </h2>

        {isAdmin && (
          <label
            className="

bg-[#76b895]

text-white

px-4

py-2

rounded-xl

cursor-pointer

flex

gap-2

"
          >
            <Plus size={18} />
            New
            <input hidden type="file" onChange={addLifestyle} />
          </label>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="

flex

gap-5

overflow-x-auto

scroll-smooth

snap-x

custom-scrollbar

"
        >
          {items.map((item) => (
            <div
              key={item._id}
              onClick={() => handleClick(item)}
              className="

relative

min-w-[280px]

h-[280px]

rounded-[28px]

overflow-hidden

bg-[#F8F6F1]

shadow-sm

cursor-pointer

group/card

"
            >
              <img
                src={item.image}
                className="

w-full

h-[180px]

object-cover

group-hover/card:scale-105

transition-all

duration-700

"
              />

              <div className="p-5">
                <h3
                  className="

text-xl

font-semibold

"
                >
                  {item.title}
                </h3>

                <p
                  className="

text-sm

text-gray-500

"
                >
                  {item.subtitle}
                </p>
              </div>

              {isAdmin && (
                <div
                  className="

absolute

inset-0

bg-black/50

opacity-0

group-hover/card:opacity-100

flex

flex-col

justify-center

items-center

gap-3

"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setActiveId(item._id);

                      fileRef.current.click();
                    }}
                  >
                    <Camera />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      editLifestyle(item);
                    }}
                  >
                    <Pencil />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      deleteLifestyle(item._id);
                    }}
                  >
                    <Trash2 />
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
