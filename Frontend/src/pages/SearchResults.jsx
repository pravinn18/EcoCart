import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "../config/axios";
import { Loader2, SearchX, ChevronDown } from "lucide-react";
import ProductCard from "../components/ProductCard";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getInitialFilters = () => {
  try {
    return JSON.parse(localStorage.getItem("searchFilters")) || {};
  } catch {
    return {};
  }
};

// Accordion section — isolated state so toggling one doesn't rerender siblings
const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex justify-between items-center py-3 text-sm font-semibold text-[#1A302B] focus:outline-none"
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
};

const PRICE_OPTIONS = [
  { label: "Under ₹50", value: "0-50" },
  { label: "Under ₹100", value: "0-100" },
  { label: "Under ₹200", value: "0-200" },
  { label: "₹300 & above", value: "300+" },
];

const DISCOUNT_OPTIONS = [
  { label: "10% and above", value: 10 },
  { label: "20% and above", value: 20 },
  { label: "30% and above", value: 30 },
];

const AVAILABILITY_OPTIONS = [
  { label: "In Stock", value: "instock" },
  { label: "Low Stock", value: "lowstock" },
  { label: "Out of Stock", value: "outofstock" },
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const savedFilters = getInitialFilters();

  const [allResults, setAllResults] = useState([]); // base pool from API (no client filters)
  const [results, setResults] = useState([]); // filtered + sorted view
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [sort, setSort] = useState(savedFilters.sort || "");
  const [brands, setBrands] = useState(savedFilters.brands || []);
  const [discounts, setDiscounts] = useState(savedFilters.discounts || []);
  const [availability, setAvailability] = useState(
    savedFilters.availability || [],
  );
  const [priceRanges, setPriceRanges] = useState(
    savedFilters.priceRanges || [],
  );

  // Dynamic brands derived from search-pool — reflect the actual query context
  const [availableBrands, setAvailableBrands] = useState([]);

  // Step 1: fetch base pool whenever query changes (no client filters sent)
  useEffect(() => {
    if (!query.trim()) {
      setAllResults([]);
      setAvailableBrands([]);
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const fetchBase = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/products/search`, {
          params: { q: query },
        });
        setAllResults(data);
        const unique = [
          ...new Set(data.map((p) => p.brand).filter(Boolean)),
        ].sort();
        setAvailableBrands(unique);
      } catch {
        setAllResults([]);
        setAvailableBrands([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBase();
    window.scrollTo(0, 0);
  }, [query]);

  // Step 2: apply all client-side filters whenever pool or filters change
  // This avoids a full API round-trip per checkbox tick = no rerender flicker
  useEffect(() => {
    let filtered = [...allResults];

    // Brand
    if (brands.length > 0) {
      filtered = filtered.filter((p) =>
        brands.some((b) => p.brand?.toLowerCase() === b.toLowerCase()),
      );
    }

    // Availability — OR logic: keep if matches ANY selected
    if (availability.length > 0) {
      filtered = filtered.filter((p) => {
        if (availability.includes("instock") && p.stock > 10) return true;
        if (availability.includes("lowstock") && p.stock > 0 && p.stock <= 10)
          return true;
        if (availability.includes("outofstock") && p.stock === 0) return true;
        return false;
      });
    }

    // Discount — keep if meets ANY selected minimum
    if (discounts.length > 0) {
      filtered = filtered.filter((p) => {
        const pct =
          p.price > 0 ? ((p.price - p.discountPrice) / p.price) * 100 : 0;
        return discounts.some((d) => pct >= d);
      });
    }

    // Price range — keep if falls in ANY selected range
    if (priceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        const price = p.discountPrice ?? p.price;
        return priceRanges.some((range) => {
          if (range === "300+") return price >= 300;
          const [, max] = range.split("-").map(Number);
          return price < max;
        });
      });
    }

    // Sort
    if (sort === "low-high") {
      filtered.sort(
        (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price),
      );
    } else if (sort === "high-low") {
      filtered.sort(
        (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price),
      );
    } else if (sort === "popular") {
      filtered.sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0));
    }

    setResults(filtered);
  }, [allResults, brands, availability, discounts, priceRanges, sort]);

  // Persist filters
  useEffect(() => {
    localStorage.setItem(
      "searchFilters",
      JSON.stringify({ sort, brands, discounts, availability, priceRanges }),
    );
  }, [sort, brands, discounts, availability, priceRanges]);

  const toggleArrayValue = (setter, value) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );

  const handleClearAll = () => {
    setSort("");
    setBrands([]);
    setDiscounts([]);
    setAvailability([]);
    setPriceRanges([]);
  };

  const activeFilterCount =
    brands.length +
    discounts.length +
    availability.length +
    priceRanges.length +
    (sort ? 1 : 0);

  if (loading)
    return (
      <div className="min-h-[70vh] bg-[#F9F9F9] flex flex-col items-center justify-center gap-4 pt-28">
        <Loader2 className="animate-spin text-[#C28E77]" size={40} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Searching...
        </p>
      </div>
    );

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Search Results
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A302B] tracking-tight">
                "{query}"
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {results.length} product{results.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="relative bg-[#1A302B] text-white px-5 py-2 rounded-full text-sm font-medium"
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C28E77] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* FILTER DRAWER */}
        {showFilters && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowFilters(false)}
            />

            <div className="fixed top-20 right-0 h-[calc(100vh-80px)] w-80 bg-white z-[100] flex flex-col shadow-xl">
              {/* Drawer header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-[#1A302B]">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-5 py-1">
                {/* SORT */}
                <FilterSection title="Sort By" defaultOpen>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1A302B]"
                  >
                    <option value="">Relevance</option>
                    <option value="low-high">Price Low → High</option>
                    <option value="high-low">Price High → Low</option>
                    <option value="popular">Popular</option>
                  </select>
                </FilterSection>

                {/* BRAND — only shown when brands exist for this search */}
                {availableBrands.length > 0 && (
                  <FilterSection
                    title={`Brand${brands.length > 0 ? ` (${brands.length})` : ""}`}
                  >
                    <div className="space-y-2.5">
                      {availableBrands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-2.5 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={brands.includes(brand)}
                            onChange={() => toggleArrayValue(setBrands, brand)}
                            className="w-4 h-4 accent-[#1A302B] cursor-pointer"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-[#1A302B]">
                            {brand}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FilterSection>
                )}

                {/* PRICE */}
                <FilterSection
                  title={`Price${priceRanges.length > 0 ? ` (${priceRanges.length})` : ""}`}
                >
                  <div className="space-y-2.5">
                    {PRICE_OPTIONS.map(({ label, value }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={priceRanges.includes(value)}
                          onChange={() =>
                            toggleArrayValue(setPriceRanges, value)
                          }
                          className="w-4 h-4 accent-[#1A302B] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#1A302B]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* AVAILABILITY */}
                <FilterSection
                  title={`Availability${availability.length > 0 ? ` (${availability.length})` : ""}`}
                >
                  <div className="space-y-2.5">
                    {AVAILABILITY_OPTIONS.map(({ label, value }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={availability.includes(value)}
                          onChange={() =>
                            toggleArrayValue(setAvailability, value)
                          }
                          className="w-4 h-4 accent-[#1A302B] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#1A302B]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* DISCOUNT */}
                <FilterSection
                  title={`Discount${discounts.length > 0 ? ` (${discounts.length})` : ""}`}
                >
                  <div className="space-y-2.5">
                    {DISCOUNT_OPTIONS.map(({ label, value }) => (
                      <label
                        key={value}
                        className="flex items-center gap-2.5 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={discounts.includes(value)}
                          onChange={() => toggleArrayValue(setDiscounts, value)}
                          className="w-4 h-4 accent-[#1A302B] cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-[#1A302B]">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Sticky footer */}
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 bg-[#1A302B] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition"
                >
                  Show Results
                </button>
              </div>
            </div>
          </>
        )}
        {/* FILTER DRAWER END */}

        {/* RESULTS */}
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="bg-gray-50 p-8 rounded-full">
              <SearchX size={40} className="text-gray-200" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-gray-700">
                No results found
              </h2>
              <p className="text-gray-400 text-sm">
                {activeFilterCount > 0
                  ? "Try clearing some filters."
                  : "Try a different search term."}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAll}
                  className="border border-[#1A302B] text-[#1A302B] px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#1A302B] hover:text-white transition-all"
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/"
                className="bg-[#1A302B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-black transition-all"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {results.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
