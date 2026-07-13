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
      px-3 py-4 text-center
      transition-all duration-200
      hover:border-[#C48A4A]/40 hover:shadow-[0_3px_12px_rgba(18,53,36,0.06)]
      /* Responsive sizing: scales from mobile up to giant screens naturally */
      flex-1 min-w-[100px] sm:min-w-[140px] md:min-w-[160px] max-w-[280px] tv:max-w-[400px] tv:py-6
    "
  >
    <div
      className="
        flex h-7 w-7 items-center justify-center rounded-full
        bg-[#123524]/[0.06] transition-colors duration-200
        group-hover:bg-[#C48A4A]/10
        tv:h-12 tv:w-12
      "
    >
      <Icon
        className="w-3.5 h-3.5 tv:w-6 tv:h-6"
        strokeWidth={1.75}
        style={{ color: GREEN }}
      />
    </div>
    <span className="text-[10px] sm:text-xs tv:text-lg font-medium leading-tight text-[#123524]/75">
      {label}
    </span>
  </div>
);

const EcoCartPlusSection = () => {
  const navigate = useNavigate();

  return (
    <section className="mt-6 sm:mt-12 px-4 sm:px-6 lg:px-10 max-w-[1920px] tv:max-w-[2560px] mx-auto w-full">
      
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
            className="relative overflow-hidden rounded-2xl border border-white/5 px-5 py-5 sm:px-6 md:px-8 tv:p-16"
            style={{
              background: `linear-gradient(120deg, ${GREEN} 0%, ${GREEN_DARK} 100%)`,
            }}
          >
          
            <div
              className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full opacity-20 blur-3xl tv:h-80 tv:w-80"
              style={{ background: COPPER }}
            />
            <div
              className="pointer-events-none absolute -bottom-14 left-1/3 h-32 w-32 rounded-full opacity-10 blur-3xl tv:h-64 tv:w-64"
              style={{ background: COPPER_LIGHT }}
            />

       
            <span
              className="relative mb-3 inline-block rounded-full px-2.5 py-1 text-[9px] sm:text-[10px] tv:text-sm font-semibold uppercase tracking-[0.18em]"
              style={{
                background: "rgba(196,138,74,0.15)",
                color: COPPER_LIGHT,
              }}
            >
              Become a plus member!
            </span>

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between tv:gap-12">
          
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 tv:gap-12">
                <div className="flex items-center gap-3 tv:gap-6">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg tv:h-16 tv:w-16 tv:rounded-xl"
                    style={{ background: "rgba(196,138,74,0.16)" }}
                  >
                    <Crown
                      className="w-[17px] h-[17px] tv:w-8 tv:h-8"
                      strokeWidth={1.75}
                      style={{ color: COPPER_LIGHT }}
                    />
                  </div>
                  <div>
                    <p className="text-[15px] sm:text-base tv:text-2xl font-semibold leading-tight text-white">
                      EcoCart Plus
                    </p>
                    <p className="text-[10px] tv:text-sm uppercase tracking-[0.16em] text-[#D9A25F]/70">
                      Premium membership
                    </p>
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-white/10 md:block tv:h-12" />

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 tv:gap-x-5">
                  {plusFeatures.map((label, i) => (
                    <span
                      key={label}
                      className="flex items-center gap-2.5 tv:gap-5"
                    >
                      <span className="text-[11px] sm:text-xs tv:text-lg tracking-wide text-white/80">
                        {label}
                      </span>
                      {i < plusFeatures.length - 1 && (
                        <span
                          className="h-0.5 w-0.5 rounded-full tv:h-1 tv:w-1"
                          style={{ background: COPPER_LIGHT }}
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4 md:gap-5 tv:gap-10 mt-2 lg:mt-0">
                <div className="text-left lg:text-right leading-none">
                  <span className="text-xl sm:text-2xl tv:text-4xl font-bold tracking-tight text-white">
                    ₹299
                  </span>
                  <p className="mt-0.5 text-[9px] tv:text-sm text-white/40">
                    per year
                  </p>
                </div>

                <button
                  className="
                    flex items-center justify-center gap-1.5
                    rounded-full px-5 py-2.5 text-[12px] sm:text-xs tv:text-lg tv:px-8 tv:py-4 font-semibold tracking-wide
                    transition-colors duration-200 whitespace-nowrap
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
                  <ArrowRight
                    className="w-3 h-3 tv:w-5 tv:h-5"
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 flex flex-wrap justify-center items-stretch gap-2 sm:gap-3 tv:mt-8 tv:gap-6">
        {outerBenefits.map((item) => (
          <BenefitTile key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
};

export default EcoCartPlusSection;
