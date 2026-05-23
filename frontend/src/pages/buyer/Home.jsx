import { useState, useEffect } from "react";
import {
  USER,
  STALLS as stalls,
  ALL_MENUS as allMenus,
  POPULAR_MENUS as popularMenus,
  DUMMY_NOTIFS as dummyNotifs,
  DUMMY_ORDERS,
  STATUS_CONFIG,
} from "../../data/DummyData";

// ── Derived dari dummyData ────────────────────────────────────────
const dummyActiveOrders = DUMMY_ORDERS.filter(
  (o) => o.status !== "ready" && o.status !== "cancelled"
).map((o) => ({
  id: o.id,
  total: o.total,
  status: o.status,
  items: o.items.map((i) => `${i.nama} ×${i.qty}`).join(", "),
  created_at: o.created_at,
}));

const statusLabel = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])
);

const fmt = (n) => "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// ── Theme Configuration ──────────────────────────────────────────
const COLORS = {
  primary: "#ffffff",
  secondary: "#D3968C",
  accent: "#c07060",
  bg_light: "#F7F4D5",
  text_dark: "#105666",
  white: "#ffffff",
  text_muted: "rgba(247,244,213,0.5)",
  overlay: "rgba(16,86,102,0.4)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }

  /* ── LAYOUT ── */
  .app { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: ${COLORS.primary};
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 200;
    transition: transform 0.3s;
    height: 100vh;
  }
  .sidebar-brand {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(247,244,213,0.1);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-brand-icon { font-size: 28px; }
  .sidebar-brand-name { font-size: 18px; font-weight: 800; color: ${COLORS.text_dark}; }
  .sidebar-brand-sub { font-size: 11px; color: ${COLORS.text_dark}; }

  .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }

  .sidebar-content-wrapper {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    scrollbar-width: thin;
    scrollbar-color: rgba(247,244,213,0.2) transparent;
  }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s;
    color: ${COLORS.text_dark}; font-size: 14px; font-weight: 500;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'Poppins', sans-serif; position: relative;
  }
  .nav-item:hover { background: rgba(16,86,102,0.05); color: ${COLORS.text_dark}; }
  .nav-item.active { background: ${COLORS.bg_light}; color: ${COLORS.text_dark}; font-weight: 700; }
  .nav-item-icon { font-size: 18px; flex-shrink: 0; }
  .nav-badge {
    position: absolute; right: 12px;
    background: ${COLORS.secondary}; color: white;
    font-size: 10px; font-weight: 700;
    min-width: 18px; height: 18px; border-radius: 99px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
  }

  .notif-panel {
    margin: 0 12px 8px;
    background: rgba(247,244,213,0.5);
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(247,244,213,0.9);
  }
  .notif-panel-title {
    font-size: 11px; font-weight: 700; color: ${COLORS.text_dark};
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
  }
  .notif-item {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 8px 0; border-bottom: 1px solid rgba(247,244,213,0.1);
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${COLORS.secondary}; flex-shrink: 0; margin-top: 5px;
  }
  .notif-dot.read { background: ${COLORS.text_dark}; }
  .notif-msg { font-size: 12px; color: ${COLORS.text_dark}; line-height: 1.4; }
  .notif-time { font-size: 10px; color: rgba(16,86,102,0.4); margin-top: 2px; }

  .active-order-panel {
    margin: 0 12px 12px;
    background: rgba(211,150,140,0.2);
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(211,150,140,0.25);
  }
  .aop-title {
    font-size: 11px; font-weight: 700; color: #D3968C;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
  }
  .aop-item { padding: 4px 0; }
  .aop-items-text { font-size: 12px; color: ${COLORS.text_dark}; margin-bottom: 4px; }
  .aop-status {
    display: inline-block;
    font-size: 11px; font-weight: 700;
    padding: 3px 10px; border-radius: 99px;
    background: rgba(211,150,140,0.25); color: #D3968C;
  }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(16,86,102,0.05);
  }
  .user-info {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: 12px;
    margin-bottom: 8px;
  }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #D3968C;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: #F7F4D5; font-weight: 700; flex-shrink: 0;
  }
  .user-name { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .user-email { font-size: 11px; color: rgba(16,86,102,0.5); }
  .logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s;
    color: ${COLORS.text_dark}; font-size: 13px; font-weight: 600;
    border: none; background: none; width: 100%;
    font-family: 'Poppins', sans-serif;
  }
  .logout-btn:hover { background: rgba(211,150,140,0.1); color: ${COLORS.secondary}; }

  /* ── MAIN CONTENT ── */
  .main-content {
    margin-left: 240px;
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
  }

  /* TOP BAR */
  .topbar {
    background: ${COLORS.white};
    padding: 0 24px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(211,150,140,0.15);
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-title { font-size: 18px; font-weight: 700; color: ${COLORS.text_dark}; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .cart-topbar-btn {
    display: flex; align-items: center; gap: 8px;
    background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 12px;
    padding: 9px 18px;
    font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    transition: opacity 0.2s; position: relative;
  }
  .cart-topbar-btn:hover { opacity: 0.88; }
  .cart-topbar-badge {
    background: ${COLORS.primary}; color:${COLORS.text_dark};
    font-size: 11px; font-weight: 700;
    width: 20px; height: 20px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
  }

  /* HERO */
  .hero {
    background: linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%);
    padding: 32px 32px 28px;
    position: relative; overflow: hidden;
  }
  .hero::before {
    content: ''; position: absolute;
    top: -60px; right: -60px;
    width: 240px; height: 240px;
    background: rgba(247,244,213,0.1); border-radius: 50%;
  }
  .hero-sub { font-size: 13px; color: rgba(247,244,213,0.8); font-weight: 500; margin-bottom: 4px; }
  .hero-title { font-size: clamp(20px, 3vw, 30px); font-weight: 800; color: #F7F4D5; margin-bottom: 18px; }
  .hero-search-wrap { max-width: 100%; position: relative; }
  .hero-search-ico { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 17px; }
  .hero-search-input {
    width: 100%; padding: 13px 18px 13px 46px;
    border-radius: 14px; border: none;
    color: #105666; font-size: 14px;
    font-family: 'Poppins', sans-serif; outline: none;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  }
  .hero-search-input::placeholder { color: rgba(16,86,102,0.38); }

  /* PAGE BODY */
  .page-body { padding: 28px 32px 100px; }

  /* STALL CHIPS */
  .chip-row {
    display: flex; gap: 10px; overflow-x: auto;
    padding-bottom: 4px; scrollbar-width: none; margin-bottom: 28px;
  }
  .chip-row::-webkit-scrollbar { display: none; }
  .chip {
    flex-shrink: 0; display: flex; align-items: center; gap: 8px;
    background: white; border: 2px solid transparent;
    border-radius: 50px; padding: 9px 18px;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(211,150,140,0.1);
  }
  .chip.active { background: ${COLORS.secondary}; border-color: ${COLORS.secondary}; }
  .chip:hover:not(.active) { border-color: #D3968C; }
  .chip-emo { font-size: 17px; }
  .chip-name { font-size: 13px; font-weight: 600; color: #105666; white-space: nowrap; }
  .chip.active .chip-name { color: ${COLORS.bg_light}; }
  .chip-ct {
    font-size: 11px; background: rgba(16,86,102,0.1);
    color: #105666; padding: 2px 8px; border-radius: 99px; font-weight: 600;
  }
  .chip.active .chip-ct { background: rgba(247,244,213,0.25); color: ${COLORS.bg_light}; }

  /* SECTION */
  .sec-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .sec-title { font-size: 18px; font-weight: 700; color: #105666; }
  .sec-link { font-size: 13px; color: #D3968C; font-weight: 600; background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; }

  /* POPULAR ROW */
  .pop-row {
    display: flex; gap: 16px; overflow-x: auto;
    padding-bottom: 8px; scrollbar-width: none; margin-bottom: 36px;
  }
  .pop-row::-webkit-scrollbar { display: none; }
  .pop-wrap { position: relative; flex-shrink: 0; }
  .pop-card {
    width: 190px; background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 4px 16px rgba(211,150,140,0.13); transition: transform 0.2s;
  }
  .pop-card:hover { transform: translateY(-4px); }
  .pop-img { width: 100%; height: 120px; object-fit: cover; }
  .pop-body { padding: 11px 13px 13px; }
  .pop-stall { font-size: 10px; color: #D3968C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .pop-name { font-size: 13px; font-weight: 700; color: #105666; margin-bottom: 5px; }
  .pop-price { font-size: 14px; font-weight: 800; color: #105666; }
  .pop-badge {
    position: absolute; top: 9px; left: 9px;
    background: #D3968C; color: white;
    font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 99px;
  }

  /* MENU GRID */
  .mgrid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
  }
  .mcard {
    background: white; border-radius: 18px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(211,150,140,0.1); transition: transform 0.2s;
  }
  .mcard:hover { transform: translateY(-3px); }
  .mcard-img { width: 100%; height: 130px; object-fit: cover; }
  .mcard-body { padding: 12px 13px 13px; }
  .mcard-stall { font-size: 10px; color: #D3968C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
  .mcard-name { font-size: 13px; font-weight: 700; color: #105666; margin-bottom: 4px; line-height: 1.3; }
  .mcard-price { font-size: 14px; font-weight: 800; color: #105666; margin-bottom: 10px; }
  .habis { font-size: 12px; color: #D3968C; font-weight: 600; text-align: center; padding: 7px; background: rgba(211,150,140,0.1); border-radius: 8px; }
  .add-btn {
    width: 100%; padding: 8px; background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 10px; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s;
  }
  .add-btn:hover { opacity: 0.85; }
  .qty-ctrl { display: flex; align-items: center; justify-content: space-between; background: rgba(211,150,140,0.1); border-radius: 10px; }
  .qty-btn {
    background: none; border: none; width: 32px; height: 32px;
    font-size: 17px; font-weight: 700; cursor: pointer; color: #D3968C;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; transition: background 0.15s; font-family: 'Poppins', sans-serif;
  }
  .qty-btn:hover { background: rgba(211,150,140,0.2); }
  .qty-num { font-size: 14px; font-weight: 700; color: #105666; min-width: 24px; text-align: center; }

  /* EMPTY */
  .empty { text-align: center; padding: 60px 20px; }
  .empty-emo { font-size: 52px; margin-bottom: 14px; }
  .empty-txt { font-size: 15px; font-weight: 500; color: #D3968C; }

  /* BOTTOM CART BAR */
  .bot-bar {
    position: fixed; bottom: 0; left: 240px; right: 0;
    padding: 12px 32px 20px;
    background: linear-gradient(to top, #F7F4D5 70%, transparent);
    z-index: 99; pointer-events: none;
  }
  .co-btn {
    max-width: 100%; width: 100%;
    display: flex; align-items: center; justify-content: space-between;
    background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 18px; padding: 15px 24px;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    box-shadow: 0 8px 28px rgba(211,150,140,0.45); transition: opacity 0.2s;
    pointer-events: all;
  }
  .co-btn:hover { opacity: 0.9; }
  .co-left { display: flex; align-items: center; gap: 12px; }
  .co-badge { background: ${COLORS.primary}; color: ${COLORS.text_dark}; font-size: 12px; font-weight: 700; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .co-label { font-size: 15px; font-weight: 700; color: #F7F4D5; }
  .co-price { font-size: 15px; font-weight: 800; color: rgba(247,244,213,0.9); }

  /* MOBILE HAMBURGER */
  .hamburger {
    display: none; background: none; border: none;
    font-size: 22px; cursor: pointer; color: #105666;
  }
  .sidebar-overlay {
    display: none; position: fixed; inset: 0;
    background: ${COLORS.overlay}; z-index: 190;
  }

  /* TOAST NOTIF */
  .toast {
    position: fixed; top: 80px; right: 24px;
    background: ${COLORS.primary}; color: ${COLORS.text_dark};
    padding: 14px 20px; border-radius: 14px;
    font-size: 13px; font-weight: 600;
    box-shadow: 0 8px 24px rgba(16,86,102,0.3);
    z-index: 999; display: flex; align-items: center; gap: 10px;
    animation: slideInRight 0.3s ease;
    max-width: 320px;
  }
  @keyframes slideInRight {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  /* LOGOUT MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: ${COLORS.overlay};
    display: flex; align-items: center; justify-content: center;
    z-index: 300; backdrop-filter: blur(4px); padding: 20px;
  }
  .modal {
    background: ${COLORS.bg_light}; border-radius: 24px; padding: 32px;
    width: 100%; max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: popIn 0.25s ease; text-align: center;
  }
  @keyframes popIn {
    from { transform: scale(0.92); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .modal-icon { font-size: 48px; margin-bottom: 14px; }
  .modal-title { font-size: 20px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: rgba(16,86,102,0.6); margin-bottom: 24px; line-height: 1.5; }
  .modal-btns { display: flex; gap: 12px; }
  .modal-cancel { flex: 1; padding: 13px; background: rgba(211,150,140,0.12); color: ${COLORS.text_dark}; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s; }
  .modal-cancel:hover { background: rgba(211,150,140,0.22); }
  .modal-confirm-logout { flex: 1; padding: 13px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 16px rgba(211,150,140,0.35); transition: opacity 0.2s; }
  .modal-confirm-logout:hover { opacity: 0.88; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .main-content { margin-left: 0; }
    .bot-bar { left: 0; padding: 12px 20px 18px; }
    .hamburger { display: block; }
    .page-body { padding: 20px 20px 100px; }
    .hero { padding: 24px 20px; }
  }
  @media (max-width: 600px) {
    .mgrid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .mcard-img { height: 105px; }
    .topbar { padding: 0 16px; height: 56px; }
    .notif-text, .cart-text { display: none; }
    .topbar-right { gap: 8px; }
    .cart-topbar-btn { padding: 8px 12px; }
  }
`;

export default function Home({
  cart,
  setCart,
  onGoToCart,
  onGoToStatus,
  onGoToHistory,
  onLogout,
}) {
  const [activeStall, setActiveStall] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Toast muncul SEKALI saat mount — [] dependency
  // TODO: ganti dengan Firestore onSnapshot
  useEffect(() => {
    const timer = setTimeout(() => {
      setToast("🍳 Pesanan #5 sedang dimasak!");
      setTimeout(() => setToast(null), 4000);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = allMenus.filter((m) => {
    const stallOk = activeStall ? m.stall_id === activeStall : true;
    const searchOk = m.nama.toLowerCase().includes(search.toLowerCase());
    return stallOk && searchOk;
  });

  const addToCart = (menu) =>
    setCart((p) => ({
      ...p,
      [menu.id]: { ...menu, qty: (p[menu.id]?.qty || 0) + 1 },
    }));
  const removeFromCart = (menu) =>
    setCart((p) => {
      const n = { ...p };
      if (n[menu.id]?.qty > 1)
        n[menu.id] = { ...n[menu.id], qty: n[menu.id].qty - 1 };
      else delete n[menu.id];
      return n;
    });

  const totalItems = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  const totalPrice = Object.values(cart).reduce(
    (a, b) => a + b.harga * b.qty,
    0
  );
  const showPopular = !search && !activeStall;
  const unreadNotifs = dummyNotifs.filter((n) => !n.read).length;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div
          className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* SIDEBAR — UI dipertahankan persis, hanya data diganti */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">🍽️</span>
            <div>
              <div className="sidebar-brand-name">Kantin Digital</div>
              <div className="sidebar-brand-sub">Kantin UPN</div>
            </div>
          </div>

          <div className="sidebar-content-wrapper">
            <nav className="sidebar-nav">
              <button
                className="nav-item active"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-item-icon">🏠</span> Menu
              </button>
              <button
                className="nav-item"
                onClick={() => {
                  onGoToCart();
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-item-icon">🛒</span> Keranjang
                {totalItems > 0 && (
                  <span className="nav-badge">{totalItems}</span>
                )}
              </button>
              <button
                className="nav-item"
                onClick={() => {
                  onGoToStatus();
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-item-icon">📋</span> Status Pesanan
                {dummyActiveOrders.length > 0 && (
                  <span className="nav-badge">{dummyActiveOrders.length}</span>
                )}
              </button>
              <button
                className="nav-item"
                onClick={() => {
                  onGoToHistory();
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-item-icon">🕐</span> Riwayat
              </button>
            </nav>

            {dummyActiveOrders.length > 0 && (
              <div className="active-order-panel">
                <div className="aop-title">⚡ Pesanan Aktif</div>
                {dummyActiveOrders.map((o) => (
                  <div className="aop-item" key={o.id}>
                    <div className="aop-items-text">{o.items}</div>
                    <span className="aop-status">{statusLabel[o.status]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="notif-panel">
              <div className="notif-panel-title">🔔 Notifikasi</div>
              {dummyNotifs.map((n) => (
                <div className="notif-item" key={n.id}>
                  <div className={`notif-dot ${n.read ? "read" : ""}`} />
                  <div>
                    <div className="notif-msg">{n.msg}</div>
                    <div className="notif-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">{USER.name[0]}</div>
              <div>
                <div className="user-name">{USER.name}</div>
                <div className="user-email">{USER.email}</div>
              </div>
            </div>
            {/* Logout sekarang buka modal dulu */}
            <button
              className="logout-btn"
              onClick={() => setShowLogoutModal(true)}
            >
              <span>🚪</span> Keluar
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="main-content">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                className="hamburger"
                onClick={() => setSidebarOpen(true)}
              >
                ☰
              </button>
              <span className="topbar-title">
                Selamat Datang, {USER.name.split(" ")[0]}! 👋
              </span>
            </div>
            <div className="topbar-right">
              {unreadNotifs > 0 && (
                <div
                  style={{
                    fontSize: 13,
                    color: "#D3968C",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  🔔 {unreadNotifs}{" "}
                  <span className="notif-text">notif baru</span>
                </div>
              )}
              <button className="cart-topbar-btn" onClick={onGoToCart}>
                🛒 <span className="cart-text">Keranjang</span>
                {totalItems > 0 && (
                  <span className="cart-topbar-badge">{totalItems}</span>
                )}
              </button>
            </div>
          </div>

          <div className="hero">
            <div className="hero-sub">Mau makan apa hari ini?</div>
            <div className="hero-title">
              Pesan dari berbagai stan, bayar sekali. 🎉
            </div>
            <div className="hero-search-wrap">
              <span className="hero-search-ico">🔍</span>
              <input
                className="hero-search-input"
                placeholder="Cari makanan atau minuman..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="page-body">
            <div className="chip-row">
              <div
                className={`chip ${!activeStall ? "active" : ""}`}
                onClick={() => setActiveStall(null)}
              >
                <span className="chip-emo">🍽️</span>
                <span className="chip-name">Semua Stan</span>
                <span className="chip-ct">{allMenus.length}</span>
              </div>
              {stalls.map((s) => (
                <div
                  key={s.id}
                  className={`chip ${activeStall === s.id ? "active" : ""}`}
                  onClick={() =>
                    setActiveStall(activeStall === s.id ? null : s.id)
                  }
                >
                  <span className="chip-emo">{s.emoji}</span>
                  <span className="chip-name">{s.name}</span>
                  <span className="chip-ct">{s.count}</span>
                </div>
              ))}
            </div>

            {showPopular && (
              <div style={{ marginBottom: 36 }}>
                <div className="sec-hd">
                  <span className="sec-title">🔥 Populer Hari Ini</span>
                  <button className="sec-link">Lihat semua</button>
                </div>
                <div className="pop-row">
                  {popularMenus.map((m) => (
                    <div key={m.id} className="pop-wrap">
                      <div className="pop-card">
                        <img
                          src={m.foto_url}
                          alt={m.nama}
                          className="pop-img"
                        />
                        <div className="pop-body">
                          <div className="pop-stall">{m.stall_name}</div>
                          <div className="pop-name">{m.nama}</div>
                          <div className="pop-price">{fmt(m.harga)}</div>
                        </div>
                      </div>
                      <div className="pop-badge">⭐ Terlaris</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sec-hd">
              <span className="sec-title">
                {search
                  ? `Hasil "${search}"`
                  : activeStall
                  ? stalls.find((s) => s.id === activeStall)?.name
                  : "Semua Menu"}
              </span>
              <span style={{ fontSize: 14, color: "#D3968C", fontWeight: 500 }}>
                {filtered.length} item
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-emo">🍽️</div>
                <div className="empty-txt">Menu tidak ditemukan</div>
              </div>
            ) : (
              <div className="mgrid">
                {filtered.map((m) => {
                  const qty = cart[m.id]?.qty || 0;
                  return (
                    <div key={m.id} className="mcard">
                      <img
                        src={m.foto_url}
                        alt={m.nama}
                        className="mcard-img"
                      />
                      <div className="mcard-body">
                        <div className="mcard-stall">{m.stall_name}</div>
                        <div className="mcard-name">{m.nama}</div>
                        <div className="mcard-price">{fmt(m.harga)}</div>
                        {m.stok === 0 ? (
                          <div className="habis">Stok habis</div>
                        ) : qty > 0 ? (
                          <div className="qty-ctrl">
                            <button
                              className="qty-btn"
                              onClick={() => removeFromCart(m)}
                            >
                              −
                            </button>
                            <span className="qty-num">{qty}</span>
                            <button
                              className="qty-btn"
                              onClick={() => addToCart(m)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="add-btn"
                            onClick={() => addToCart(m)}
                          >
                            + Tambah
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {totalItems > 0 && (
          <div className="bot-bar">
            <button className="co-btn" onClick={onGoToCart}>
              <div className="co-left">
                <div className="co-badge">{totalItems}</div>
                <span className="co-label">Lihat Keranjang</span>
              </div>
              <span className="co-price">{fmt(totalPrice)}</span>
            </button>
          </div>
        )}

        {toast && (
          <div className="toast">
            <span>🔔</span> {toast}
          </div>
        )}

        {/* LOGOUT MODAL */}
        {showLogoutModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowLogoutModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-icon">🚪</div>
              <div className="modal-title">Keluar dari akun?</div>
              <div className="modal-sub">
                Kamu akan keluar dari Kantin Digital.
                <br />
                Keranjang yang belum checkout akan hilang.
              </div>
              <div className="modal-btns">
                <button
                  className="modal-cancel"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Batal
                </button>
                <button
                  className="modal-confirm-logout"
                  onClick={() => {
                    setShowLogoutModal(false);
                    onLogout();
                  }}
                >
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
