import React, { useEffect, useState, useRef } from "react";
import axios from "../config/axios";
import { Link } from "react-router-dom";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";



const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const isAdmin = userInfo?.isAdmin === true;

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`/api/categories`);
      if (data && data.length > 0) setCategories(data);
      else setCategories([]);
    } catch (error) {
      console.error("Fetch error:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.8
          : scrollLeft + clientWidth * 0.8;

      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  const handleAdd = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const name = prompt("Enter Category Name:");
    if (!name) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", file);

    try {
      await axios.post(`/api/categories`, formData);
      fetchCategories();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to add category.");
    }

    e.target.value = "";
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const chunkedCategories = [];
  for (let i = 0; i < categories.length; i += 2) {
    chunkedCategories.push(categories.slice(i, i + 2));
  }

  return (
    <>
      <div id="product-categories"></div>

      <style>{`
        .cat-section {
          width: 100%;
          background: #fff;
          box-sizing: border-box;
          overflow: hidden;
        }

        .cat-inner {
          padding: 20px 16px 16px;
          max-width: 1440px;
          margin: 0 auto;
        }

        @media (min-width: 480px) {
          .cat-inner {
            padding: 24px 20px 20px;
          }
        }

        @media (min-width: 768px) {
          .cat-inner {
            padding: 28px 32px 24px;
          }
        }

        @media (min-width: 1024px) {
          .cat-inner {
            padding: 32px 48px 24px;
          }
        }

        @media (min-width: 1440px) {
          .cat-inner {
            padding: 36px 64px 28px;
          }
        }

        .cat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .cat-title {
          font-size: clamp(14px, 2vw, 18px);
          font-weight: 800;
          color: #111827;
          letter-spacing: 0.03em;
          margin: 0;
          text-transform: uppercase;
          position: relative;
        }

        .cat-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .cat-admin-divider {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-right: 8px;
          margin-right: 1px;
          border-right: 1px solid #e5e7eb;
        }

        .cat-add-label {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: #f3f4f6;
          border-radius: 6px;
          cursor: pointer;
          color: #374151;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
        }

        .cat-add-label:hover {
          background: #10b981;
          color: #fff;
        }

        .cat-nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .cat-nav-btn-left {
          background: #fff;
          color: #4b5563;
        }

        .cat-nav-btn-left:hover {
          background: #f9fafb;
          border-color: #d1d5db;
          color: #111827;
        }

        .cat-nav-btn-right {
          background: #111827;
          color: #fff;
          border-color: #111827;
        }

        .cat-nav-btn-right:hover {
          background: #1f2937;
          border-color: #1f2937;
        }

        .cat-scroll-wrap {
          display: flex;
          overflow-x: auto;
          gap: clamp(12px, 2.5vw, 24px);
          padding: 6px 4px 12px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }

        .cat-scroll-wrap::-webkit-scrollbar {
          display: none;
        }

        .cat-col {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 3vw, 28px);
          flex-shrink: 0;
        }

        .cat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          cursor: pointer;
        }

        .cat-img-wrap {
          width: clamp(64px, 11vw, 106px);
          height: clamp(64px, 11vw, 106px);
          border-radius: clamp(8px, 1.5vw, 16px);
          overflow: hidden;
          background: #f9fafb;
          border: 1px solid #f3f4f6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.01);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .cat-item:hover .cat-img-wrap {
          transform: translateY(-4px);
          border-color: #e5e7eb;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06), 0 3px 6px rgba(0, 0, 0, 0.03);
        }

        .cat-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cat-item:hover .cat-img {
          transform: scale(1.05);
        }

        .cat-delete-btn {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 20px;
          height: 20px;
          background: #ef4444;
          color: #fff;
          border: none;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
          padding: 0;
          z-index: 10;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
        }

        .cat-item:hover .cat-delete-btn {
          opacity: 1;
        }

        .cat-delete-btn:hover {
          transform: scale(1.1);
          background: #dc2626;
        }

        .cat-name {
          margin-top: 10px;
          font-size: clamp(11px, 1.4vw, 13px);
          font-weight: 600;
          color: #374151;
          text-align: center;
          text-transform: capitalize;
          width: clamp(72px, 13vw, 110px);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }

        .cat-item:hover .cat-name {
          color: #111827;
        }

        .cat-empty {
          width: 100%;
          padding: 30px 0;
          text-align: center;
          color: #9ca3af;
          font-style: italic;
          font-size: 13px;
        }

        @media (max-width: 360px) {
          .cat-img-wrap {
            width: 56px;
            height: 56px;
            border-radius: 8px;
          }

          .cat-name {
            font-size: 10px;
            margin-top: 8px;
          }

          .cat-controls {
            gap: 4px;
          }

          .cat-nav-btn {
            width: 28px;
            height: 28px;
            border-radius: 5px;
          }

          .cat-add-label {
            width: 28px;
            height: 28px;
            border-radius: 5px;
          }
        }

        @media (min-width: 1920px) {
          .cat-img-wrap {
            width: 120px;
            height: 120px;
            border-radius: 20px;
          }

          .cat-name {
            font-size: 14px;
            margin-top: 12px;
          }
        }
      `}</style>

      <section className="cat-section">
        <div className="cat-inner">
          <div className="cat-header">
            <h2 className="cat-title">Product Categories</h2>

            <div className="cat-controls">
              {isAdmin && (
                <div className="cat-admin-divider">
                  <label className="cat-add-label" title="Add category">
                    <Plus size={15} />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAdd}
                    />
                  </label>
                </div>
              )}

              <button
                className="cat-nav-btn cat-nav-btn-left"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                className="cat-nav-btn cat-nav-btn-right"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="cat-scroll-wrap">
            {chunkedCategories.length > 0 ? (
              chunkedCategories.map((pair, colIndex) => (
                <div key={colIndex} className="cat-col">
                  {pair.map((cat) => (
                    <div key={cat._id} className="cat-item">
                      <Link
                        to={`/category/${cat.name.toLowerCase()}`}
                        style={{ display: "block" }}
                      >
                        <div className="cat-img-wrap">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="cat-img"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/150?text=Food";
                            }}
                          />
                        </div>
                      </Link>

                      {isAdmin && (
                        <button
                          className="cat-delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cat._id);
                          }}
                          title="Delete category"
                          aria-label={`Delete ${cat.name}`}
                        >
                          <X size={10} />
                        </button>
                      )}

                      <h3 className="cat-name">{cat.name}</h3>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="cat-empty">No categories added yet.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CategorySection;
