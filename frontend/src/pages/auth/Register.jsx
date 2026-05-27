import { useState } from "react";
import { register, login } from "../../services/api";

const COLORS = {
  secondary: "#D3968C",
  accent: "#c07060",
  bg_light: "#F7F4D5",
  text_dark: "#105666",
  white: "#ffffff",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }
  .reg-page { display: flex; min-height: 100vh; }
  .reg-left { flex: 1; background: linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 40px; position: relative; overflow: hidden; }
  .reg-left::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: rgba(247,244,213,0.12); border-radius: 50%; }
  .reg-left::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 240px; height: 240px; background: rgba(16,86,102,0.12); border-radius: 50%; }
  .reg-left-content { position: relative; z-index: 1; text-align: center; }
  .reg-illus { font-size: 96px; margin-bottom: 24px; display: block; }
  .reg-left-title { font-size: clamp(24px, 3vw, 32px); font-weight: 800; color: ${COLORS.bg_light}; margin-bottom: 12px; line-height: 1.2; }
  .reg-left-sub { font-size: 15px; color: rgba(247,244,213,0.8); font-weight: 500; line-height: 1.6; max-width: 320px; }
  .reg-steps { margin-top: 28px; text-align: left; display: flex; flex-direction: column; gap: 12px; }
  .reg-step { display: flex; align-items: center; gap: 12px; }
  .reg-step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(247,244,213,0.25); color: ${COLORS.bg_light}; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .reg-step-text { font-size: 13px; color: rgba(247,244,213,0.85); font-weight: 500; }
  .reg-right { width: 480px; flex-shrink: 0; background: ${COLORS.white}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; border-radius: 24px 0 0 24px; }
  .reg-right-inner { width: 100%; max-width: 360px; }
  .reg-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
  .reg-brand-icon { font-size: 28px; }
  .reg-brand-name { font-size: 20px; font-weight: 800; color: ${COLORS.text_dark}; }
  .reg-title { font-size: 28px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 6px; }
  .reg-sub { font-size: 14px; color: rgba(16,86,102,0.55); font-weight: 500; margin-bottom: 28px; }
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; display: block; margin-bottom: 7px; }
  .form-input { width: 100%; padding: 13px 16px; border: 1.5px solid rgba(211,150,140,0.25); border-radius: 12px; font-size: 14px; font-family: 'Poppins', sans-serif; color: ${COLORS.text_dark}; background: ${COLORS.bg_light}; outline: none; transition: border 0.2s; }
  .form-input:focus { border-color: ${COLORS.secondary}; background: ${COLORS.white}; }
  .form-input::placeholder { color: rgba(16,86,102,0.3); }
  .form-input.error { border-color: #ef4444; }
  .input-wrap { position: relative; }
  .input-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; color: rgba(16,86,102,0.4); }
  .field-error { font-size: 11px; color: #dc2626; margin-top: 5px; font-weight: 500; }
  .pass-strength { margin-top: 8px; }
  .pass-bars { display: flex; gap: 4px; margin-bottom: 4px; }
  .pass-bar { flex: 1; height: 3px; border-radius: 99px; background: rgba(211,150,140,0.2); transition: background 0.3s; }
  .pass-bar.weak { background: #ef4444; }
  .pass-bar.medium { background: #f59e0b; }
  .pass-bar.strong { background: #10b981; }
  .pass-label { font-size: 11px; font-weight: 600; }
  .pass-label.weak { color: #ef4444; }
  .pass-label.medium { color: #f59e0b; }
  .pass-label.strong { color: #10b981; }
  .error-msg { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #dc2626; font-size: 13px; font-weight: 500; padding: 10px 14px; border-radius: 10px; margin-bottom: 18px; }
  .submit-btn { width: 100%; padding: 15px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; box-shadow: 0 6px 20px rgba(211,150,140,0.35); transition: opacity 0.2s; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .submit-btn:hover { opacity: 0.88; }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .reg-footer { text-align: center; margin-top: 22px; font-size: 13px; color: rgba(16,86,102,0.55); }
  .reg-footer a { color: ${COLORS.secondary}; font-weight: 600; cursor: pointer; text-decoration: none; }
  .reg-footer a:hover { text-decoration: underline; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(247,244,213,0.4); border-top-color: ${COLORS.bg_light}; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 820px) {
    .reg-left { display: none; }
    .reg-right { width: 100%; border-radius: 0; padding: 48px 24px; }
  }
`;

function getPasswordStrength(pass) {
  if (pass.length === 0) return null;
  if (pass.length < 6) return "weak";
  if (pass.length < 8 || !/[0-9]/.test(pass)) return "medium";
  return "strong";
}

export default function Register({ onRegisterSuccess, onGoToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Nama wajib diisi";
    if (!form.email.includes("@")) errs.email = "Format email tidak valid";
    if (form.password.length < 6) errs.password = "Password minimal 6 karakter";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Password tidak cocok";
    return errs;
  };

  const handleChange = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      // 1. Register dulu
      await register(form.name, form.email, form.password);
      // 2. Langsung login setelah register berhasil
      const data = await login(form.email, form.password);
      onRegisterSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="reg-page">
        <div className="reg-left">
          <div className="reg-left-content">
            <span className="reg-illus">🎉</span>
            <div className="reg-left-title">Gabung sekarang,<br />makan lebih mudah!</div>
            <div className="reg-left-sub">Daftar gratis dan nikmati kemudahan pesan makan dari berbagai stan kantin.</div>
            <div className="reg-steps">
              <div className="reg-step"><div className="reg-step-num">1</div><div className="reg-step-text">Daftar dengan email dan password</div></div>
              <div className="reg-step"><div className="reg-step-num">2</div><div className="reg-step-text">Pilih menu dari berbagai stan</div></div>
              <div className="reg-step"><div className="reg-step-num">3</div><div className="reg-step-text">Checkout sekali, bayar selesai!</div></div>
            </div>
          </div>
        </div>

        <div className="reg-right">
          <div className="reg-right-inner">
            <div className="reg-brand">
              <span className="reg-brand-icon">🍽️</span>
              <span className="reg-brand-name">KantinKu</span>
            </div>
            <div className="reg-title">Buat Akun</div>
            <div className="reg-sub">Daftar sebagai pembeli — gratis!</div>

            {error && <div className="error-msg">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input className={`form-input ${fieldErrors.name ? "error" : ""}`} type="text" placeholder="Nama kamu" value={form.name} onChange={handleChange("name")} required />
                {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input className={`form-input ${fieldErrors.email ? "error" : ""}`} type="email" placeholder="contoh@email.com" value={form.email} onChange={handleChange("email")} required />
                {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input className={`form-input ${fieldErrors.password ? "error" : ""}`} type={showPass ? "text" : "password"} placeholder="Minimal 6 karakter" value={form.password} onChange={handleChange("password")} required style={{ paddingRight: 44 }} />
                  <button type="button" className="input-eye" onClick={() => setShowPass(p => !p)}>{showPass ? "🙈" : "👁️"}</button>
                </div>
                {form.password && (
                  <div className="pass-strength">
                    <div className="pass-bars">
                      <div className={`pass-bar ${strength ? strength : ""}`} />
                      <div className={`pass-bar ${strength === "medium" || strength === "strong" ? strength : ""}`} />
                      <div className={`pass-bar ${strength === "strong" ? "strong" : ""}`} />
                    </div>
                    <span className={`pass-label ${strength}`}>{strength === "weak" ? "Lemah" : strength === "medium" ? "Cukup" : "Kuat"}</span>
                  </div>
                )}
                {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <div className="input-wrap">
                  <input className={`form-input ${fieldErrors.confirmPassword ? "error" : ""}`} type={showConfirm ? "text" : "password"} placeholder="Ulangi password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} required style={{ paddingRight: 44 }} />
                  <button type="button" className="input-eye" onClick={() => setShowConfirm(p => !p)}>{showConfirm ? "🙈" : "👁️"}</button>
                </div>
                {fieldErrors.confirmPassword && <div className="field-error">{fieldErrors.confirmPassword}</div>}
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : "Daftar Sekarang"}
              </button>
            </form>

            <div className="reg-footer">
              Sudah punya akun? <a onClick={onGoToLogin}>Masuk di sini</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}