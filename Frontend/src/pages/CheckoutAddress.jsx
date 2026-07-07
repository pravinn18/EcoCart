import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, CheckCircle } from "lucide-react";

const CheckoutAddress = () => {
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState([]);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedAddresses") || "[]");

    setSavedAddresses(saved);

    if (saved.length > 0) {
      setForm(saved[0]);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSelectAddress = (address) => {
    setForm(address);
  };

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone))
      newErrors.phone = "Enter a valid 10-digit phone number";

    if (!form.addressLine1.trim())
      newErrors.addressLine1 = "Address is required";

    if (!form.city.trim()) newErrors.city = "City is required";

    if (!form.state.trim()) newErrors.state = "State is required";

    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode))
      newErrors.pincode = "Enter a valid 6-digit pincode";

    return newErrors;
  };

  const saveAddress = () => {
    const existing = JSON.parse(localStorage.getItem("savedAddresses") || "[]");

    const filtered = existing.filter(
      (a) =>
        !(
          a.addressLine1 === form.addressLine1 &&
          a.phone === form.phone &&
          a.pincode === form.pincode
        ),
    );

    const updated = [form, ...filtered];

    localStorage.setItem("savedAddresses", JSON.stringify(updated));

    setSavedAddresses(updated);
  };

  const handleSubmit = () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveAddress();

    sessionStorage.setItem("checkoutAddress", JSON.stringify(form));

    navigate("/checkout/payment");
  };

  const handleNewAddress = () => {
    setForm({
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  return (
    <div className="bg-[#F9F9F9] min-h-screen py-12 pt-32">
      <div className="max-w-2xl mx-auto px-6">
       
        <div className="flex justify-center items-center space-x-4 mb-12 text-[11px] font-bold uppercase tracking-widest">
          <span className="text-gray-400">01 Cart</span>

          <div className="h-[1px] w-12 bg-gray-200" />

          <span className="text-[#C28E77]">02 Delivery</span>

          <div className="h-[1px] w-12 bg-gray-200" />

          <span className="text-gray-400">03 Payment</span>
        </div>

        {savedAddresses.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1A302B]">
                Saved Addresses
              </h3>

              <button
                onClick={handleNewAddress}
                className="text-[10px] font-bold uppercase tracking-widest text-[#C28E77] hover:text-black transition-colors"
              >
                + New Address
              </button>
            </div>

            <div className="space-y-3">
              {savedAddresses.map((address, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectAddress(address)}
                  className="w-full text-left border border-gray-100 hover:border-[#C28E77] rounded-xl p-4 transition-all bg-[#F9F9F9] hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1A302B]">
                        {address.fullName}
                      </p>

                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`},{" "}
                        {address.city}, {address.state} - {address.pincode}
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        {address.phone}
                      </p>
                    </div>

                    <CheckCircle
                      size={18}
                      className="text-[#C28E77] shrink-0"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
         
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-[#1A302B] flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#1A302B]">
                Delivery Address
              </h2>

              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                Where should we deliver?
              </p>
            </div>
          </div>

          
          <div className="space-y-5">
           
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="off"
                className={`w-full bg-[#F9F9F9] border rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors ${
                  errors.fullName ? "border-red-400" : "border-gray-200"
                }`}
              />

              {errors.fullName && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                autoComplete="off"
                className={`w-full bg-[#F9F9F9] border rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors ${
                  errors.phone ? "border-red-400" : "border-gray-200"
                }`}
              />

              {errors.phone && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">
                  {errors.phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Address Line 1
              </label>

              <input
                type="text"
                name="addressLine1"
                value={form.addressLine1}
                onChange={handleChange}
                placeholder="House no., Street name"
                autoComplete="off"
                className={`w-full bg-[#F9F9F9] border rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors ${
                  errors.addressLine1 ? "border-red-400" : "border-gray-200"
                }`}
              />

              {errors.addressLine1 && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">
                  {errors.addressLine1}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Address Line 2 (Optional)
              </label>

              <input
                type="text"
                name="addressLine2"
                value={form.addressLine2}
                onChange={handleChange}
                placeholder="Landmark, Area"
                autoComplete="off"
                className="w-full bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Chennai"
                  autoComplete="off"
                  className={`w-full bg-[#F9F9F9] border rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors ${
                    errors.city ? "border-red-400" : "border-gray-200"
                  }`}
                />

                {errors.city && (
                  <p className="text-red-400 text-[10px] mt-1 font-medium">
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Tamil Nadu"
                  autoComplete="off"
                  className={`w-full bg-[#F9F9F9] border rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors ${
                    errors.state ? "border-red-400" : "border-gray-200"
                  }`}
                />

                {errors.state && (
                  <p className="text-red-400 text-[10px] mt-1 font-medium">
                    {errors.state}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                Pincode
              </label>

              <input
                type="text"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit pincode"
                autoComplete="off"
                className={`w-full bg-[#F9F9F9] border rounded-xl px-4 py-3 text-sm text-black placeholder-gray-300 focus:outline-none focus:border-[#1A302B] transition-colors ${
                  errors.pincode ? "border-red-400" : "border-gray-200"
                }`}
              />

              {errors.pincode && (
                <p className="text-red-400 text-[10px] mt-1 font-medium">
                  {errors.pincode}
                </p>
              )}
            </div>
          </div>

         
          <button
            onClick={handleSubmit}
            className="w-full mt-8 bg-[#1A302B] text-white py-5 rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#1a302b1c]"
          >
            Continue to Payment
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutAddress;
