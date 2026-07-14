import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Imported useLocation
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname !== "/") {
    return null;
  }

  const handleScrollToSection = (e, targetId) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  const handleHomeClick = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-[#f5f5f5] border-t border-gray-300 mt-12 sm:mt-16 lg:mt-32 w-full safe-bottom"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-10 lg:py-20 2xl:py-24 select-none">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-5 sm:gap-10 lg:gap-14">
          <div className="col-span-2 sm:col-span-1 lg:col-span-1 space-y-2.5 sm:space-y-4 lg:space-y-6">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#2d2d2d]">
              Eco
              <span className="text-[#C28E77]">Cart</span>
            </h2>

            <p className="text-[11px] sm:text-xs leading-4 sm:leading-6 lg:leading-7 text-gray-600 max-w-sm font-light">
              Premium organic groceries and daily essentials, thoughtfully
              selected for quality, freshness, and sustainable living.
            </p>

            <div className="flex items-center gap-5 sm:gap-6 text-gray-400 pt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-[#C28E77] hover:-translate-y-1 transition duration-300 min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <FaInstagram size={18} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-[#C28E77] hover:-translate-y-1 transition duration-300 min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <FaFacebookF size={16} />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="hover:text-[#C28E77] hover:-translate-y-1 transition duration-300 min-w-[24px] min-h-[24px] flex items-center justify-center"
              >
                <FaTwitter size={16} />
              </a>
            </div>
          </div>

          <div className="col-span-1 space-y-2.5 sm:space-y-4">
            <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#1a1a1a] font-semibold mb-2.5 sm:mb-4 lg:mb-7">
              Collections
            </h4>

            <div className="flex flex-col gap-2.5 sm:gap-4 lg:gap-5 text-[11px] sm:text-sm text-gray-600 font-light">
              <a
                href="/"
                onClick={handleHomeClick}
                className="hover:text-[#1a1a1a] transition duration-300 py-1 sm:py-0 cursor-pointer"
              >
                Home
              </a>

              <a
                href="#product-categories"
                onClick={(e) => handleScrollToSection(e, "product-categories")}
                className="hover:text-[#1a1a1a] transition duration-300 py-1 sm:py-0 cursor-pointer"
              >
                Categories
              </a>

              <Link
                to="/profile"
                className="hover:text-[#1a1a1a] transition duration-300 py-1 sm:py-0"
              >
                Profile
              </Link>
            </div>
          </div>

          <div className="col-span-1 sm:col-span-2 lg:col-span-1 space-y-2.5 sm:space-y-4">
            <h4 className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#1a1a1a] font-semibold mb-2.5 sm:mb-4 lg:mb-7">
              Contact
            </h4>

            <div className="flex flex-col gap-2.5 sm:gap-4 lg:gap-6 text-[11px] sm:text-sm text-gray-600 font-light">
              <div className="flex items-start gap-2 sm:gap-3 py-1 sm:py-0">
                <MapPin
                  size={14}
                  className="text-[#C28E77] mt-0.5 flex-shrink-0 sm:!w-4 sm:!h-4"
                />
                <span>Tamil Nadu, India</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 py-1 sm:py-0">
                <Mail
                  size={14}
                  className="text-[#C28E77] flex-shrink-0 sm:!w-4 sm:!h-4"
                />
                <a
                  href="mailto:pravintch1@gmail.com"
                  className="hover:text-[#1a1a1a] transition truncate"
                >
                  pravintch1@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 py-1 sm:py-0">
                <Phone
                  size={14}
                  className="text-[#C28E77] flex-shrink-0 sm:!w-4 sm:!h-4"
                />
                <a
                  href="tel:+919345469229"
                  className="hover:text-[#1a1a1a] transition"
                >
                  +91 93454 69229
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-8 sm:mt-12 lg:mt-16 pt-5 sm:pt-6 lg:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[9px] lg:text-[10px] uppercase tracking-[0.25em] text-gray-500 text-center sm:text-left">
            © {year} EcoCart . Crafted with Excellence.
          </p>

          <div className="flex items-center gap-6 text-[9px] lg:text-[10px] uppercase tracking-[0.25em] text-gray-500">
            <Link
              to="/terms"
              className="hover:text-[#1a1a1a] transition duration-300"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
