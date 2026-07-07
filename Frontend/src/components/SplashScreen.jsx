
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }) {
const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={styles.wrapper}
        >
          
          <motion.div
            style={styles.logoWrap}
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.6,
              type: "spring",
              stiffness: 80,
              damping: 14,
            }}
          >
            <img src="/logo-favicon.png" alt="EcoCart" style={styles.logoImg} />
          </motion.div>

          <div style={styles.brand}>
            <div style={styles.wordmark}>
              <span style={styles.ecoGroup}>
                {["E", "c", "o"].map((letter, i) => (
                  <motion.span
                    key={i}
                    style={styles.ecoLetter}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.7 + i * 0.08,
                      duration: 0.4,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>

              <span style={styles.cartGroup}>
                {["C", "a", "r", "t"].map((letter, i) => (
                  <motion.span
                    key={i}
                    style={styles.cartLetter}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.95 + i * 0.08,
                      duration: 0.4,
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            </div>

            <motion.div
              style={styles.divider}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 1.25,
                duration: 0.5,
              }}
            />

            <motion.p
              style={styles.tagline}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1.55,
                duration: 0.6,
              }}
            >
              Smart · Fresh · Sustainable
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "clamp(20px, 3vw, 32px)",
    overflow: "hidden",
    padding: "20px",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoImg: {
    width: "clamp(80px, 10vw, 100px)",
    height: "clamp(80px, 10vw, 100px)",
    objectFit: "contain",
  },

  brand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },

  wordmark: {
    display: "flex",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(38px, 6vw, 58px)",
    fontWeight: 300,
    letterSpacing: "0.1em",
    lineHeight: 1,
    overflow: "hidden",
  },

  ecoGroup: {
    display: "inline-flex",
    overflow: "hidden",
  },

  cartGroup: {
    display: "inline-flex",
    overflow: "hidden",
  },

  ecoLetter: {
    display: "inline-block",
    color: "#C28E77",
  },

  cartLetter: {
    display: "inline-block",
    color: "#1a1a1a",
  },

  divider: {
    width: "clamp(140px, 25vw, 180px)",
    height: 1,
    background: "linear-gradient(90deg, transparent, #C28E77, transparent)",
    margin: "20px 0 14px",
    transformOrigin: "center",
  },

  tagline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "clamp(8px, 1.2vw, 10px)",
    fontWeight: 200,
    letterSpacing: "0.38em",
    textTransform: "uppercase",
    color: "rgba(0,0,0,0.35)",
    margin: 0,
    textAlign: "center",
  },
};
