import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  ArrowRight,
  Timer,
  Leaf,
  Truck,
  Wallet,
  Sparkles,
} from "lucide-react";

const GREEN = "#123524";
const GREEN_DARK = "#0C2419";
const COPPER = "#C48A4A";
const COPPER_LIGHT = "#D9A25F";

const plusFeatures = [
  "Free delivery",
  "5% extra discount",
  "Early access",
  "2× loyalty points",
];

const outerBenefits = [
  { icon: Timer, label: "10 min delivery" },
  { icon: Leaf, label: "Freshness guaranteed" },
  { icon: Truck, label: "Free delivery" },
  { icon: Wallet, label: "Extra savings" },
  { icon: Sparkles, label: "Exclusive offers" },
];

const BenefitTile = ({ icon: Icon, label }) => (
  <div
    className="
      group flex flex-col items-center justify-center gap-1.5
      rounded-lg border border-zinc-100 bg-white
      px-2 py-3 text-center
      transition-all duration-200
      hover:border-[#C48A4A]/40 hover:shadow-[0_3px_12px_rgba(18,53,36,0.06)]
    "
  >
    <div
      className="
        flex h-7 w-7 items-center justify-center rounded-full
        bg-[#123524]/[0.06] transition-colors duration-200
        group-hover:bg-[#C48A4A]/10
      "
    >
      <Icon size={13} strokeWidth={1.75} style={{ color: GREEN }} />
    </div>
    <span className="text-[10px] font-medium leading-tight text-[#123524]/75">
      {label}
    </span>
  </div>
);

const EcoCartPlusSection = () => {
  const navigate = useNavigate();

  return (
    // NOTE: swap this px-4 sm:px-6 lg:px-10 for whatever container/padding
    // class your AdSlider and ProductCategories sections actually use, so
    // the left/right edges line up exactly across the page.
    <section className="mt-12 px-4 sm:px-6 lg:px-10">
      {/* PLUS AD BANNER — full width rectangle */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={() => navigate("/plus")}
        className="cursor-pointer"
      >
        <div
          className="relative overflow-hidden rounded-2xl p-[1px]"
          style={{
            background: `linear-gradient(120deg, ${COPPER}55, transparent 30%, transparent 70%, ${COPPER}55)`,
          }}
        >
          <div
            className="relative overflow-hidden rounded-2xl border border-white/5 px-6 py-5 md:px-8"
            style={{
              background: `linear-gradient(120deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
            }}
          >
            {/* ambient glow */}
            <div
              className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-20 blur-3xl"
              style={{ background: COPPER }}
            />
            <div
              className="pointer-events-none absolute -bottom-14 left-1/3 h-32 w-32 rounded-full opacity-10 blur-3xl"
              style={{ background: COPPER_LIGHT }}
            />

            {/* eyebrow badge */}
            <span
              className="relative mb-3 inline-block rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]"
              style={{
                background: "rgba(196,138,74,0.15)",
                color: COPPER_LIGHT,
              }}
            >
              Become a plus member!
            </span>

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              {/* LEFT: identity + features */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "rgba(196,138,74,0.16)" }}
                  >
                    <Crown
                      size={17}
                      strokeWidth={1.75}
                      style={{ color: COPPER_LIGHT }}
                    />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold leading-tight text-white">
                      EcoCart Plus
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#D9A25F]/70">
                      Premium membership
                    </p>
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-white/10 md:block" />

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  {plusFeatures.map((label, i) => (
                    <span key={label} className="flex items-center gap-2.5">
                      <span className="text-[11px] tracking-wide text-white/80">
                        {label}
                      </span>
                      {i < plusFeatures.length - 1 && (
                        <span
                          className="h-0.5 w-0.5 rounded-full"
                          style={{ background: COPPER_LIGHT }}
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT: price + CTA */}
              <div className="flex items-center gap-4 md:gap-5">
                <div className="text-right leading-none">
                  <span className="text-2xl font-bold tracking-tight text-white">
                    ₹299
                  </span>
                  <p className="mt-0.5 text-[9px] text-white/40">per year</p>
                </div>

                <button
                  className="
                    flex items-center justify-center gap-1.5
                    rounded-full px-5 py-2.5 text-[12px] font-semibold tracking-wide
                    transition-colors duration-200
                  "
                  style={{ background: COPPER, color: GREEN }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = COPPER_LIGHT)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = COPPER)
                  }
                >
                  Join now
                  <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* OUTER BENEFITS: 3 top, 2 bottom */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          {outerBenefits.slice(0, 3).map((item) => (
            <BenefitTile key={item.label} {...item} />
          ))}
        </div>
        <div className="mx-auto grid w-2/3 grid-cols-2 gap-2 sm:w-2/5">
          {outerBenefits.slice(3).map((item) => (
            <BenefitTile key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EcoCartPlusSection;
