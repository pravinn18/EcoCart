import React, { useState, useEffect } from "react";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Trash2, Zap } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const isAdmin = userInfo?.isAdmin === true;

  const fetchSlides = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/ads`);
      if (data && data.length > 0) {
        setSlides(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [currentIndex, slides.length]);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleAdd = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title =
      prompt("Enter Main Title (e.g. FRESHNESS DELIVERED):") ||
      "FRESHNESS DELIVERED";

    const subtitle =
      prompt("Enter Subtitle (e.g. Premium quality, unbeatable prices):") || "";

    const promotionText =
      prompt(
        "Enter Offer / Description (e.g. Save up to 70% on nearly expiring essentials. Limited time only!):",
      ) || "";

    const buttonText =
      prompt(
        "Enter Button Text (e.g. Shop Fruits, Buy Dairy, Explore Deals):",
      ) || "Shop Now";

    const link =
      prompt(
        "Enter Shop Now link:\nExamples:\n/category/fruits\n/category/dairy\n/product/abc123\nLeave blank for Home.",
      ) || "/";

    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("subtitle", subtitle);
    formData.append("promotionText", promotionText);
    formData.append("buttonText", buttonText);
    formData.append("link", link);

    try {
      await axios.post(`${BASE_URL}/api/ads`, formData);
      fetchSlides();
      alert("Banner added successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to add banner.");
    }

    e.target.value = "";
  };

  const deleteSlide = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/ads/${id}`);
      setCurrentIndex(0);
      fetchSlides();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleShopNow = () => {
    const link = currentSlide?.link;
    if (!link || link.trim() === "" || link.trim() === "/") {
      navigate("/");
    } else if (link.startsWith("http://") || link.startsWith("https://")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      navigate(link.trim());
    }
  };

  if (slides.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "16/4.5",
          minHeight: 140,
          maxHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111827",
          color: "#fff",
          borderRadius: "1.5rem",
          border: "2px dashed #374151",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Zap
            style={{
              margin: "0 auto 12px",
              color: "#22c55e",
              display: "block",
            }}
            size={32}
          />
          <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 12 }}>
            No active banners in database.
          </p>
          {isAdmin && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#16a34a",
                color: "#fff",
                padding: "8px 20px",
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Plus size={16} /> Add Hero Banner
              <input type="file" hidden onChange={handleAdd} accept="image/*" />
            </label>
          )}
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <>
      <style>{`
        /* ════════════════════════════════════════════════
           ROOT — Reduced vertical height footprint (16:4.5)
           Gives an ultra-premium, cinematic banner look.
        ════════════════════════════════════════════════ */
        .adslider-root {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 4.5;
          min-height: 140px;
          max-height: 420px;
          overflow: hidden;
          background: #000;
          border-radius: 1.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        /* ── BACKGROUND IMAGE ── */
        .adslider-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 8000ms ease-out;
        }
        .adslider-root:hover .adslider-img {
          transform: scale(1.06);
        }

        /* ── GRADIENT OVERLAY — Subtle fade ── */
        .adslider-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.85) 0%,
            rgba(0,0,0,0.40) 60%,
            transparent 100%
          );
          z-index: 1;
        }

        /* ── TEXT CONTENT — Balanced vertical spacing ── */
        .adslider-content {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          padding: 0 clamp(20px, 6%, 80px);
          z-index: 2;
        }

        .adslider-text-block {
          color: #fff;
          max-width: 55%;
        }

        /* ── BIG ITALIC GREEN TITLE ── */
        .adslider-title {
          font-size: clamp(18px, 4.8vw, 64px);
          font-weight: 900;
          text-transform: uppercase;
          font-style: italic;
          letter-spacing: -0.02em;
          color: #22c55e;
          line-height: 0.95;
          margin: 0 0 clamp(4px, 0.5vw, 8px);
          text-shadow: 0 4px 16px rgba(0,0,0,0.5);
        }

        /* ── LUXURY SILVER SUBTITLE ── */
        .adslider-subtitle {
          font-size: clamp(12px, 1.8vw, 22px);
          background: linear-gradient(to right, #F3F4F6, #D1D5DB, #9CA3AF);
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent;
          font-weight: 600;
          letter-spacing: 0.01em;
          margin: 0 0 clamp(2px, 0.4vw, 6px);
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        /* ── LUXURY PURPLE PROMOTION TEXT ── */
        .adslider-promo {
          font-size: clamp(10px, 1.2vw, 15px);
          background: linear-gradient(135deg, #B87333 0%, #E0A96D 25%, #C58B58 50%, #E8BA8A 75%, #8B4513 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 400;
          margin: 0 0 clamp(8px, 1.4vw, 18px);
          line-height: 1.4;
          max-width: 100%;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        }

        /* ── PREMIUM SHOP NOW BUTTON ── */
        .adslider-btn {
          display: inline-block;
       background:  #D92332
          color: #fff;
          padding: clamp(5px, 0.8vw, 10px) clamp(16px, 2.2vw, 32px);
          border-radius: 9999px;
          font-weight: 800;
          font-size: clamp(10px, 1.1vw, 15px);
          letter-spacing: 0.03em;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 6px 20px rgba(217, 35, 50, 0.3);
          white-space: nowrap;
        }
        .adslider-btn:hover { background: #141414; transform: scale(1.03); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
        .adslider-btn:active { transform: scale(0.97); }

        /* ── NAV ARROWS ── */
        .adslider-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          padding: clamp(4px, 0.7vw, 10px);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border-radius: 9999px;
          color: #fff;
          border: none;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
          opacity: 0;
        }
        .adslider-root:hover .adslider-nav { opacity: 1; }
        .adslider-nav:hover { background: rgba(255,255,255,0.28); }
        .adslider-nav-left  { left:  clamp(8px, 1vw, 16px); }
        .adslider-nav-right { right: clamp(8px, 1vw, 16px); }

        /* ── ADMIN TOOLBAR ── */
        .adslider-admin-bar {
          position: absolute;
          top:   clamp(6px, 1vw, 12px);
          right: clamp(6px, 1vw, 12px);
          display: flex;
          align-items: center;
          gap: clamp(4px, 0.6vw, 8px);
          z-index: 20;
        }
        .adslider-admin-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(5px, 0.7vw, 9px);
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: transform 0.15s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .adslider-admin-icon:hover { transform: scale(1.08); }

        /* ── DOT INDICATORS ── */
        .adslider-dots {
          position: absolute;
          bottom: clamp(6px, 1vw, 14px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: clamp(4px, 0.6vw, 8px);
          z-index: 10;
          align-items: center;
        }
        .adslider-dot {
          height: clamp(3px, 0.5vw, 6px);
          border-radius: 9999px;
          background: rgba(255,255,255,0.3);
          border: none;
          cursor: pointer;
          transition: all 0.6s ease;
          padding: 0;
        }
        .adslider-dot-active {
          width: clamp(16px, 2.8vw, 32px);
          background: #22c55e;
          box-shadow: 0 0 10px rgba(34,197,94,0.6);
        }
        .adslider-dot-inactive {
          width: clamp(3px, 0.5vw, 6px);
        }
        .adslider-dot-inactive:hover { background: rgba(255,255,255,0.55); }

        /* ── TOUCH / MOBILE ── */
        @media (max-width: 600px) {
          .adslider-nav { opacity: 0.55; }
          .adslider-text-block { max-width: 70%; }
          .adslider-root { border-radius: 1rem; }
        }
      `}</style>

      <div className="adslider-root">
        <img
          className="adslider-img"
          src={currentSlide.image}
          alt={currentSlide.title}
        />

        <div className="adslider-overlay" />

        <div className="adslider-content">
          <div className="adslider-text-block">
            <h1 className="adslider-title">{currentSlide.title}</h1>

            {currentSlide.subtitle && (
              <p className="adslider-subtitle">{currentSlide.subtitle}</p>
            )}

            {currentSlide.promotionText && (
              <p className="adslider-promo">{currentSlide.promotionText}</p>
            )}

            <button className="adslider-btn" onClick={handleShopNow}>
              {currentSlide.buttonText || "Shop Now"}
            </button>
          </div>
        </div>

        <button
          className="adslider-nav adslider-nav-left"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="adslider-nav adslider-nav-right"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>

        {isAdmin && (
          <div className="adslider-admin-bar">
            <label
              className="adslider-admin-icon"
              style={{ background: "#16a34a" }}
              title="Add new banner"
            >
              <Plus size={16} color="#fff" />
              <input type="file" hidden accept="image/*" onChange={handleAdd} />
            </label>
            <button
              className="adslider-admin-icon"
              style={{ background: "#dc2626" }}
              title="Delete current banner"
              onClick={() => deleteSlide(currentSlide._id)}
            >
              <Trash2 size={16} color="#fff" />
            </button>
          </div>
        )}

        <div className="adslider-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`adslider-dot ${
                i === currentIndex
                  ? "adslider-dot-active"
                  : "adslider-dot-inactive"
              }`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AdSlider;
