import { useState } from "react";
import { login } from "../../services/api";

const COLORS = {
  secondary: "#D3968C",
  accent: "#c07060",
  bg_light: "#F7F4D5",
  text_dark: "#105666",
  white: "#ffffff",
  overlay: "rgba(16,86,102,0.4)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }
  .login-page { display: flex; min-height: 100vh; }
  .login-left {
    flex: 1;
    background: linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 40px; position: relative; overflow: hidden;
  }
  .login-left::before { content: ''; position: absolute; top: -80px; right: -80px; width: 300px; height: 300px; background: rgba(247,244,213,0.12); border-radius: 50%; }
  .login-left::after { content: ''; position: absolute; bottom: -60px; left: -60px; width: 240px; height: 240px; background: rgba(16,86,102,0.12); border-radius: 50%; }
  .login-left-content { position: relative; z-index: 1; text-align: center; }
  .login-illus { font-size: 96px; margin-bottom: 24px; display: block; }
  .login-left-title { font-size: clamp(24px, 3vw, 32px); font-weight: 800; color: ${COLORS.bg_light}; margin-bottom: 12px; line-height: 1.2; }
  .login-left-sub { font-size: 15px; color: rgba(247,244,213,0.8); font-weight: 500; line-height: 1.6; max-width: 320px; }
  .login-left-tags { display: flex; gap: 10px; justify-content: center; margin-top: 24px; flex-wrap: wrap; }
  .login-tag { background: rgba(247,244,213,0.2); color: ${COLORS.bg_light}; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 99px; }
  .login-right { width: 480px; flex-shrink: 0; background: ${COLORS.white}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px; border-radius: 24px 0 0 24px; }
  .login-right-inner { width: 100%; max-width: 360px; }
  .login-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
  .login-brand-icon { font-size: 28px; }
  .login-brand-name { font-size: 20px; font-weight: 800; color: ${COLORS.text_dark}; }
  .login-title { font-size: 28px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 6px; }
  .login-sub { font-size: 14px; color: rgba(16,86,102,0.55); font-weight: 500; margin-bottom: 28px; }
  .role-toggle { display: flex; background: ${COLORS.bg_light}; border-radius: 12px; padding: 4px; gap: 4px; margin-bottom: 28px; }
  .role-btn { flex: 1; padding: 10px; border: none; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; color: rgba(16,86,102,0.55); background: transparent; }
  .role-btn.active { background: ${COLORS.white}; color: ${COLORS.text_dark}; box-shadow: 0 2px 8px rgba(211,150,140,0.15); }
  .form-group { margin-bottom: 18px; }
  .form-label { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; display: block; margin-bottom: 7px; }
  .form-input { width: 100%; padding: 13px 16px; border: 1.5px solid rgba(211,150,140,0.25); border-radius: 12px; font-size: 14px; font-family: 'Poppins', sans-serif; color: ${COLORS.text_dark}; background: ${COLORS.bg_light}; outline: none; transition: border 0.2s; }
  .form-input:focus { border-color: ${COLORS.secondary}; background: ${COLORS.white}; }
  .form-input::placeholder { color: rgba(16,86,102,0.3); }
  .input-wrap { position: relative; }
  .input-eye { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; color: rgba(16,86,102,0.4); }
  .input-hint { font-size: 11px; color: rgba(16,86,102,0.45); margin-top: 5px; }
  .error-msg { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #dc2626; font-size: 13px; font-weight: 500; padding: 10px 14px; border-radius: 10px; margin-bottom: 18px; }
  .submit-btn { width: 100%; padding: 15px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 14px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; box-shadow: 0 6px 20px rgba(211,150,140,0.35); transition: opacity 0.2s; margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .submit-btn:hover { opacity: 0.88; }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .login-footer { text-align: center; margin-top: 24px; font-size: 13px; color: rgba(16,86,102,0.55); }
  .login-footer a { color: ${COLORS.secondary}; font-weight: 600; cursor: pointer; text-decoration: none; }
  .login-footer a:hover { text-decoration: underline; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(247,244,213,0.4); border-top-color: ${COLORS.bg_light}; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 820px) {
    .login-left { display: none; }
    .login-right { width: 100%; border-radius: 0; padding: 48px 24px; }
  }
`;

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [role, setRole] = useState("buyer");
  const [email, setEmail] = useState("");
  const [kodeUnik, setKodeUnik] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Buyer pakai email, Seller pakai kode unik sebagai identifier
      const identifier = role === "buyer" ? email : kodeUnik;
      const data = await login(identifier, password);

      // data.user dari backend: { id, name, role }
      // Tambahkan kode_unik untuk seller biar bisa ditampilkan di sidebar
      const userData = {
        ...data.user,
        ...(role === "seller" ? { kode_unik: kodeUnik } : {}),
      };
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="login-page">
        <div className="login-left">
          <div className="login-left-content">
            <span className="login-illus">🍽️</span>
            <div className="login-left-title">
              Kantin Digital
              <br />
              UPN Veteran
            </div>
            <div className="login-left-sub">
              Pesan makanan dari berbagai stan kantin, bayar sekali, tanpa antre
              panjang.
            </div>
            <div className="login-left-tags">
              <span className="login-tag">🍛 Multi Stan</span>
              <span className="login-tag">💳 1x Bayar</span>
              <span className="login-tag">⚡ Realtime</span>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-right-inner">
            <div className="login-brand">
              <span className="login-brand-icon">🍽️</span>
              <span className="login-brand-name">Kantin Digital</span>
            </div>
            <div className="login-title">Masuk</div>
            <div className="login-sub">
              Pilih role dan masukkan kredensialmu
            </div>

            <div className="role-toggle">
              <button
                className={`role-btn ${role === "buyer" ? "active" : ""}`}
                onClick={() => {
                  setRole("buyer");
                  setError("");
                }}
                type="button"
              >
                🛒 Pembeli
              </button>
              <button
                className={`role-btn ${role === "seller" ? "active" : ""}`}
                onClick={() => {
                  setRole("seller");
                  setError("");
                }}
                type="button"
              >
                🏪 Penjual
              </button>
            </div>

            {error && <div className="error-msg">⚠️ {error}</div>}

            <form onSubmit={handleSubmit}>
              {role === "buyer" ? (
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Kode Unik Stan</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Contoh: STAN001"
                    value={kodeUnik}
                    onChange={(e) => setKodeUnik(e.target.value.toUpperCase())}
                    required
                  />
                  <div className="input-hint">
                    Kode unik diberikan oleh pengelola kantin
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <input
                    className="form-input"
                    type={showPass ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    className="input-eye"
                    onClick={() => setShowPass((p) => !p)}
                  >
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : (
                  `Masuk sebagai ${role === "buyer" ? "Pembeli" : "Penjual"}`
                )}
              </button>
            </form>

            {role === "buyer" && (
              <div className="login-footer">
                Belum punya akun?{" "}
                <a
                  onClick={() => {
                    console.log("REGISTER DIKLIK");
                    onGoToRegister();
                  }}
                >
                  Daftar sekarang
                </a>
              </div>
            )}
            {role === "seller" && (
              <div className="login-footer">
                Belum punya akun penjual? <a>Hubungi pengelola kantin</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
