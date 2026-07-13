import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import {
  Crown,
  Flame,
  Lock,
  Truck,
  Percent,
  Check,
  Sparkles,
  Shield,
  Zap,
  Star,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";

const MAX_CYCLES = 4;

const PlusPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activateMsg, setActivateMsg] = useState("");

  useEffect(() => {
    const prev = {
      bg: document.body.style.background,
      overflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
    };
    document.body.style.background = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    // Remove any injected <style> tag left by the old page
    document.querySelectorAll("style").forEach((el) => {
      if (
        el.textContent.includes("#080810") ||
        el.textContent.includes("plus-root")
      ) {
        el.remove();
      }
    });
    return () => {
      document.body.style.background = prev.bg;
      document.body.style.overflow = prev.overflow;
      document.documentElement.style.overflow = prev.htmlOverflow;
    };
  }, []);

 useEffect(() => {
   fetchUser();

   const interval = setInterval(() => fetchUser(), 10000);

   return () => clearInterval(interval);
 }, []);

  const fetchUser = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const { data } = await axios.get("/api/users/profile");
      setUserData(data);
      const stored = JSON.parse(localStorage.getItem("userInfo") || "{}");
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          ...stored,
          isPlusMember: data.isPlusMember,
          isNewUser: data.isNewUser,
          streakCount: data.streakCount,
          loyaltyPoints: data.loyaltyPoints,
          plusExpiryDate: data.plusExpiryDate,
          lastStreakRewardDate: data.lastStreakRewardDate,
        }),
      );
    } catch (err) {
      console.error("Fetch user error:", err);

      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  };

  const handleActivatePlus = async () => {
    try {
      setProcessing(true);
      setActivateMsg("");
     await axios.post("/api/users/activate-plus");
      setActivateMsg("🎉 Plus activated! Welcome to EcoCart Plus.");
      await fetchUser();
    } catch (err) {
      setActivateMsg(
        err.response?.data?.message || "Activation failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (!loaded)
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center pt-28">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );

  const streak = Number(userData?.streakCount || 0);
  const points = Number(userData?.loyaltyPoints || 0);
  const isPlus = Boolean(userData?.isPlusMember);
  const expiry = userData?.plusExpiryDate ?? null;
  const lastReward = userData?.lastStreakRewardDate ?? null;
  const progress = Math.min(streak, MAX_CYCLES) / MAX_CYCLES;
  const eligible = streak >= MAX_CYCLES && !isPlus;

  const getStreakStatus = () => {
    if (streak === 0) return "Place a ₹500+ order to start your first cycle";
    if (streak >= MAX_CYCLES) return "All cycles complete — activate Plus now!";
    const last = lastReward ? new Date(lastReward) : null;
    if (!last) return "Cycle started — keep ordering!";
    const nextUnlockDate = new Date(last.getTime() + 14 * 24 * 60 * 60 * 1000);
    const diff = Math.ceil((nextUnlockDate.getTime() - Date.now()) / 86400000);
    return diff > 0
      ? `Next cycle unlocks in ${diff} day${diff !== 1 ? "s" : ""}`
      : "Ready for next cycle — place a ₹500+ order!";
  };

  const benefits = [
    {
      icon: Truck,
      label: "Free Delivery",
      desc: "Zero delivery fee on every order — no minimum cart value.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      activeBorder: "border-emerald-200",
    },
    {
      icon: Percent,
      label: "5% Extra Discount",
      desc: "5% stacked on top of all existing discounts. Max 30% total.",
      color: "text-amber-600",
      bg: "bg-amber-50",
      activeBorder: "border-amber-200",
    },
    {
      icon: Zap,
      label: "Early Access",
      desc: "First access to new products, limited offers and seasonal sales.",
      color: "text-amber-600",
      bg: "bg-amber-50",
      activeBorder: "border-amber-200",
    },
    {
      icon: Shield,
      label: "2× Loyalty Points",
      desc: "Earn double loyalty points on every purchase as a Plus member.",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      activeBorder: "border-emerald-200",
    },
  ];

  return (
    <div className="bg-[#F9F9F9] min-h-screen pt-24 sm:pt-28 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
     
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A302B] transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
          <button
            onClick={() => fetchUser(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#1A302B] transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 mb-4">
            <Crown size={13} className="text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
              {isPlus ? "Active Member" : "Membership"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A302B] tracking-tight">
            EcoCart <span className="text-amber-500">Plus</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {isPlus
              ? "You have access to all premium benefits"
              : "Earn loyalty through shopping to unlock premium benefits"}
          </p>
        </div>

        <div
          className={`bg-white rounded-2xl border ${isPlus ? "border-amber-200" : "border-gray-100"} shadow-sm p-6 mb-4`}
        >
        
          <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Loyalty Points
              </p>
              <p
                className={`text-5xl font-bold tracking-tight ${isPlus ? "text-amber-500" : "text-[#1A302B]"}`}
              >
                {points.toLocaleString()}
              </p>
            </div>
            {isPlus && expiry && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                  Expires
                </p>
                <p className="text-sm font-semibold text-amber-600">
                  {new Date(expiry).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

     
          <div className="bg-[#F9F9F9] border border-gray-100 rounded-xl p-3.5 flex items-center gap-3 mb-5 flex-wrap">
            <Flame
              size={18}
              className="text-orange-400 fill-orange-400 flex-shrink-0"
            />
            <div className="flex-1 min-w-40">
              <p className="font-bold text-sm text-[#1A302B]">
                {Math.min(streak, MAX_CYCLES)} / {MAX_CYCLES} Cycles
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {getStreakStatus()}
              </p>
            </div>
            <span className="text-[11px] text-gray-300 font-semibold whitespace-nowrap">
              ₹500+ · 14 days
            </span>
          </div>

          
          {!isPlus && (
            <>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                <span>Progress to Plus</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between px-0.5 mb-2">
                {Array.from({ length: MAX_CYCLES }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                        i < streak
                          ? "bg-amber-400 border-amber-400 shadow-sm shadow-amber-200"
                          : "bg-white border-gray-200"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-bold ${i < streak ? "text-amber-500" : "text-gray-300"}`}
                    >
                      C{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {!isPlus && (
            <div className="mt-4">
              {eligible ? (
                <>
                  <button
                    onClick={handleActivatePlus}
                    disabled={processing}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-4 transition-colors flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Activating...
                      </>
                    ) : (
                      "✦ Activate Plus Now — Free"
                    )}
                  </button>
                  {activateMsg && (
                    <p
                      className={`text-center text-sm mt-3 font-semibold ${activateMsg.startsWith("🎉") ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {activateMsg}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Lock size={13} />
                  {MAX_CYCLES - Math.min(streak, MAX_CYCLES)} more cycle
                  {MAX_CYCLES - Math.min(streak, MAX_CYCLES) !== 1
                    ? "s"
                    : ""}{" "}
                  needed to unlock Plus
                </div>
              )}
            </div>
          )}

          {isPlus && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mt-2">
              <Check size={14} className="text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
                Plus Active — All benefits unlocked
              </span>
            </div>
          )}
        </div>

        {!isPlus && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={15} className="text-amber-500" />
              <h2 className="text-base font-bold text-[#1A302B]">
                How to earn Plus
              </h2>
            </div>
            {[
              { num: "01", text: "Place an order of ₹500 or more" },
              { num: "02", text: "Repeat every 14 days for the next cycle" },
              { num: "03", text: "Complete all 4 cycles (≈ 8 weeks)" },
              {
                num: "04",
                text: "Click Activate — Plus is yours for 90 days 🎉",
              },
            ].map(({ num, text }) => (
              <div key={num} className="flex items-start gap-3 mb-3 last:mb-0">
                <span className="text-[10px] font-bold text-amber-400 tracking-widest w-5 flex-shrink-0 pt-0.5">
                  {num}
                </span>
                <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <h2 className="text-base font-bold text-[#1A302B]">
              {isPlus ? "Your Active Benefits" : "What Plus unlocks"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map(
              ({ icon: Icon, label, desc, color, bg, activeBorder }) => (
                <div
                  key={label}
                  className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                    isPlus ? `${activeBorder}` : "border-gray-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${isPlus ? bg : "bg-gray-50"} flex items-center justify-center mb-3`}
                  >
                    <Icon
                      size={18}
                      className={isPlus ? color : "text-gray-300"}
                    />
                  </div>
                  <p className="font-bold text-sm text-[#1A302B] mb-1">
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {desc}
                  </p>
                  {isPlus && (
                    <div
                      className={`flex items-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest ${color}`}
                    >
                      <Check size={10} /> Active
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-300 leading-relaxed">
          Plus is earned through loyalty — not purchased.
          <br />
          Complete 4 cycles of ₹500+ orders to qualify.
        </p>
      </div>
    </div>
  );
};

export default PlusPage;
