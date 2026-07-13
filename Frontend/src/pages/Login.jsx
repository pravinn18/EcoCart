import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../config/axios";
import { useAuth } from "../context/AuthContext";

/* ---------- Shared bits (reduces repeated markup) ---------- */

const BotanicalArt = () => (
  <svg
    viewBox="0 0 400 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none select-none"
  >
    <path
      d="M200 480 C200 480 195 350 200 200 C205 100 200 40 200 40"
      stroke="#C28E77"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M200 300 C160 280 100 240 80 180 C120 190 170 220 200 300Z"
      fill="#2d5a4e"
      stroke="#C28E77"
      strokeWidth="0.8"
    />
    <path
      d="M200 300 C160 280 100 240 80 180"
      stroke="#C28E77"
      strokeWidth="0.6"
      strokeDasharray="2 4"
    />
    <path
      d="M200 260 C240 235 310 200 330 140 C290 155 240 185 200 260Z"
      fill="#2d5a4e"
      stroke="#C28E77"
      strokeWidth="0.8"
    />
    <path
      d="M200 260 C240 235 310 200 330 140"
      stroke="#C28E77"
      strokeWidth="0.6"
      strokeDasharray="2 4"
    />
    <path
      d="M200 380 C170 358 130 330 110 285 C145 295 178 320 200 380Z"
      fill="#1e4035"
      stroke="#C28E77"
      strokeWidth="0.6"
    />
    <path
      d="M200 200 C228 175 270 148 298 108 C264 120 225 148 200 200Z"
      fill="#1e4035"
      stroke="#C28E77"
      strokeWidth="0.6"
    />
    <path
      d="M200 130 C215 112 240 96 258 72 C236 82 210 100 200 130Z"
      fill="#2d5a4e"
      stroke="#C28E77"
      strokeWidth="0.5"
    />
    <path
      d="M200 300 C175 268 138 250 108 235"
      stroke="#C28E77"
      strokeWidth="0.4"
      opacity="0.6"
    />
    <path
      d="M200 260 C225 232 258 218 285 200"
      stroke="#C28E77"
      strokeWidth="0.4"
      opacity="0.6"
    />
    <circle cx="85" cy="170" r="2.5" fill="#C28E77" opacity="0.5" />
    <circle cx="335" cy="132" r="2" fill="#C28E77" opacity="0.4" />
    <circle cx="108" cy="278" r="1.5" fill="#C28E77" opacity="0.35" />
    <circle cx="302" cy="95" r="2" fill="#C28E77" opacity="0.45" />
    <circle cx="150" cy="430" r="1.5" fill="#C28E77" opacity="0.3" />
    <path
      d="M20 460 C40 420 80 390 100 350"
      stroke="#C28E77"
      strokeWidth="0.8"
      opacity="0.4"
      strokeLinecap="round"
    />
    <path
      d="M20 460 C50 450 90 455 110 440"
      stroke="#C28E77"
      strokeWidth="0.6"
      opacity="0.35"
      strokeLinecap="round"
    />
    <path
      d="M370 80 C355 110 330 130 310 160"
      stroke="#C28E77"
      strokeWidth="0.8"
      opacity="0.4"
      strokeLinecap="round"
    />
  </svg>
);

// One icon component instead of 6+ duplicated inline <svg> blocks.
const ICON_PATHS = {
  mail: (
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  check: (
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  checkCircle: (
    <>
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  spinner: (
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
  ),
};

const Icon = ({ name, className = "w-4 h-4", spin = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className={`${className} ${spin ? "spin" : ""}`}
  >
    {ICON_PATHS[name]}
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="w-4 h-4"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// Button that handles its own loading/idle label + spinner (was duplicated 5x)
const SubmitButton = ({ loading, loadingText, children }) => (
  <button type="submit" className="btn-primary" disabled={loading}>
    {loading ? (
      <>
        <Icon name="spinner" className="w-4 h-4" spin /> {loadingText}
      </>
    ) : (
      children
    )}
  </button>
);

const Alert = ({ type, children }) =>
  children ? (
    <div className={`alert alert-${type === "error" ? "err" : "ok"}`}>
      <Icon
        name={type === "error" ? "alertCircle" : "checkCircle"}
        className="w-4 h-4 shrink-0 mt-0.5"
      />
      {children}
    </div>
  ) : null;

const StepBar = ({ active }) => (
  <div className="step-bar">
    <div
      className={`step-seg ${active >= 1 ? "done" : ""} ${active === 1 ? "active" : ""}`}
    />
    <div className={`step-seg ${active === 2 ? "active" : ""}`} />
  </div>
);

const StepLabel = ({ step, text }) => (
  <p className="step-label">
    Step {step} — {text}
  </p>
);

const OtpInput = ({ value, onChange }) => {
  const refs = useRef([]);
  const digits = (value + "      ").slice(0, 6).split("");

  const handleChange = (e, i) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? v : d));
    onChange(next.join("").trimEnd());
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? " " : d));
      onChange(next.join("").trimEnd());
      if (i > 0) refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p);
    refs.current[Math.min(p.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="otp-box"
        />
      ))}
    </div>
  );
};

// OTP field + resend timer row (was duplicated for reg + forgot-password flows)
const OtpBlock = ({ value, onChange, timer, timerStr, onResend, loading }) => (
  <div className="input-group" style={{ marginBottom: 18 }}>
    <label className="input-label">Verification Code</label>
    <OtpInput value={value} onChange={onChange} />
    <div className="resend-row">
      {timer > 0 ? (
        <span className="resend-text">
          Resend in <strong style={{ color: "#C28E77" }}>{timerStr}</strong>
        </span>
      ) : (
        <button
          type="button"
          className="text-link"
          onClick={onResend}
          disabled={loading}
        >
          ↻ Resend OTP
        </button>
      )}
    </div>
  </div>
);

const InputField = ({
  label,
  type: initialType = "text",
  value,
  onChange,
  placeholder,
  icon,
  required,
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = initialType === "password";
  const type = isPassword ? (showPwd ? "text" : "password") : initialType;

  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrap">
        {icon && (
          <span className="input-icon">
            <Icon name={icon} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`luxury-input ${icon ? "pl-10" : "pl-4"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((p) => !p)}
            className="input-eye"
          >
            <EyeIcon open={showPwd} />
          </button>
        )}
      </div>
    </div>
  );
};

/* ---------- Main component (all handlers/logic unchanged) ---------- */

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [panelSide, setPanelSide] = useState("right");

  const [lEmail, setLEmail] = useState("");
  const [lPassword, setLPassword] = useState("");

  const [rEmail, setREmail] = useState("");
  const [rName, setRName] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rConfirm, setRConfirm] = useState("");
  const [otp, setOtp] = useState("");

  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpPassword, setFpPassword] = useState("");
  const [fpConfirm, setFpConfirm] = useState("");
  const [fpTimer, setFpTimer] = useState(0);
  const fpTimerRef = useRef(null);

  useEffect(() => {
    if (timer <= 0) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(timerRef.current);
  }, [timer > 0]);

  const timerStr = `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (fpTimer <= 0) {
      clearInterval(fpTimerRef.current);
      return;
    }
    fpTimerRef.current = setInterval(
      () => setFpTimer((t) => (t > 0 ? t - 1 : 0)),
      1000,
    );
    return () => clearInterval(fpTimerRef.current);
  }, [fpTimer > 0]);

  const fpTimerStr = `${String(Math.floor(fpTimer / 60)).padStart(2, "0")}:${String(fpTimer % 60).padStart(2, "0")}`;

  const switchMode = useCallback((next, side = "right") => {
    setTransitioning(true);
    setErr("");
    setMsg("");
    setTimeout(() => {
      setMode(next);
      setPanelSide(side);
      setTransitioning(false);
    }, 320);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/auth/login", {
        email: lEmail,
        password: lPassword,
      });
      login(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setMsg("Welcome back! Redirecting...");
      setTimeout(() => {
        window.location.href = data.isAdmin ? "/admin" : "/";
      }, 900);
    } catch (e) {
      setErr(
        e.response?.data?.message || "Login failed. Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await axiosInstance.post(`/api/auth/send-otp`, {
        email: rEmail,
      });
      setMsg(`Code sent to ${rEmail}`);
      setTimer(120);
      setOtp("");
      switchMode("reg-form", "left");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setErr("");
    setLoading(true);
    try {
      await axiosInstance.post(`/api/auth/send-otp`, {
        email: rEmail,
      });
      setMsg("New OTP sent!");
      setTimer(120);
      setOtp("");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to resend.");
    } finally {
      setLoading(false);
    }
  };

  const handleFpSendOtp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await axiosInstance.post(`/api/auth/forgot-password-otp`, {
        email: fpEmail,
      });
      setMsg(`Code sent to ${fpEmail}`);
      setFpTimer(120);
      setFpOtp("");
      switchMode("fp-reset", "right");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleFpResend = async () => {
    if (fpTimer > 0) return;
    setErr("");
    setLoading(true);
    try {
      await axiosInstance.post(`/api/auth/send-otp`, {
        email: fpEmail,
      });
      setMsg("New OTP sent!");
      setFpTimer(120);
      setFpOtp("");
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to resend.");
    } finally {
      setLoading(false);
    }
  };

  const handleFpReset = async (e) => {
    e.preventDefault();
    if (fpPassword !== fpConfirm) {
      setErr("Passwords don't match.");
      return;
    }
    if (fpPassword.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (fpOtp.trim().length < 6) {
      setErr("Enter all 6 OTP digits.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await axiosInstance.post(`/api/auth/reset-password`, {
        email: fpEmail,
        otp: fpOtp.trim(),
        password: fpPassword,
      });
      setMsg("Password reset! Please sign in.");
      setTimeout(() => switchMode("login", "right"), 1200);
    } catch (e) {
      setErr(e.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (rPassword !== rConfirm) {
      setErr("Passwords don't match.");
      return;
    }
    if (rPassword.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }
    if (otp.trim().length < 6) {
      setErr("Enter all 6 OTP digits.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        `/api/auth/verify-otp`,
        {
          name: rName,
          email: rEmail,
          password: rPassword,
          otp: otp.trim(),
        },
      );
      login(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setMsg("Account created! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch (e) {
      setErr(e.response?.data?.message || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const isRegisterMode = mode === "reg-email" || mode === "reg-form";
  const formClass = `form-panel ${transitioning ? "form-exit" : "form-enter"}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080f0c;
          font-family: 'DM Sans', sans-serif;
          padding: clamp(12px, 4vw, 24px);
          position: relative;
          overflow: hidden;
        }

        .auth-root::before,
        .auth-root::after {
          content: '';
          position: fixed;
          width: min(600px, 70vw);
          height: min(600px, 70vw);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .auth-root::before { top: -20%; left: -10%; background: radial-gradient(circle, rgba(26,48,43,0.7) 0%, transparent 70%); }
        .auth-root::after  { bottom: -15%; right: -10%; background: radial-gradient(circle, rgba(194,142,119,0.12) 0%, transparent 70%); }

        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* Card scales fluidly from small phones up through large/TV screens */
        .auth-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: min(900px, 92vw);
          min-height: clamp(480px, 60vh, 560px);
          display: flex;
          border-radius: clamp(16px, 2vw, 28px);
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(194,142,119,0.12), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(26,48,43,0.3);
          animation: cardReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        .deco-panel {
          width: 42%;
          background: linear-gradient(155deg, #0f2219 0%, #1A302B 40%, #0d1d17 100%);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(24px, 4vw, 48px) clamp(20px, 3vw, 36px);
          overflow: hidden;
          flex-shrink: 0;
        }
        .deco-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 20%, rgba(194,142,119,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 80%, rgba(45,90,78,0.15) 0%, transparent 60%);
        }
        .deco-panel::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C28E77, transparent);
          opacity: 0.5;
        }

        .deco-content { position: relative; z-index: 2; text-align: center; }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(194,142,119,0.2), rgba(194,142,119,0.05));
          border: 1px solid rgba(194,142,119,0.3);
          margin-bottom: 16px;
          backdrop-filter: blur(8px);
        }

        .brand-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.5rem, 2vw + 1rem, 2rem);
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 6px;
        }

        .brand-tagline {
          font-size: 11px;
          color: rgba(194,142,119,0.7);
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: clamp(20px, 3vw, 36px);
        }

        .deco-heading {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.5rem, 1.5vw + 1rem, 1.9rem);
          font-weight: 300;
          font-style: italic;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .deco-sub { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 28px; line-height: 1.6; }

        .deco-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 28px;
          border: 1px solid rgba(194,142,119,0.5);
          border-radius: 50px;
          color: #C28E77;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif;
          min-height: 44px;
        }
        .deco-btn:hover { background: rgba(194,142,119,0.1); border-color: #C28E77; color: #fff; }

        .step-pills { display: flex; gap: 6px; margin-top: 28px; justify-content: center; }
        .step-pill { width: 28px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.15); transition: all 0.3s ease; }
        .step-pill.active { background: #C28E77; width: 44px; }

        .form-panel-wrap {
          flex: 1;
          min-width: 0;
          background: #f8f5f0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(28px, 4vw, 48px) clamp(24px, 4vw, 44px);
          position: relative;
          overflow: hidden;
        }
        .form-panel-wrap::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(194,142,119,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .form-panel { position: relative; z-index: 2; }
        .form-enter { animation: formIn 0.35s cubic-bezier(0.16,1,0.3,1) both; }
        .form-exit  { animation: formOut 0.28s ease both; }
        @keyframes formIn  { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes formOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-16px); } }

        .step-bar { display: flex; gap: 6px; margin-bottom: 24px; }
        .step-seg { height: 3px; border-radius: 2px; flex: 1; background: #e2d9cf; transition: background 0.3s ease; }
        .step-seg.done { background: #1A302B; }
        .step-seg.active { background: linear-gradient(90deg, #1A302B, #C28E77); }

        .step-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: #C28E77; margin-bottom: 4px;
        }

        .form-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(1.7rem, 1.5vw + 1.2rem, 2.2rem);
          font-weight: 600;
          color: #0f1e18;
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .form-sub { font-size: 12px; color: #9a8d83; margin-bottom: 24px; letter-spacing: 0.02em; }

        .input-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .input-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #7a6e66; }
        .input-wrap { position: relative; }
        .input-icon, .input-eye {
          position: absolute; top: 50%; transform: translateY(-50%);
          color: #b8a99c; display: flex; align-items: center;
        }
        .input-icon { left: 12px; }
        .input-eye { right: 8px; background: none; border: none; cursor: pointer; padding: 8px; transition: color 0.2s; }
        .input-eye:hover { color: #1A302B; }

        .luxury-input {
          width: 100%;
          padding: 13px 40px 13px 12px;
          background: #fff;
          border: 1.5px solid #e8dfd5;
          border-radius: 12px;
          font-size: 16px; /* prevents iOS auto-zoom on focus */
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          outline: none;
        }
        .luxury-input::placeholder { color: #c5b8ae; }
        .luxury-input:focus { border-color: #C28E77; box-shadow: 0 0 0 3px rgba(194,142,119,0.12); }

        .btn-primary {
          width: 100%;
          padding: 14px;
          min-height: 48px;
          background: linear-gradient(135deg, #1A302B 0%, #2d5a4e 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover { box-shadow: 0 8px 24px rgba(26,48,43,0.35); transform: translateY(-1px); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }
        .btn-primary::after {
          content: '';
          position: absolute;
          top: -50%; left: -75%;
          width: 50%; height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transform: skewX(-20deg);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer { 0% { left: -75%; } 100% { left: 150%; } }

        .alert {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.5;
        }
        .alert-err { background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; }
        .alert-ok  { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }

        .otp-box {
          width: clamp(38px, 8vw, 44px);
          height: clamp(46px, 10vw, 52px);
          text-align: center;
          font-size: clamp(18px, 3vw, 20px);
          font-weight: 700;
          font-family: 'Cormorant Garamond', serif;
          background: #fff;
          border: 1.5px solid #e8dfd5;
          border-radius: 12px;
          color: #1A302B;
          outline: none;
          transition: all 0.2s ease;
          caret-color: #C28E77;
        }
        .otp-box:focus { border-color: #C28E77; box-shadow: 0 0 0 3px rgba(194,142,119,0.15); }

        .resend-row { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; }
        .resend-text { font-size: 11px; color: #9a8d83; }

        .text-link {
          background: none; border: none; font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #C28E77; font-weight: 600; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s; padding: 4px;
        }
        .text-link:hover { color: #1A302B; }
        .text-link:disabled { opacity: 0.5; cursor: not-allowed; }

        .foot-note { font-size: 12px; color: #9a8d83; text-align: center; }
        .divider { border: none; border-top: 1px solid #ede5dc; margin: 18px 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        .copyright {
          position: relative; z-index: 10; margin-top: 20px; font-size: 10px;
          color: rgba(255,255,255,0.2); letter-spacing: 0.15em; text-transform: uppercase; text-align: center;
        }

        /* ---------- Responsive: tablets and below stack the card vertically ---------- */
        @media (max-width: 760px) {
          .auth-card { flex-direction: column !important; max-width: min(420px, 94vw); min-height: auto; }
          .deco-panel { width: 100%; min-height: 190px; padding: 24px 20px 20px; }
          .step-pills { margin-top: 20px; }
        }

        /* ---------- Small phones ---------- */
        @media (max-width: 380px) {
          .otp-box { width: 34px; height: 42px; font-size: 16px; }
          .deco-heading { font-size: 1.35rem; }
          .brand-name { font-size: 1.3rem; letter-spacing: 0.18em; }
        }

        /* ---------- Short viewports (landscape phones) ---------- */
        @media (max-height: 500px) and (orientation: landscape) {
          .auth-root { align-items: flex-start; padding-top: 16px; }
          .auth-card { flex-direction: row !important; min-height: auto; }
          .deco-panel { min-height: auto; padding: 20px; }
          .form-panel-wrap { padding: 20px 24px; }
          .copyright { display: none; }
        }

        /* ---------- Large screens / TVs: keep the card human-scaled, don't stretch it ---------- */
        @media (min-width: 1440px) {
          .auth-card { max-width: 960px; }
        }

        /* Respect reduced-motion preference */
        @media (prefers-reduced-motion: reduce) {
          .auth-card, .form-enter, .form-exit, .btn-primary::after, .spin { animation: none !important; }
        }
      `}</style>

      <div className="auth-root">
        <div className="grain" />

        <div
          className="auth-card"
          style={{
            flexDirection:
              isRegisterMode && panelSide === "left" ? "row-reverse" : "row",
          }}
        >
          <div className="deco-panel">
            <BotanicalArt />
            <div className="deco-content">
              <div className="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path
                    d="M12 2C12 2 4 7.5 4 14a8 8 0 0016 0C20 7.5 12 2 12 2z"
                    fill="#C28E77"
                    opacity="0.9"
                  />
                  <path
                    d="M12 22V8"
                    stroke="#1A302B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 14c0 0-3-2-5-6"
                    stroke="#1A302B"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                  <path
                    d="M12 11c0 0 3-2 4-5"
                    stroke="#1A302B"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
              <div className="brand-name">Ecocart</div>
              <div className="brand-tagline">Natural · Sustainable</div>

              {mode === "login" && (
                <>
                  <p className="deco-heading">New here?</p>
                  <p className="deco-sub">
                    Join thousands of conscious shoppers.
                    <br />
                    Create your account in minutes.
                  </p>
                  <button
                    className="deco-btn"
                    onClick={() => switchMode("reg-email", "left")}
                  >
                    Create Account →
                  </button>
                </>
              )}
              {mode === "reg-email" && (
                <>
                  <p className="deco-heading">Welcome back.</p>
                  <p className="deco-sub">
                    Already have an account?
                    <br />
                    Sign in to continue.
                  </p>
                  <button
                    className="deco-btn"
                    onClick={() => switchMode("login", "right")}
                  >
                    ← Sign In
                  </button>
                  <div className="step-pills">
                    <div className="step-pill active" />
                    <div className="step-pill" />
                  </div>
                </>
              )}
              {mode === "reg-form" && (
                <>
                  <p className="deco-heading">Almost there!</p>
                  <p className="deco-sub">
                    Check your inbox for the
                    <br />
                    verification code.
                  </p>
                  <button
                    className="deco-btn"
                    onClick={() => switchMode("reg-email", "left")}
                  >
                    ← Change Email
                  </button>
                  <div className="step-pills">
                    <div className="step-pill done" />
                    <div className="step-pill active" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-panel-wrap">
            <div className={formClass}>
              <Alert type="error">{err}</Alert>
              <Alert type="ok">{msg}</Alert>

              {mode === "login" && (
                <>
                  <p className="form-title">Sign In</p>
                  <p className="form-sub">
                    Enter your credentials to access your account
                  </p>
                  <form onSubmit={handleLogin}>
                    <InputField
                      label="Email Address"
                      type="email"
                      value={lEmail}
                      onChange={setLEmail}
                      placeholder="you@example.com"
                      icon="mail"
                      required
                    />
                    <InputField
                      label="Password"
                      type="password"
                      value={lPassword}
                      onChange={setLPassword}
                      placeholder="Enter your password"
                      icon="lock"
                      required
                    />
                    <SubmitButton loading={loading} loadingText="Signing in…">
                      Sign In →
                    </SubmitButton>
                  </form>
                  <hr className="divider" />
                  <p className="foot-note">
                    Forgot your password?{" "}
                    <button
                      className="text-link"
                      onClick={() => switchMode("fp-email", "right")}
                    >
                      Reset it here
                    </button>
                  </p>
                </>
              )}

              {mode === "reg-email" && (
                <>
                  <StepBar active={1} />
                  <StepLabel step={1} text="Verify Email" />
                  <p className="form-title">
                    What's your
                    <br />
                    email?
                  </p>
                  <p className="form-sub">
                    We'll send a one-time code to confirm it's you.
                  </p>
                  <form onSubmit={handleSendOtp}>
                    <InputField
                      type="email"
                      value={rEmail}
                      onChange={setREmail}
                      placeholder="your@email.com"
                      icon="mail"
                      required
                    />
                    <SubmitButton loading={loading} loadingText="Sending Code…">
                      Get OTP →
                    </SubmitButton>
                  </form>
                  <hr className="divider" />
                  <p className="foot-note">
                    Already have an account?{" "}
                    <button
                      className="text-link"
                      onClick={() => switchMode("login", "right")}
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}

              {mode === "reg-form" && (
                <>
                  <StepBar active={2} />
                  <StepLabel step={2} text="Complete Registration" />
                  <p className="form-title">
                    Almost
                    <br />
                    there!
                  </p>
                  <p className="form-sub">
                    OTP sent to{" "}
                    <strong style={{ color: "#1A302B" }}>{rEmail}</strong>
                  </p>

                  <form onSubmit={handleRegister}>
                    <OtpBlock
                      value={otp}
                      onChange={setOtp}
                      timer={timer}
                      timerStr={timerStr}
                      onResend={handleResend}
                      loading={loading}
                    />
                    <InputField
                      label="Full Name"
                      value={rName}
                      onChange={setRName}
                      placeholder="Your full name"
                      icon="user"
                      required
                    />
                    <InputField
                      label="Password"
                      type="password"
                      value={rPassword}
                      onChange={setRPassword}
                      placeholder="Min. 6 characters"
                      icon="lock"
                      required
                    />
                    <InputField
                      label="Confirm Password"
                      type="password"
                      value={rConfirm}
                      onChange={setRConfirm}
                      placeholder="Repeat password"
                      icon="check"
                      required
                    />
                    <SubmitButton
                      loading={loading}
                      loadingText="Creating Account…"
                    >
                      Verify & Create Account →
                    </SubmitButton>
                  </form>
                </>
              )}

              {mode === "fp-email" && (
                <>
                  <StepBar active={1} />
                  <StepLabel step={1} text="Verify Email" />
                  <p className="form-title">
                    Forgot your
                    <br />
                    password?
                  </p>
                  <p className="form-sub">
                    Enter your email to receive a reset code.
                  </p>
                  <form onSubmit={handleFpSendOtp}>
                    <InputField
                      label="Email Address"
                      type="email"
                      value={fpEmail}
                      onChange={setFpEmail}
                      placeholder="you@example.com"
                      icon="mail"
                      required
                    />
                    <SubmitButton loading={loading} loadingText="Sending Code…">
                      Send Reset Code →
                    </SubmitButton>
                  </form>
                  <hr className="divider" />
                  <p className="foot-note">
                    Remembered it?{" "}
                    <button
                      className="text-link"
                      onClick={() => switchMode("login", "right")}
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}

              {mode === "fp-reset" && (
                <>
                  <StepBar active={2} />
                  <StepLabel step={2} text="Reset Password" />
                  <p className="form-title">
                    New
                    <br />
                    password
                  </p>
                  <p className="form-sub">
                    OTP sent to{" "}
                    <strong style={{ color: "#1A302B" }}>{fpEmail}</strong>
                  </p>
                  <form onSubmit={handleFpReset}>
                    <OtpBlock
                      value={fpOtp}
                      onChange={setFpOtp}
                      timer={fpTimer}
                      timerStr={fpTimerStr}
                      onResend={handleFpResend}
                      loading={loading}
                    />
                    <InputField
                      label="New Password"
                      type="password"
                      value={fpPassword}
                      onChange={setFpPassword}
                      placeholder="Min. 6 characters"
                      icon="lock"
                      required
                    />
                    <InputField
                      label="Confirm New Password"
                      type="password"
                      value={fpConfirm}
                      onChange={setFpConfirm}
                      placeholder="Repeat new password"
                      icon="check"
                      required
                    />
                    <SubmitButton loading={loading} loadingText="Resetting…">
                      Reset Password →
                    </SubmitButton>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} Ecocart · Secure &amp; Encrypted
        </p>
      </div>
    </>
  );
}
