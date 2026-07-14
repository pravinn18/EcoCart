import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../config/axios";
import { useAuth } from "../context/AuthContext";



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
  leaf: (
    <path d="M12 2C12 2 4 7.5 4 14a8 8 0 0016 0C20 7.5 12 2 12 2zM12 22V8M12 14c0 0-3-2-5-6M12 11c0 0 3-2 4-5" />
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
    className="w-5 h-5"
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
        className="w-4 h-4 shrink-0"
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
    <div className="otp-row" onPaste={handlePaste}>
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
          className={`luxury-input ${icon ? "pl-icon" : ""}`}
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
      await axiosInstance.post(`/api/auth/send-otp`, { email: rEmail });
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
      await axiosInstance.post(`/api/auth/send-otp`, { email: rEmail });
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
      await axiosInstance.post(`/api/auth/send-otp`, { email: fpEmail });
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
      const { data } = await axiosInstance.post(`/api/auth/verify-otp`, {
        name: rName,
        email: rEmail,
        password: rPassword,
        otp: otp.trim(),
      });
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0c1512;
          font-family: 'DM Sans', sans-serif;
          padding: clamp(16px, 4vw, 24px);
        }

        .auth-card {
          width: 100%;
          max-width: min(880px, 94vw);
          min-height: clamp(500px, 62vh, 560px);
          display: flex;
          border-radius: clamp(18px, 2vw, 26px);
          overflow: hidden;
          box-shadow: 0 0 0 1px rgba(194,142,119,0.12), 0 30px 70px rgba(0,0,0,0.55);
          animation: cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes cardReveal { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .deco-panel {
          width: 40%;
          background: linear-gradient(160deg, #16281f 0%, #1A302B 55%, #0d1d17 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(28px, 4vw, 44px);
          flex-shrink: 0;
        }

        .brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(194,142,119,0.12);
          border: 1px solid rgba(194,142,119,0.35);
          margin-bottom: 18px;
          color: #C28E77;
        }

        .brand-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.7rem, 2vw + 1rem, 2.1rem);
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .brand-tagline { font-size: 11px; color: rgba(194,142,119,0.75); letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 32px; }

        .deco-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.5rem, 1.5vw + 1rem, 1.8rem);
          font-weight: 600;
          color: #fff;
          margin-bottom: 22px;
        }

        .deco-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 26px;
          border: 1px solid rgba(194,142,119,0.55);
          border-radius: 50px;
          color: #C28E77;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
          transition: all 0.25s ease;
          min-height: 46px;
        }
        .deco-btn:hover { background: rgba(194,142,119,0.12); color: #fff; }

        .step-pills { display: flex; gap: 6px; margin-top: 26px; }
        .step-pill { width: 26px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.18); transition: all 0.3s ease; }
        .step-pill.active { background: #C28E77; width: 42px; }

        .form-panel-wrap {
          flex: 1;
          min-width: 0;
          background: #f8f5f0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(30px, 4vw, 48px);
        }

        .form-panel { position: relative; }
        .form-enter { animation: formIn 0.32s cubic-bezier(0.16,1,0.3,1) both; }
        .form-exit  { animation: formOut 0.24s ease both; }
        @keyframes formIn  { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes formOut { from { opacity: 1; } to { opacity: 0; transform: translateX(-12px); } }

        .step-bar { display: flex; gap: 6px; margin-bottom: 22px; }
        .step-seg { height: 3px; border-radius: 2px; flex: 1; background: #e2d9cf; }
        .step-seg.done { background: #1A302B; }
        .step-seg.active { background: linear-gradient(90deg, #1A302B, #C28E77); }

        .form-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.9rem, 1.5vw + 1.3rem, 2.3rem);
          font-weight: 700;
          color: #0f1e18;
          margin-bottom: 22px;
        }

        .input-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .input-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #7a6e66; }
        .input-wrap { position: relative; }
        .input-icon, .input-eye { position: absolute; top: 50%; transform: translateY(-50%); color: #b8a99c; display: flex; align-items: center; }
        .input-icon { left: 14px; }
        .input-eye { right: 10px; background: none; border: none; cursor: pointer; padding: 8px; }

        .luxury-input {
          width: 100%;
          padding: 15px 14px;
          background: #fff;
          border: 1.5px solid #e8dfd5;
          border-radius: 12px;
          font-size: 16px;
          color: #1a1a1a;
          font-family: 'DM Sans', sans-serif;
          outline: none;
        }
        .luxury-input.pl-icon { padding-left: 42px; }
        .luxury-input::placeholder { color: #c5b8ae; }
        .luxury-input:focus { border-color: #C28E77; box-shadow: 0 0 0 3px rgba(194,142,119,0.14); }

        .btn-primary {
          width: 100%;
          padding: 15px;
          min-height: 50px;
          background: linear-gradient(135deg, #1A302B 0%, #2d5a4e 100%);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 6px;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }
        .btn-primary:hover { box-shadow: 0 8px 22px rgba(26,48,43,0.35); transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .alert {
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .alert-err { background: #fff5f5; border: 1px solid #fecaca; color: #dc2626; }
        .alert-ok  { background: #f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; }

        .otp-row { display: flex; gap: 8px; justify-content: center; }
        .otp-box {
          width: 46px;
          height: 54px;
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          font-family: 'Cormorant Garamond', serif;
          background: #fff;
          border: 1.5px solid #e8dfd5;
          border-radius: 12px;
          color: #1A302B;
          outline: none;
          caret-color: #C28E77;
        }
        .otp-box:focus { border-color: #C28E77; box-shadow: 0 0 0 3px rgba(194,142,119,0.15); }

        .resend-row { display: flex; justify-content: center; margin-top: 10px; }
        .resend-text { font-size: 12px; color: #9a8d83; }

        .text-link {
          background: none; border: none; font-size: 13px; color: #C28E77; font-weight: 700; cursor: pointer;
          text-decoration: underline; text-underline-offset: 2px; padding: 4px;
        }
        .text-link:disabled { opacity: 0.5; cursor: not-allowed; }

        .foot-note { font-size: 13px; color: #9a8d83; text-align: center; margin-top: 16px; }
        .divider { border: none; border-top: 1px solid #ede5dc; margin: 18px 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }

        /* ---------- Mobile: full-screen, centered, input-first ---------- */
        @media (max-width: 760px) {
          .auth-root { padding: 0; align-items: stretch; justify-content: stretch; }
          .auth-card {
            flex-direction: column !important;
            max-width: 100%;
            width: 100%;
            min-height: 100dvh;
            border-radius: 0;
            box-shadow: none;
            justify-content: center;
          }
          /* deco panel collapses to a slim brand strip so inputs get the space */
          .deco-panel { width: 100%; padding: 28px 24px 20px; flex-shrink: 0; }
          .brand-mark { width: 52px; height: 52px; margin-bottom: 10px; }
          .brand-name { font-size: 1.5rem; margin-bottom: 4px; }
          .brand-tagline { margin-bottom: 0; }
          .deco-heading, .step-pills { display: none; }
          .deco-btn { margin-top: 12px; padding: 10px 22px; font-size: 12px; min-height: 40px; }

          .form-panel-wrap { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 28px 22px 40px; }
          .form-title { font-size: 2rem; margin-bottom: 22px; }
          .input-label { font-size: 12px; }
          .luxury-input { padding: 18px 14px; font-size: 17px; border-radius: 14px; }
          .luxury-input.pl-icon { padding-left: 46px; }
          .input-icon svg, .input-eye svg { width: 21px; height: 21px; }
          .input-group { margin-bottom: 18px; }
          .btn-primary { padding: 18px; min-height: 56px; font-size: 14.5px; border-radius: 14px; }
          .otp-box { width: 15vw; max-width: 52px; height: 60px; font-size: 22px; border-radius: 14px; }
          .otp-row { gap: 7px; }
          .foot-note, .resend-text, .text-link { font-size: 14.5px; }
          .step-bar { margin-bottom: 20px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-card, .form-enter, .form-exit, .spin { animation: none !important; }
        }
      `}</style>

      <div className="auth-root">
        <div
          className="auth-card"
          style={{
            flexDirection:
              isRegisterMode && panelSide === "left" ? "row-reverse" : "row",
          }}
        >
          <div className="deco-panel">
            <div className="brand-mark">
              <Icon name="leaf" className="w-7 h-7" />
            </div>
            <div className="brand-name">Ecocart</div>
            <div className="brand-tagline">Natural · Sustainable</div>

            {mode === "login" && (
              <>
                <p className="deco-heading">New here?</p>
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

          <div className="form-panel-wrap">
            <div className={formClass}>
              <Alert type="error">{err}</Alert>
              <Alert type="ok">{msg}</Alert>

              {mode === "login" && (
                <>
                  <p className="form-title">Sign In</p>
                  <form onSubmit={handleLogin}>
                    <InputField
                      label="Email"
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
                      placeholder="••••••••"
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
                      Reset it
                    </button>
                  </p>
                </>
              )}

              {mode === "reg-email" && (
                <>
                  <StepBar active={1} />
                  <p className="form-title">Your Email</p>
                  <form onSubmit={handleSendOtp}>
                    <InputField
                      label="Email"
                      type="email"
                      value={rEmail}
                      onChange={setREmail}
                      placeholder="you@example.com"
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
                  <p className="form-title">
                    Code sent to{" "}
                    <span style={{ color: "#C28E77" }}>{rEmail}</span>
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
                      placeholder="Jane Doe"
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
                      Create Account →
                    </SubmitButton>
                  </form>
                </>
              )}

              {mode === "fp-email" && (
                <>
                  <StepBar active={1} />
                  <p className="form-title">Reset Password</p>
                  <form onSubmit={handleFpSendOtp}>
                    <InputField
                      label="Email"
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
                  <p className="form-title">
                    Code sent to{" "}
                    <span style={{ color: "#C28E77" }}>{fpEmail}</span>
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
      </div>
    </>
  );
}
