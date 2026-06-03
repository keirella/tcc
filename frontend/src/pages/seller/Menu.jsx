import { useState, useEffect, useCallback } from "react";
import {
  getSavedUser,
  getMyStall,
  getOrders,
  getMenus,
  addMenu,
  updateMenu,
  deleteMenu,
  logout,
} from "../../services/api";
import { STATUS_CONFIG } from "../../data/DummyData";

const COLORS = {
  darkGreen: "#0A3323",
  mossGreen: "#839958",
  beige: "#F7F4D5",
  rosyBrown: "#D3968C",
  midnightGreen: "#105666",
};

const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .seller-sidebar {
    width: 240px; background: ${COLORS.darkGreen};
    position: fixed; left: 0; top: 0; bottom: 0;
    display: flex; flex-direction: column; z-index: 10;
    font-family: 'Poppins', sans-serif; overflow-y: auto; height: 100vh;
  }
  .sb-logo {
    padding: 24px 20px 18px; border-bottom: 1px solid rgba(131,153,88,0.25);
    display: flex; align-items: center; gap: 12px;
  }
  .sb-logo-icon {
    width: 40px; height: 40px; background: rgba(131,153,88,0.2); border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;
  }
  .sb-logo h2 { color: ${COLORS.beige}; font-size: 16px; font-weight: 800; letter-spacing: -0.4px; margin: 0; line-height: 1.2; }
  .sb-logo span { color: ${COLORS.mossGreen}; font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; }
  .sb-nav { padding: 14px 10px; }
  .sb-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px; cursor: pointer;
    color: rgba(247,244,213,0.55); font-size: 14px; font-weight: 500;
    transition: all 0.2s; margin-bottom: 3px;
    border: none; background: none; width: 100%;
    text-align: left; font-family: 'Poppins', sans-serif;
  }
  .sb-nav-item:hover { background: rgba(131,153,88,0.18); color: ${COLORS.beige}; }
  .sb-nav-item.active { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; font-weight: 700; }
  .sb-nav-item .nav-icon { font-size: 17px; width: 20px; text-align: center; flex-shrink: 0; }
  .sb-nav-item .nav-badge {
    margin-left: auto; background: ${COLORS.rosyBrown}; color: white;
    font-size: 11px; font-weight: 700; min-width: 20px; height: 20px;
    border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 5px;
  }
  .sb-nav-item.active .nav-badge { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; }
  .sb-section {
    margin: 0 10px 4px; background: rgba(16,86,102,0.35);
    border-radius: 10px; padding: 12px 14px;
  }
  .sb-section-title {
    font-size: 10px; font-weight: 700; color: ${COLORS.mossGreen};
    letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .sb-section-title .dot {
    width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.rosyBrown};
    animation: blink 1.5s ease-in-out infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  .sb-order-item { margin-bottom: 8px; }
  .sb-order-item:last-child { margin-bottom: 0; }
  .sb-order-name { color: ${COLORS.beige}; font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .sb-order-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 99px;
  }
  .sb-order-status.paid    { background: rgba(131,153,88,0.2);  color: ${COLORS.mossGreen}; }
  .sb-order-status.cooking { background: rgba(211,150,140,0.2); color: ${COLORS.rosyBrown}; }
  .sb-order-status.ready   { background: rgba(16,86,102,0.3);   color: #7ec8d8; }
  .sb-order-status.pending { background: rgba(245,158,11,0.2);  color: #f59e0b; }
  .sb-empty-section { color: rgba(247,244,213,0.35); font-size: 11px; text-align: center; padding: 4px 0; }
  .sb-notif-title {
    font-size: 10px; font-weight: 700; color: ${COLORS.rosyBrown};
    letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .sb-notif-item {
    padding: 8px 0; border-bottom: 1px solid rgba(131,153,88,0.12);
    display: flex; gap: 8px; align-items: flex-start;
  }
  .sb-notif-item:last-child { border-bottom: none; padding-bottom: 0; }
  .sb-notif-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .sb-notif-dot.new  { background: ${COLORS.rosyBrown}; }
  .sb-notif-dot.read { background: rgba(247,244,213,0.2); }
  .sb-notif-text { color: rgba(247,244,213,0.7); font-size: 11px; line-height: 1.4; flex: 1; }
  .sb-notif-time { color: rgba(247,244,213,0.3); font-size: 10px; margin-top: 2px; }
  .sb-user-card {
    margin: 8px 10px;
    background: rgba(131,153,88,0.12); border: 1px solid rgba(131,153,88,0.2);
    border-radius: 10px; padding: 12px 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .sb-avatar {
    width: 36px; height: 36px; border-radius: 50%; background: ${COLORS.mossGreen};
    display: flex; align-items: center; justify-content: center;
    color: ${COLORS.darkGreen}; font-weight: 800; font-size: 14px; flex-shrink: 0;
  }
  .sb-user-name { color: ${COLORS.beige}; font-size: 12px; font-weight: 600; margin: 0 0 1px; }
  .sb-user-code { color: ${COLORS.mossGreen}; font-size: 10px; font-weight: 500; margin: 0; }
  .sb-logout {
    margin: 4px 10px 16px; display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px; cursor: pointer;
    color: rgba(247,244,213,0.4); font-size: 13px; font-weight: 500;
    border: 1px solid rgba(247,244,213,0.1); background: none;
    width: calc(100% - 20px); font-family: 'Poppins', sans-serif; transition: all 0.2s;
  }
  .sb-logout:hover { background: rgba(211,150,140,0.15); color: ${COLORS.rosyBrown}; border-color: rgba(211,150,140,0.3); }
  .seller-modal-overlay {
    position: fixed; inset: 0; background: rgba(10,51,35,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 300; backdrop-filter: blur(4px); padding: 20px;
  }
  .seller-modal {
    background: ${COLORS.beige}; border-radius: 24px; padding: 32px;
    width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: sellerPopIn 0.25s ease; text-align: center;
  }
  @keyframes sellerPopIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .seller-modal-icon { font-size: 48px; margin-bottom: 14px; }
  .seller-modal-title { font-size: 20px; font-weight: 800; color: ${COLORS.darkGreen}; margin-bottom: 8px; }
  .seller-modal-sub { font-size: 14px; color: rgba(10,51,35,0.6); margin-bottom: 24px; line-height: 1.5; }
  .seller-modal-btns { display: flex; gap: 12px; }
  .seller-modal-cancel {
    flex: 1; padding: 13px; background: rgba(211,150,140,0.12); color: ${COLORS.darkGreen};
    border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s;
  }
  .seller-modal-cancel:hover { background: rgba(211,150,140,0.22); }
  .seller-modal-confirm-logout {
    flex: 1; padding: 13px; background: ${COLORS.rosyBrown}; color: ${COLORS.beige};
    border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    box-shadow: 0 4px 16px rgba(211,150,140,0.35); transition: opacity 0.2s;
  }
  .seller-modal-confirm-logout:hover { opacity: 0.88; }
`;

const navItems = [
  { icon: "📊", label: "Dashboard", key: "dashboard" },
  { icon: "🍽️", label: "Menu",      key: "menu" },
  { icon: "📋", label: "Pesanan",   key: "orders" },
];

function buildSellerNotifs(orders) {
  return orders
    .filter((o) => o.status === "pending" || o.status === "cooking")
    .map((o) => ({
      text: o.status === "pending" ? `Pesanan #${o.id} masuk` : `Pesanan #${o.id} sedang dimasak`,
      time: o.created_at ? String(o.created_at).split("T")[1]?.slice(0, 5) || "" : "",
      isNew: o.status === "pending",
    }));
}

function SellerSidebar({ active, onNavigate, liveOrders = [], notifications = [], pendingCount = 0, onLogoutClick, user }) {
  return (
    <aside className="seller-sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">🍽️</div>
        <div><h2>Kantin Digital</h2><span>Seller Portal</span></div>
      </div>
      <nav className="sb-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`sb-nav-item${item.key === active ? " active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.key === "orders" && pendingCount > 0 && (
              <span className="nav-badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sb-section">
        <div className="sb-section-title"><span className="dot" />⚡ PESANAN AKTIF</div>
        {liveOrders.length === 0 ? (
          <p className="sb-empty-section">Belum ada pesanan aktif</p>
        ) : liveOrders.slice(0, 3).map((o) => (
          <div key={o.id} className="sb-order-item">
            <div className="sb-order-name">#{o.id} · {o.items?.[0]?.nama || "..."}{o.items?.length > 1 ? ` +${o.items.length - 1}` : ""}</div>
            <span className={`sb-order-status ${o.status}`}>
              {STATUS_CONFIG[o.status]?.icon} {STATUS_CONFIG[o.status]?.label}
            </span>
          </div>
        ))}
      </div>
      <div className="sb-section">
        <div className="sb-notif-title">🔔 NOTIFIKASI</div>
        {notifications.length === 0 ? (
          <p className="sb-empty-section">Tidak ada notifikasi baru</p>
        ) : notifications.slice(0, 3).map((n, i) => (
          <div key={i} className="sb-notif-item">
            <span className={`sb-notif-dot ${n.isNew ? "new" : "read"}`} />
            <div>
              <div className="sb-notif-text">{n.text}</div>
              <div className="sb-notif-time">{n.time}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="sb-user-card">
        <div className="sb-avatar">{(user?.name || "S")[0]}</div>
        <div>
          <p className="sb-user-name">{user?.name || "Seller"}</p>
          <p className="sb-user-code">{user?.email || ""}</p>
        </div>
      </div>
      <button className="sb-logout" onClick={onLogoutClick}>🚪 Keluar</button>
    </aside>
  );
}

const menuStyles = `
  .menu-root { font-family: 'Poppins', sans-serif; background-color: ${COLORS.beige}; min-height: 100vh; color: ${COLORS.darkGreen}; display: flex; }
  .menu-main { margin-left: 240px; flex: 1; min-width: 0; padding: 0; min-height: 100vh; box-sizing: border-box; overflow-x: hidden; display: flex; flex-direction: column; }
  .menu-inner { padding: clamp(16px, 3vw, 36px) clamp(16px, 3vw, 40px); flex: 1; }
  .menu-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
  .menu-header h1 { font-size: 26px; font-weight: 800; margin: 0 0 4px; }
  .menu-header p  { font-size: 13px; color: ${COLORS.mossGreen}; margin: 0; font-weight: 500; }
  .add-btn {
    background: ${COLORS.darkGreen}; color: ${COLORS.beige};
    border: none; padding: 12px 22px; border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  }
  .add-btn:hover { background: ${COLORS.midnightGreen}; transform: translateY(-1px); }
  .menu-search-row { display: flex; gap: 12px; margin-bottom: 24px; align-items: center; }
  .search-input {
    flex: 1; padding: 12px 18px;
    border: 2px solid rgba(10,51,35,0.1); border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: 13px;
    background: white; color: ${COLORS.darkGreen}; outline: none; transition: border 0.2s;
  }
  .search-input:focus { border-color: ${COLORS.mossGreen}; }
  .filter-btn {
    padding: 10px 18px; border-radius: 12px; border: 2px solid transparent;
    font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; background: white; color: #999; transition: all 0.2s;
  }
  .filter-btn.active { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; border-color: ${COLORS.mossGreen}; }

  /* ── Toast ── */
  .toast {
    position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%) translateY(0);
    background: ${COLORS.darkGreen}; color: ${COLORS.beige};
    padding: 13px 26px; border-radius: 14px; font-size: 14px; font-weight: 600;
    box-shadow: 0 8px 28px rgba(10,51,35,0.25); z-index: 999;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.2s forwards;
    display: flex; align-items: center; gap: 10px;
    font-family: 'Poppins', sans-serif;
  }
  .toast.success { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; }
  .toast.error   { background: ${COLORS.rosyBrown}; color: white; }
  @keyframes toastIn  { from { opacity:0; transform: translateX(-50%) translateY(16px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
  @keyframes toastOut { from { opacity:1; } to { opacity:0; transform: translateX(-50%) translateY(16px); } }

  .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .menu-card { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 14px rgba(10,51,35,0.07); transition: transform 0.2s, box-shadow 0.2s; position: relative; }
  .menu-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(10,51,35,0.12); }
  .menu-card-img {
    height: 160px;
    background: linear-gradient(135deg, ${COLORS.mossGreen}33, ${COLORS.midnightGreen}33);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
  }
  .menu-card-img img { width: 100%; height: 100%; object-fit: cover; }
  .menu-card-img .img-placeholder { font-size: 56px; }

  /* ── stock badge — clickable ── */
  .stock-badge {
    position: absolute; top: 12px; right: 12px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; font-family: 'Poppins', sans-serif;
    cursor: pointer; border: none; transition: opacity 0.15s, transform 0.15s;
    user-select: none;
  }
  .stock-badge:hover { opacity: 0.85; transform: scale(1.05); }
  .stock-badge:active { transform: scale(0.97); }
  .stock-badge.ok  { background: rgba(131,153,88,0.2);   color: ${COLORS.mossGreen}; }
  .stock-badge.low { background: rgba(211,150,140,0.25); color: ${COLORS.rosyBrown}; }
  .stock-badge.out { background: rgba(220,50,50,0.1);    color: #c0392b; }

  .menu-card-body { padding: 18px 20px; }
  .menu-card-name { font-size: 16px; font-weight: 700; color: ${COLORS.darkGreen}; margin: 0 0 4px; }
  .menu-card-meta { font-size: 12px; color: #aaa; margin: 0 0 14px; font-weight: 500; }
  .menu-card-footer { display: flex; align-items: center; justify-content: space-between; }
  .menu-price { font-size: 18px; font-weight: 800; color: ${COLORS.midnightGreen}; }
  .menu-actions { display: flex; gap: 8px; }
  .icon-btn { width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; transition: all 0.2s; }
  .icon-btn.edit   { background: rgba(16,86,102,0.1);   color: ${COLORS.midnightGreen}; }
  .icon-btn.edit:hover { background: rgba(16,86,102,0.2); }
  .icon-btn.delete { background: rgba(211,150,140,0.15); color: ${COLORS.rosyBrown}; }
  .icon-btn.delete:hover { background: rgba(211,150,140,0.3); }
  .stock-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .stock-label { font-size: 12px; color: #aaa; font-weight: 500; white-space: nowrap; }
  .stock-bar-bg { flex: 1; height: 6px; background: #f0ede0; border-radius: 10px; overflow: hidden; }
  .stock-bar-fill { height: 100%; border-radius: 10px; transition: width 0.6s ease; }
  .stock-count { font-size: 12px; font-weight: 700; white-space: nowrap; }

  /* ── Modal ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(10,51,35,0.45); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .modal { background: white; border-radius: 20px; padding: 32px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(10,51,35,0.2); }
  .modal h2 { font-size: 20px; font-weight: 800; color: ${COLORS.darkGreen}; margin: 0 0 24px; }
  .form-group { margin-bottom: 18px; }
  .form-group label { display: block; font-size: 12px; font-weight: 700; color: ${COLORS.darkGreen}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .form-input { width: 100%; padding: 11px 16px; border: 2px solid rgba(10,51,35,0.12); border-radius: 10px; font-family: 'Poppins', sans-serif; font-size: 13px; color: ${COLORS.darkGreen}; outline: none; transition: border 0.2s; box-sizing: border-box; }
  .form-input:focus { border-color: ${COLORS.mossGreen}; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .modal-actions { display: flex; gap: 12px; margin-top: 24px; justify-content: flex-end; }
  .cancel-btn { padding: 11px 22px; border-radius: 10px; border: 2px solid rgba(10,51,35,0.15); background: none; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; color: #999; cursor: pointer; transition: all 0.2s; }
  .cancel-btn:hover { border-color: ${COLORS.rosyBrown}; color: ${COLORS.rosyBrown}; }
  .save-btn { padding: 11px 28px; border-radius: 10px; border: none; background: ${COLORS.darkGreen}; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; color: ${COLORS.beige}; cursor: pointer; transition: all 0.2s; }
  .save-btn:hover { background: ${COLORS.midnightGreen}; }
  .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Stok toggle di dalam modal ── */
  .stok-toggle-group { display: flex; gap: 10px; margin-top: 4px; }
  .stok-toggle-btn {
    flex: 1; padding: 10px 8px; border-radius: 10px; border: 2px solid transparent;
    font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .stok-toggle-btn.ok   { background: rgba(131,153,88,0.12); color: ${COLORS.mossGreen}; border-color: rgba(131,153,88,0.2); }
  .stok-toggle-btn.ok.selected   { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; border-color: ${COLORS.mossGreen}; }
  .stok-toggle-btn.low  { background: rgba(211,150,140,0.12); color: ${COLORS.rosyBrown}; border-color: rgba(211,150,140,0.2); }
  .stok-toggle-btn.low.selected  { background: ${COLORS.rosyBrown}; color: white; border-color: ${COLORS.rosyBrown}; }
  .stok-toggle-btn.out  { background: rgba(220,50,50,0.08); color: #c0392b; border-color: rgba(220,50,50,0.15); }
  .stok-toggle-btn.out.selected  { background: #e74c3c; color: white; border-color: #e74c3c; }

  /* ── Stok hint di bawah input ── */
  .stok-hint { font-size: 11px; margin-top: 6px; font-weight: 500; }
  .stok-hint.ok  { color: ${COLORS.mossGreen}; }
  .stok-hint.low { color: ${COLORS.rosyBrown}; }
  .stok-hint.out { color: #e74c3c; }

  .empty-state { text-align: center; padding: 60px 20px; color: #bbb; grid-column: 1/-1; }
  .empty-state .emoji { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px; color: ${COLORS.darkGreen}; }
  .empty-state p  { font-size: 13px; margin: 0; }
  .foto-preview { margin-top: 10px; border-radius: 10px; overflow: hidden; height: 120px; background: #f0ede0; display: flex; align-items: center; justify-content: center; }
  .foto-preview img { width: 100%; height: 100%; object-fit: cover; }
  .foto-preview .no-img { font-size: 32px; color: #ccc; }

  .loading-overlay {
    position: fixed; inset: 0; background: rgba(10,51,35,0.15);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; font-family: 'Poppins', sans-serif;
  }
  .loading-spinner {
    background: white; border-radius: 16px; padding: 24px 32px;
    font-size: 14px; color: ${COLORS.darkGreen}; font-weight: 600;
    box-shadow: 0 8px 32px rgba(10,51,35,0.12);
  }

  .menu-topbar { background: white; padding: 0 clamp(16px, 3vw, 40px); height: 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(131,153,88,0.12); position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 4px rgba(10,51,35,0.06); box-sizing: border-box; flex-shrink: 0; }
  .menu-topbar-title { font-size: 17px; font-weight: 700; color: #0A3323; }
  .menu-topbar-right { display: flex; align-items: center; gap: 12px; }
  .seller-notif-btn { position: relative; display: flex; align-items: center; justify-content: center; background: rgba(131,153,88,0.12); color: #0A3323; border: none; border-radius: 12px; width: 42px; height: 42px; font-size: 18px; cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s; }
  .seller-notif-btn:hover { background: rgba(131,153,88,0.22); }
  .seller-notif-btn.has-notif { background: rgba(211,150,140,0.18); }
  .seller-notif-count { position: absolute; top: 4px; right: 4px; background: #D3968C; color: white; font-size: 9px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
  .seller-notif-panel { position: absolute; top: 54px; right: 0; width: 320px; background: white; border-radius: 18px; box-shadow: 0 8px 32px rgba(10,51,35,0.15); z-index: 200; overflow: hidden; animation: menuPopIn 0.2s ease; }
  @keyframes menuPopIn { from { transform: scale(0.95) translateY(-8px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
  .seller-notif-hdr { padding: 16px 18px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(131,153,88,0.12); }
  .seller-notif-hdr-title { font-size: 15px; font-weight: 700; color: #0A3323; }
  .seller-notif-hdr-close { background: none; border: none; font-size: 18px; cursor: pointer; color: rgba(10,51,35,0.4); padding: 2px 6px; border-radius: 6px; font-family: 'Poppins', sans-serif; }
  .seller-notif-hdr-close:hover { background: rgba(131,153,88,0.1); }
  .seller-notif-list { max-height: 340px; overflow-y: auto; }
  .seller-notif-row { display: flex; gap: 12px; padding: 13px 18px; border-bottom: 1px solid rgba(131,153,88,0.07); align-items: flex-start; transition: background 0.15s; }
  .seller-notif-row:last-child { border-bottom: none; }
  .seller-notif-row.unread { background: rgba(131,153,88,0.05); }
  .seller-notif-row:hover { background: rgba(131,153,88,0.08); }
  .seller-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #D3968C; flex-shrink: 0; margin-top: 5px; }
  .seller-notif-dot.read { background: rgba(10,51,35,0.2); }
  .seller-notif-msg { font-size: 13px; color: #0A3323; line-height: 1.45; font-weight: 500; margin-bottom: 3px; }
  .seller-notif-time { font-size: 11px; color: rgba(10,51,35,0.4); }
  .seller-notif-empty { padding: 32px 18px; text-align: center; font-size: 13px; color: rgba(10,51,35,0.4); }
  .seller-notif-toast { position: fixed; top: 80px; right: 24px; z-index: 999; max-width: 340px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(10,51,35,0.18); padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px; animation: sellerSlideIn 0.3s ease; border-left: 4px solid #839958; }
  @keyframes sellerSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .seller-notif-toast-icon { font-size: 22px; flex-shrink: 0; }
  .seller-notif-toast-title { font-size: 13px; font-weight: 700; color: #0A3323; margin-bottom: 3px; }
  .seller-notif-toast-body { font-size: 12px; color: rgba(10,51,35,0.65); line-height: 1.4; }
  .seller-notif-toast-close { margin-left: auto; background: none; border: none; font-size: 16px; cursor: pointer; color: rgba(10,51,35,0.3); flex-shrink: 0; padding: 0 4px; }
  .seller-notif-toast-close:hover { color: #0A3323; }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1100px) {
    .seller-sidebar { width: 200px; }
    .menu-main { margin-left: 200px; }
  }
  @media (max-width: 860px) {
    .seller-sidebar { width: 64px; overflow: hidden; }
    .seller-sidebar .sb-logo h2,
    .seller-sidebar .sb-logo span,
    .seller-sidebar .sb-nav-item span:not(.nav-icon):not(.nav-badge),
    .seller-sidebar .sb-section,
    .seller-sidebar .sb-user-card p,
    .seller-sidebar .sb-logout span { display: none; }
    .seller-sidebar .sb-logo { padding: 16px 12px; justify-content: center; }
    .seller-sidebar .sb-nav { padding: 10px 8px; }
    .seller-sidebar .sb-nav-item { padding: 12px; justify-content: center; }
    .seller-sidebar .sb-user-card { padding: 10px; justify-content: center; }
    .seller-sidebar .sb-logout { padding: 10px; justify-content: center; width: calc(100% - 16px); }
    .menu-main { margin-left: 64px; }
    .menu-grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
  }
  @media (max-width: 600px) {
    .seller-sidebar { display: none; }
    .menu-main { margin-left: 0; }
    .menu-grid { grid-template-columns: 1fr; }
    .form-row { grid-template-columns: 1fr; }
  }
`;

function getStockStatus(stok) {
  if (stok < 5) return { label: "⚠️ Stok Rendah", cls: "low" };
  return              { label: "✅ Stok Aman",    cls: "ok"  };
}
function formatRupiah(val) { return "Rp " + Number(val).toLocaleString("id-ID"); }

// ── Stok status dari angka ──
function getStokClass(stok) {
  const n = Number(stok);
  if (n < 5) return "low";
  return "ok";
}

export default function Menu({ onNavigate }) {
  const [menus, setMenus]                     = useState([]);
  const [orders, setOrders]                   = useState([]);
  const [search, setSearch]                   = useState("");
  const [filter, setFilter]                   = useState("all");
  const [showModal, setShowModal]             = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editing, setEditing]                 = useState(null);
  const [form, setForm]                       = useState({ nama: "", harga: "", stok: "", foto_url: "" });
  const [activeNav, setActiveNav]             = useState("menu");
  const [saving, setSaving]                   = useState(false);
  const [loadingMenus, setLoadingMenus]       = useState(false);
  const [toast, setToast]                     = useState(null); // { msg, type }

  const user    = getSavedUser();

  const [showNotifPanel, setShowNotifPanel]   = useState(false);
  const [notifs, setNotifs] = useState(() => {
    try { const s = localStorage.getItem("seller_notifs"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [toastNotif, setToastNotif] = useState(null);

  const unreadCount = notifs.filter(n => !n.read).length;
  const fmtRelative = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60000) return "Baru saja";
    if (diff < 3600000) return Math.floor(diff / 60000) + " mnt lalu";
    if (diff < 86400000) return Math.floor(diff / 3600000) + " jam lalu";
    return Math.floor(diff / 86400000) + " hari lalu";
  };

  // ── Toast helper ──
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Load semua data dari API ──
  // const loadData = useCallback(async () => {
  //   try {
  //     setLoadingMenus(true);
  //     const [allMenus, allOrders] = await Promise.all([getMenus(), getOrders()]);
  //     setMenus(allMenus.filter((m) => m.stall_id === stallId));
  //     setOrders(allOrders);
  //   } catch (err) {
  //     console.error("Gagal load data menu:", err);
  //     showToast("Gagal memuat data menu", "error");
  //   } finally {
  //     setLoadingMenus(false);
  //   }
  // }, [stallId, showToast]);

  const loadData = useCallback(async () => {
    try {
      setLoadingMenus(true);
      const stallData = await getMyStall();       // ← fetch stall dulu
      const stallId = stallData.id;               // ← ambil id dari sini
      const [allMenus, allOrders] = await Promise.all([getMenus(), getOrders(stallId)]);
      setMenus(allMenus.filter((m) => m.stall_id === stallId));
      setOrders(allOrders);
    } catch (err) {
      console.error("Gagal load data menu:", err);
      showToast("Gagal memuat data menu", "error");
    } finally {
      setLoadingMenus(false);
    }
  }, [showToast]);

  // ── Silent refresh untuk polling (tidak trigger loading indicator) ──
  // const silentRefresh = useCallback(async () => {
  //   try {
  //     const [allMenus, allOrders] = await Promise.all([getMenus(), getOrders()]);
  //     setMenus(allMenus.filter((m) => m.stall_id === stallId));
  //     setOrders(allOrders);
  //   } catch (err) {
  //     console.error("Silent refresh gagal:", err);
  //   }
  // }, [stallId]);

  const silentRefresh = useCallback(async () => {
    try {
      const stallData = await getMyStall();
      const stallId = stallData.id;
      const [allMenus, allOrders] = await Promise.all([getMenus(), getOrders(stallId)]);
      setMenus(allMenus.filter((m) => m.stall_id === stallId));
      setOrders(allOrders);
    } catch (err) {
      console.error("Silent refresh gagal:", err);
    }
  }, []);  

  useEffect(() => { loadData(); }, [loadData]);

  // ── Auto-refresh stok setiap 10 detik (silent, tanpa loading flicker) ──
  useEffect(() => {
    const interval = setInterval(() => { silentRefresh(); }, 10000);
    return () => clearInterval(interval);
  }, [silentRefresh]);

  const liveOrders    = orders.filter((o) => ["pending", "paid", "cooking"].includes(o.status));
  const pendingCount  = orders.filter((o) => o.status === "pending").length;
  const notifications = buildSellerNotifs(orders);


  // Firebase foreground notif untuk seller
  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    let unsubscribe = () => {};
    const setup = async () => {
      const { requestNotifPermission, listenForegroundNotif } = await import("../../services/firebaseNotif");
      await requestNotifPermission();
      unsubscribe = listenForegroundNotif(({ title, body, data }) => {
        const newNotif = { title, body, data, time: new Date().toISOString(), read: false };
        setNotifs(prev => {
          const updated = [newNotif, ...prev].slice(0, 30);
          try { localStorage.setItem("seller_notifs", JSON.stringify(updated)); } catch {}
          return updated;
        });
        setToastNotif(newNotif);
        setTimeout(() => setToastNotif(null), 6000);
      });
    };
    setup().catch(console.warn);
    return () => unsubscribe();
  }, [user?.id]);

  const handleNav = (key) => {
    setActiveNav(key);
    if (key === "logout") { logout(); }
    if (onNavigate) onNavigate(key);
  };

  const filtered = menus.filter((m) => {
    const matchSearch = m.nama.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "low" && m.stok < 5) ||
      (filter === "ok"  && m.stok >= 5);
    return matchSearch && matchFilter;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({ nama: "", harga: "", stok: "", foto_url: "" });
    setShowModal(true);
  };

  const openEdit = (m) => {
    setEditing(m.id);
    setForm({ nama: m.nama, harga: m.harga, stok: m.stok, foto_url: m.foto_url || "" });
    setShowModal(true);
  };

  // ── Point 1 fix: reload dari API setelah save ──
  const handleSave = async () => {
    if (!form.nama.trim() || !form.harga) {
      showToast("Nama dan harga wajib diisi!", "error");
      return;
    }
    setSaving(true);
    try {
      const stallData = await getMyStall();
      const payload = {
        nama:     form.nama.trim(),
        harga:    Number(form.harga),
        stok:     Number(form.stok) || 0,
        foto_url: form.foto_url.trim(),
        stall_id: stallData.id, // dari getMyStall
      };

      if (editing) {
        await updateMenu(editing, payload);
        showToast(`Menu "${payload.nama}" berhasil diperbarui ✏️`);
      } else {
        await addMenu(payload);
        showToast(`Menu "${payload.nama}" berhasil ditambahkan ✅`);
      }

      setShowModal(false);
      // Reload dari API supaya state benar-benar sinkron dengan database
      await loadData();
    } catch (err) {
      showToast("Gagal menyimpan: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus menu "${nama}"?`)) return;
    try {
      await deleteMenu(id);
      setMenus((prev) => prev.filter((m) => m.id !== id));
      showToast(`Menu "${nama}" dihapus 🗑️`);
    } catch (err) {
      showToast("Gagal menghapus: " + err.message, "error");
    }
  };

  // ── Point 2: klik badge stok di card → langsung filter ──
  const handleBadgeClick = (cls) => {
    if (cls === "ok")  { setFilter("ok");  return; }
    if (cls === "low") { setFilter("low"); return; }
  };

  // ── stok status saat ini di form (real-time) ──
  const formStokCls  = getStokClass(form.stok);
  const formStokHint = formStokCls === "ok"
    ? "✅ Stok Aman"
    : "⚠️ Stok Rendah (kurang dari 5)";

  return (
    <div className="menu-root">
      <style>{sidebarStyles + menuStyles}</style>

      {/* Toast notif seller */}
      {toastNotif && (
        <div className="seller-notif-toast">
          <span className="seller-notif-toast-icon">🔔</span>
          <div>
            {toastNotif.title && <div className="seller-notif-toast-title">{toastNotif.title}</div>}
            <div className="seller-notif-toast-body">{toastNotif.body}</div>
          </div>
          <button className="seller-notif-toast-close" onClick={() => setToastNotif(null)}>✕</button>
        </div>
      )}


      <SellerSidebar
        active={activeNav}
        onNavigate={handleNav}
        liveOrders={liveOrders}
        notifications={notifications}
        pendingCount={pendingCount}
        onLogoutClick={() => setShowLogoutModal(true)}
        user={user}
      />

      {/* Toast notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}

      <main className="menu-main">
        {/* Topbar dengan tombol notifikasi */}
        <div className="menu-topbar">
          <span className="menu-topbar-title">Kelola Menu 🍽️</span>
          <div className="menu-topbar-right">
            {showNotifPanel && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowNotifPanel(false)} />}
            <div style={{ position: "relative" }}>
              <button
                className={`seller-notif-btn${unreadCount > 0 ? " has-notif" : ""}`}
                title="Notifikasi"
                onClick={() => setShowNotifPanel(p => {
                  if (!p) {
                    setNotifs(prev => {
                      const updated = prev.map(n => ({ ...n, read: true }));
                      try { localStorage.setItem("seller_notifs", JSON.stringify(updated)); } catch {}
                      return updated;
                    });
                  }
                  return !p;
                })}
              >
                🔔
                {unreadCount > 0 && <span className="seller-notif-count">{unreadCount}</span>}
              </button>
              {showNotifPanel && (
                <div className="seller-notif-panel">
                  <div className="seller-notif-hdr">
                    <span className="seller-notif-hdr-title">🔔 Notifikasi</span>
                    <button className="seller-notif-hdr-close" onClick={() => setShowNotifPanel(false)}>✕</button>
                  </div>
                  <div className="seller-notif-list">
                    {notifs.length === 0 ? (
                      <div className="seller-notif-empty">Belum ada notifikasi</div>
                    ) : notifs.map((n, i) => (
                      <div key={i} className={`seller-notif-row${n.read ? "" : " unread"}`}>
                        <div className={`seller-notif-dot${n.read ? " read" : ""}`} />
                        <div>
                          <div className="seller-notif-msg">{n.title && <strong>{n.title} — </strong>}{n.body}</div>
                          <div className="seller-notif-time">{fmtRelative(n.time)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="menu-inner">
        <div className="menu-header" style={{ paddingTop: 32 }}>
          <div>
            <h1>Kelola Menu 🍽️</h1>
            <p>{user?.name || "Seller"} · {menus.length} menu tersedia</p>
          </div>
          <button className="add-btn" onClick={openAdd}>＋ Tambah Menu</button>
        </div>

        {/* ── Filter bar ── */}
        <div className="menu-search-row">
          <input
            className="search-input"
            placeholder="🔍 Cari menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {[
            { key: "all", label: "Semua" },
            { key: "ok",  label: "✅ Stok Aman" },
            { key: "low", label: "⚠️ Stok Rendah" },
          ].map((f) => (
            <button
              key={f.key}
              className={`filter-btn${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loadingMenus ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.mossGreen, fontFamily: "'Poppins', sans-serif" }}>
            Memuat menu...
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="emoji">🍽️</div>
                <h3>Belum ada menu</h3>
                <p>{filter === "all" ? "Tambah menu pertama kamu!" : "Tidak ada menu dengan filter ini."}</p>
              </div>
            ) : filtered.map((m) => {
              const { label, cls } = getStockStatus(m.stok);
              const barColor = cls === "low" ? COLORS.rosyBrown : COLORS.mossGreen;
              const barWidth = Math.min(100, (m.stok / 30) * 100);
              return (
                <div key={m.id} className="menu-card">
                  <div className="menu-card-img">
                    {m.foto_url
                      ? <img src={m.foto_url} alt={m.nama} />
                      : <span className="img-placeholder">🍴</span>}

                    {/* ── Point 2: badge stok bisa diklik → filter ── */}
                    <button
                      className={`stock-badge ${cls}`}
                      onClick={() => handleBadgeClick(cls)}
                      title={`Klik untuk filter "${label}"`}
                    >
                      {label}
                    </button>
                  </div>
                  <div className="menu-card-body">
                    <div className="menu-card-name">{m.nama}</div>
                    <div className="menu-card-meta">{m.stall_name || user?.name || "Stan"}</div>
                    <div className="stock-row">
                      <span className="stock-label">Stok</span>
                      <div className="stock-bar-bg">
                        <div className="stock-bar-fill" style={{ width: `${barWidth}%`, background: barColor }} />
                      </div>
                      <span className="stock-count" style={{ color: barColor }}>{m.stok}</span>
                    </div>
                    <div className="menu-card-footer">
                      <span className="menu-price">{formatRupiah(m.harga)}</span>
                      <div className="menu-actions">
                        <button className="icon-btn edit"   onClick={() => openEdit(m)}              title="Edit">✏️</button>
                        <button className="icon-btn delete" onClick={() => handleDelete(m.id, m.nama)} title="Hapus">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>{/* end menu-inner */}
      </main>

      {/* ── Modal Tambah / Edit ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "✏️ Edit Menu" : "➕ Tambah Menu Baru"}</h2>

            <div className="form-group">
              <label>Nama Menu</label>
              <input
                className="form-input"
                placeholder="Contoh: Nasi Rendang"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Harga (Rp)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="15000"
                  value={form.harga}
                  onChange={(e) => setForm({ ...form, harga: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Stok</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  placeholder="20"
                  value={form.stok}
                  onChange={(e) => setForm({ ...form, stok: e.target.value })}
                />
                {/* ── Point 2: hint status stok real-time ── */}
                {form.stok !== "" && (
                  <div className={`stok-hint ${formStokCls}`}>{formStokHint}</div>
                )}
              </div>
            </div>

            {/* ── Point 2: tombol shortcut atur stok di modal ── */}
            <div className="form-group">
              <label>Atur Status Stok Cepat</label>
              <div className="stok-toggle-group">
                <button
                  type="button"
                  className={`stok-toggle-btn ok${formStokCls === "ok" ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, stok: 20 })}
                >
                  ✅ Stok Aman (set 20)
                </button>
                <button
                  type="button"
                  className={`stok-toggle-btn low${formStokCls === "low" ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, stok: 3 })}
                >
                  ⚠️ Rendah (set 3)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>URL Foto</label>
              <input
                className="form-input"
                placeholder="https://..."
                value={form.foto_url}
                onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
              />
              <div className="foto-preview">
                {form.foto_url
                  ? <img src={form.foto_url} alt="preview" onError={(e) => { e.target.style.display = "none"; }} />
                  : <span className="no-img">🖼️</span>}
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Batal</button>
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Tambah Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Logout ── */}
      {showLogoutModal && (
        <div className="seller-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="seller-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seller-modal-icon">🚪</div>
            <div className="seller-modal-title">Keluar dari akun?</div>
            <div className="seller-modal-sub">Kamu akan keluar dari Kantin Digital.<br />Pastikan semua pesanan sudah diproses.</div>
            <div className="seller-modal-btns">
              <button className="seller-modal-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="seller-modal-confirm-logout" onClick={() => { setShowLogoutModal(false); handleNav("logout"); }}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}