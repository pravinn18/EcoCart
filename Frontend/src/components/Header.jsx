import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaSearch, FaUser } from "react-icons/fa";
import {
  Menu,
  X,
  Package,
  LogOut,
  ChevronRight,
  Home,
  Crown,
  Settings,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const Header = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    setUserInfo(user);
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(search.trim())}`,
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    window.location.href = "/login";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSuggestionClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setSearch("");
    setShowSuggestions(false);
    navigate(`/product/${product._id}`);
  };

  
  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const bottomNavItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/orders", label: "Orders", icon: Package },
    { to: "/plus", label: "Plus", icon: Crown },
    userInfo?.isAdmin
      ? { to: "/admin", label: "Admin", icon: Settings }
      : { to: "/cart", label: "Cart", icon: FaShoppingCart, badge: itemCount },
    { to: "/profile", label: "Profile", icon: FaUser },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-[9999] bg-white text-gray-800 border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-5 font-sans shadow-sm tracking-wide"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/">
              <img
                src="./Logo.png"
                alt="EcoCart"
                className="h-12 object-contain"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium text-gray-500">
              <Link
                to="/"
                className="hover:text-[#b87e5b] transition-colors duration-300"
              >
                Home
              </Link>
              <Link
                to="/orders"
                className="hover:text-[#b87e5b] transition-colors duration-300"
              >
                Orders
              </Link>
              {userInfo?.isAdmin && (
                <Link
                  to="/admin"
                  className="hover:text-[#b87e5b] transition-colors duration-300"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/plus"
                className="flex items-center gap-1.5 text-amber-600 hover:text-amber-500 transition-colors duration-300 font-bold"
              >
                <Crown size={12} className="fill-amber-500" />
                ECOCART Plus
              </Link>
            </nav>
          </div>

          <div
            className="flex-1 flex justify-center px-6 relative"
            ref={searchRef}
          >
            <div className="w-full max-w-sm">
              <form onSubmit={handleSearch}>
                <div className="flex items-center border-b border-gray-300 focus-within:border-[#2a4b3c] transition-colors duration-300 pb-1.5">
                  <FaSearch className="text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search collections..."
                    className="bg-transparent outline-none ml-3 w-full text-sm placeholder-gray-400 text-gray-800 font-light"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() =>
                      suggestions.length > 0 && setShowSuggestions(true)
                    }
                  />
                </div>
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-2xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product) => (
                    <button
                      key={product._id}
                      onMouseDown={(e) => handleSuggestionClick(e, product)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={
                            product.image?.startsWith("http")
                              ? product.image
                              : `src={product.image}`
                          }
                          alt={product.name}
                          className="object-contain h-full w-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#b87e5b] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          ₹
                          {(
                            product.discountPrice || product.price
                          )?.toLocaleString("en-IN")}
                          {product.category && (
                            <span className="ml-2 text-gray-300">
                              · {product.category}
                            </span>
                          )}
                        </p>
                      </div>
                      <ChevronRight
                        size={13}
                        className="text-gray-300 group-hover:text-[#b87e5b] flex-shrink-0"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-7 text-lg relative text-gray-600">
            <Link
              to="/wishlist"
              className="relative hover:text-[#b87e5b] transition-colors duration-300"
            >
              <FaHeart className={wishlist.length > 0 ? "text-red-500" : ""} />
              {wishlist.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative group">
              <FaShoppingCart className="cursor-pointer group-hover:text-[#b87e5b] transition-colors duration-300" />
              {itemCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-[#b87e5b] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center hover:text-[#b87e5b] transition-colors duration-300 focus:outline-none"
              >
                <FaUser className="cursor-pointer" />
              </button>

              {isMenuOpen && (
                <div className="absolute top-12 right-0 w-52 bg-white border border-gray-100 shadow-xl py-2 z-50 rounded-2xl">
                  {userInfo ? (
                    <div className="flex flex-col">
                      <div className="px-5 py-3 border-b border-gray-50">
                        <span className="text-[11px] font-bold text-[#1A302B] uppercase tracking-widest block truncate">
                          {userInfo.name}
                        </span>
                        <span className="text-[10px] text-gray-300 truncate block">
                          {userInfo.email}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-5 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#b87e5b] transition-all flex items-center gap-2.5"
                      >
                        <FaUser size={11} />
                        Profile
                      </Link>

                      <button
                        onClick={logoutHandler}
                        className="text-left w-full px-5 py-3.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-all flex items-center gap-2.5 border-t border-gray-50"
                      >
                        <LogOut size={13} />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-5 py-3 text-sm font-light text-gray-600 hover:bg-gray-50 hover:text-[#b87e5b] transition-all block"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="px-5 py-3 text-sm font-light text-gray-600 hover:bg-gray-50 hover:text-[#b87e5b] transition-all block"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex sm:hidden items-center justify-between gap-2">
          <Link to="/" className="flex-shrink-0">
            <img
              src="./Logo.png"
              alt="EcoCart"
              className="h-8 xs:h-9 object-contain"
            />
          </Link>
          <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
            <div className="relative flex-1 min-w-0" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-gray-200 rounded-full bg-gray-50 px-3 py-2"
              >
                <FaSearch className="text-gray-400 text-xs flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none ml-2 w-full min-w-0 text-base text-gray-800 placeholder-gray-400"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() =>
                    suggestions.length > 0 && setShowSuggestions(true)
                  }
                />
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
                  {suggestions.map((product) => (
                    <button
                      key={product._id}
                      onMouseDown={(e) => handleSuggestionClick(e, product)}
                      className="w-full flex items-center gap-2 px-3 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                    >
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center p-1 flex-shrink-0">
                        <img
                          src={
                            product.image?.startsWith("http")
                              ? product.image
                              : `src={product.image}`
                          }
                          alt={product.name}
                          className="object-contain h-full w-full"
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {product.name}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="text-gray-600 hover:text-[#b87e5b] transition-colors p-2 flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-100 shadow-lg absolute left-0 right-0 top-full max-h-[85vh] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {userInfo && (
                <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#1A302B] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A302B] truncate">
                      {userInfo.name}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
              )}
              {[
                { to: "/", label: "Home", icon: Home },
                { to: "/orders", label: "My Orders", icon: Package },
                {
                  to: "/wishlist",
                  label: "Wishlist",
                  icon: FaHeart,
                  badge: wishlist.length,
                  badgeColor: "bg-red-500",
                },
                {
                  to: "/cart",
                  label: "Cart",
                  icon: FaShoppingCart,
                  badge: itemCount,
                  badgeColor: "bg-[#b87e5b]",
                },
                { to: "/profile", label: "Profile", icon: FaUser },
              ].map(({ to, label, icon: Icon, badge, badgeColor }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#b87e5b] rounded-xl transition-all"
                >
                  <Icon size={15} className="text-gray-400 flex-shrink-0" />
                  {label}
                  {badge > 0 && (
                    <span
                      className={`ml-auto ${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
              <Link
                to="/plus"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm text-amber-600 hover:bg-amber-50 rounded-xl transition-all font-semibold"
              >
                <Crown size={15} className="fill-amber-500 flex-shrink-0" />
                Plus Membership
              </Link>
              {userInfo?.isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <Link
                    to="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#b87e5b] rounded-xl transition-all"
                  >
                    Admin Panel
                  </Link>
                </>
              )}
              <div className="border-t border-gray-100 pt-2 mt-2">
                {userInfo ? (
                  <button
                    onClick={logoutHandler}
                    className="flex items-center gap-3 w-full px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm text-[#1A302B] font-semibold hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

  
      <nav
        className="sm:hidden fixed bottom-0 left-0 w-full z-[9999] bg-white border-t border-gray-100 flex items-stretch justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
      >
        {bottomNavItems.map((item) => {
          const active = isActive(item.to);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-w-0"
            >
              <span className="relative">
                <ItemIcon
                  size={20}
                  className={active ? "text-[#C28E77]" : "text-[#1A302B]/50"}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#C28E77] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-[#C28E77] font-semibold" : "text-[#1A302B]/50"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="w-4 h-0.5 rounded-full bg-[#C28E77]" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Header;
