import { useState, useEffect } from "react";
import {
  getSavedUser,
  getStallById,
  getOrders,
  getMenus,
  getStallEarnings,
  logout,
} from "../../services/api";
import { STATUS_CONFIG, STATUS_FLOW } from "../../data/DummyData";

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
    text-align: left; font-family: 'Poppins', sans-serif; position: relative;
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
    width: 100%; max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
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

const dashStyles = `
  .dash-root { font-family: 'Poppins', sans-serif; background-color: ${COLORS.beige}; min-height: 100vh; color: ${COLORS.darkGreen}; display: flex; }
  .dash-main { margin-left: 240px; flex: 1; min-width: 0; padding: 0; min-height: 100vh; box-sizing: border-box; overflow-x: hidden; display: flex; flex-direction: column; }
  .dash-inner { padding: 0 clamp(16px, 3vw, 40px) clamp(24px, 3vw, 40px); flex: 1; }
  .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 10px; }
  .dash-header h1 { font-size: clamp(18px, 2.2vw, 26px); font-weight: 800; color: ${COLORS.darkGreen}; margin: 0; }
  .dash-header p  { color: ${COLORS.mossGreen}; font-size: 13px; margin: 4px 0 0; font-weight: 500; }
  .dash-date-pill { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; font-size: 12px; font-weight: 500; padding: 8px 16px; border-radius: 20px; white-space: nowrap; }
  .dash-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: white; border-radius: 16px; padding: 22px 20px; position: relative; overflow: hidden; transition: transform 0.2s; box-shadow: 0 2px 12px rgba(10,51,35,0.06); }
  .stat-card:hover { transform: translateY(-3px); }
  .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; border-radius: 16px 16px 0 0; }
  .stat-card.green::before    { background: ${COLORS.darkGreen}; }
  .stat-card.moss::before     { background: ${COLORS.mossGreen}; }
  .stat-card.rosy::before     { background: ${COLORS.rosyBrown}; }
  .stat-card.midnight::before { background: ${COLORS.midnightGreen}; }
  .stat-icon   { font-size: 24px; margin-bottom: 12px; }
  .stat-label  { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .stat-value  { font-size: 28px; font-weight: 800; color: ${COLORS.darkGreen}; line-height: 1; margin-bottom: 6px; }
  .stat-change { font-size: 12px; font-weight: 500; color: ${COLORS.mossGreen}; }
  .dash-bottom-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
  .dash-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(10,51,35,0.06); }
  .dash-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .dash-card-header h3 { font-size: 15px; font-weight: 700; color: ${COLORS.darkGreen}; margin: 0; }
  .view-all-btn { font-size: 12px; color: ${COLORS.midnightGreen}; font-weight: 600; background: none; border: none; cursor: pointer; padding: 0; }
  .order-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0ede0; }
  .order-row:last-child { border-bottom: none; }
  .order-id     { font-size: 12px; color: #999; font-weight: 500; }
  .order-name   { font-size: 13px; font-weight: 600; color: ${COLORS.darkGreen}; margin-top: 2px; }
  .order-amount { font-size: 14px; font-weight: 700; color: ${COLORS.darkGreen}; }
  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .status-badge.pending  { background: rgba(245,158,11,0.15);   color: #f59e0b; }
  .status-badge.paid     { background: rgba(131,153,88,0.15);   color: ${COLORS.mossGreen}; }
  .status-badge.cooking  { background: rgba(211,150,140,0.18);  color: ${COLORS.rosyBrown}; }
  .status-badge.ready    { background: rgba(16,185,129,0.15);   color: #10b981; }
  .status-badge.cancelled{ background: rgba(239,68,68,0.1);     color: #ef4444; }
  .menu-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0ede0; }
  .menu-row:last-child { border-bottom: none; }
  .menu-img { width: 42px; height: 42px; border-radius: 10px; background: ${COLORS.beige}; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; overflow: hidden; }
  .menu-img img { width: 100%; height: 100%; object-fit: cover; }
  .menu-details h4 { font-size: 13px; font-weight: 600; color: ${COLORS.darkGreen}; margin: 0 0 2px; }
  .menu-details p  { font-size: 12px; color: #999; margin: 0; }
  .menu-price { font-size: 14px; font-weight: 700; color: ${COLORS.midnightGreen}; margin-left: auto; }
  .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 100px; margin-top: 8px; }
  .bar-wrap  { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
  .bar       { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .bar-label { font-size: 10px; color: #aaa; font-weight: 500; }
  .dash-loading { display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 15px; color: ${COLORS.mossGreen}; font-family: 'Poppins', sans-serif; }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1100px) {
    .seller-sidebar { width: 200px; }
    .dash-main { margin-left: 200px; }
    .dash-stats-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
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
    .dash-main { margin-left: 64px; }
  }
  @media (max-width: 600px) {
    .seller-sidebar { display: none; }
    .dash-main { margin-left: 0; }
    .dash-stats-grid { grid-template-columns: 1fr 1fr; }
    .dash-bottom-grid { grid-template-columns: 1fr; }
    .dash-header { flex-direction: column; align-items: flex-start; }
    .stat-value { font-size: 22px; }
  }

  .dash-topbar { background: white; padding: 0 clamp(16px, 3vw, 40px); height: 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(131,153,88,0.12); position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 4px rgba(10,51,35,0.06); box-sizing: border-box; flex-shrink: 0; }
  .dash-topbar-title { font-size: 17px; font-weight: 700; color: #0A3323; }
  .dash-topbar-right { display: flex; align-items: center; gap: 12px; }
  .seller-notif-btn { position: relative; display: flex; align-items: center; justify-content: center; background: rgba(131,153,88,0.12); color: #0A3323; border: none; border-radius: 12px; width: 42px; height: 42px; font-size: 18px; cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s; }
  .seller-notif-btn:hover { background: rgba(131,153,88,0.22); }
  .seller-notif-btn.has-notif { background: rgba(211,150,140,0.18); }
  .seller-notif-count { position: absolute; top: 4px; right: 4px; background: #D3968C; color: white; font-size: 9px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
  .seller-notif-panel { position: absolute; top: 54px; right: 0; width: 320px; background: white; border-radius: 18px; box-shadow: 0 8px 32px rgba(10,51,35,0.15); z-index: 200; overflow: hidden; }
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
  .seller-notif-toast { position: fixed; top: 80px; right: 24px; z-index: 999; max-width: 340px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(10,51,35,0.18); padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px; border-left: 4px solid #839958; }
  .seller-notif-toast-icon { font-size: 22px; flex-shrink: 0; }
  .seller-notif-toast-title { font-size: 13px; font-weight: 700; color: #0A3323; margin-bottom: 3px; }
  .seller-notif-toast-body { font-size: 12px; color: rgba(10,51,35,0.65); line-height: 1.4; }
  .seller-notif-toast-close { margin-left: auto; background: none; border: none; font-size: 16px; cursor: pointer; color: rgba(10,51,35,0.3); flex-shrink: 0; padding: 0 4px; }
  .seller-notif-toast-close:hover { color: #0A3323; }
`;

function formatRupiah(v) { return "Rp " + Number(v).toLocaleString("id-ID"); }

function buildDashboardStats(orders, menus, stall, earnings) {
  const totalPesanan = orders.length;
  const menuAktif    = menus.length;
  const stokRendah   = menus.filter((m) => m.stok < 5).length;
  return [
    { label: "Total Pendapatan", value: formatRupiah(earnings),  icon: "💰", change: "dari pesanan selesai", variant: "green" },
    { label: "Total Pesanan",    value: String(totalPesanan),     icon: "🛒", change: `${orders.filter(o => o.status !== "cancelled").length} aktif`, variant: "moss" },
    { label: "Menu Aktif",       value: String(menuAktif),        icon: "🍽️", change: stall?.nama_stan || "-", variant: "midnight" },
    { label: "Stok Rendah",      value: String(stokRendah),       icon: "⚠️", change: stokRendah > 0 ? "Perlu restock" : "Semua aman", variant: "rosy" },
  ];
}

function buildTopMenus(orders, menus) {
  const soldMap = {};
  orders.forEach((o) => {
    if (o.status === "cancelled" || !o.items) return;
    o.items.forEach((item) => {
      const key = item.nama || String(item.menu_id);
      soldMap[key] = (soldMap[key] || 0) + (item.qty || 1);
    });
  });
  // Sort semua menu berdasarkan penjualan terbanyak — otomatis update saat ada order baru
  return Object.entries(soldMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)  // tampilkan top 5, bisa naik/turun ranking otomatis
    .map(([nama, sold]) => {
      const menu = menus.find((m) => m.nama === nama);
      return { name: nama, sold, price: menu ? formatRupiah(menu.harga) : "-", foto_url: menu?.foto_url || "" };
    });
}

function buildSellerNotifs(orders) {
  return orders
    .filter((o) => o.status === "pending" || o.status === "cooking")
    .map((o) => ({
      text: o.status === "pending"
        ? `Pesanan #${o.id} masuk`
        : `Pesanan #${o.id} sedang dimasak`,
      time: o.created_at ? String(o.created_at).split("T")[1]?.slice(0, 5) || "" : "",
      isNew: o.status === "pending",
    }));
}

const weekData = [
  { day: "Sen", val: 60 }, { day: "Sel", val: 80 }, { day: "Rab", val: 45 },
  { day: "Kam", val: 90 }, { day: "Jum", val: 70 }, { day: "Sab", val: 100 },
  { day: "Min", val: 55 },
];

export default function Dashboard({ onNavigate }) {
  const [activeNav, setActiveNav]           = useState("dashboard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orders, setOrders]                 = useState([]);
  const [menus, setMenus]                   = useState([]);
  const [stall, setStall]                   = useState(null);
  const [earnings, setEarnings]             = useState(0);
  const [loading, setLoading]               = useState(true);

  const user    = getSavedUser();
  const stallId = user?.stall_id || 1;

  const [showNotifPanel, setShowNotifPanel] = useState(false);
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
  const maxVal  = Math.max(...weekData.map((d) => d.val));

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allOrders, allMenus, stallData, earningData] = await Promise.all([
          getOrders(),
          getMenus(),
          getStallById(stallId),
          getStallEarnings(stallId),
        ]);
        setOrders(allOrders);
        setMenus(allMenus.filter((m) => m.stall_id === stallId));
        setStall(stallData);
        setEarnings(earningData.total_earnings || 0);
      } catch (err) {
        console.error("Gagal load data dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [stallId]);


  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    let unsub = () => {};
    (async () => {
      const { requestNotifPermission, listenForegroundNotif } = await import("../../services/firebaseNotif");
      await requestNotifPermission();
      unsub = listenForegroundNotif(({ title, body, data }) => {
        const n = { title, body, data, time: new Date().toISOString(), read: false };
        setNotifs(prev => {
          const upd = [n, ...prev].slice(0, 30);
          try { localStorage.setItem("seller_notifs", JSON.stringify(upd)); } catch {}
          return upd;
        });
        setToastNotif(n);
        setTimeout(() => setToastNotif(null), 6000);
      });
    })().catch(console.warn);
    return () => unsub();
  }, [user?.id]);

  const handleNav = (key) => {
    setActiveNav(key);
    if (key === "logout") { logout(); }
    if (onNavigate) onNavigate(key);
  };

  const liveOrders   = orders.filter((o) => ["pending", "paid", "cooking"].includes(o.status));
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const notifications = buildSellerNotifs(orders);
  const stats         = buildDashboardStats(orders, menus, stall, earnings);
  const topMenus      = buildTopMenus(orders, menus);
  const recentOrders  = [...orders].sort((a, b) => b.id - a.id).slice(0, 3);

  if (loading) return <div className="dash-loading"><style>{sidebarStyles + dashStyles}</style>Memuat dashboard...</div>;

  return (
    <div className="dash-root">
      <style>{sidebarStyles + dashStyles}</style>

      <SellerSidebar
        active={activeNav}
        onNavigate={handleNav}
        liveOrders={liveOrders}
        notifications={notifications}
        pendingCount={pendingCount}
        onLogoutClick={() => setShowLogoutModal(true)}
        user={user}
      />

      <main className="dash-main">

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

      <div className="dash-topbar">
        <span className="dash-topbar-title">Dashboard</span>
        <div className="dash-topbar-right">
          {showNotifPanel && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowNotifPanel(false)} />}
          <div style={{ position: "relative" }}>
            <button
              className={`seller-notif-btn${unreadCount > 0 ? " has-notif" : ""}`}
              title="Notifikasi"
              onClick={() => setShowNotifPanel(p => {
                if (!p) setNotifs(prev => {
                  const upd = prev.map(n => ({ ...n, read: true }));
                  try { localStorage.setItem("seller_notifs", JSON.stringify(upd)); } catch {}
                  return upd;
                });
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

        <div className="dash-inner">
        <div className="dash-header" style={{ paddingTop: 28 }}>
          <div>
            <h1>Selamat Datang 👋</h1>
            <p>{stall?.nama_stan || "Stan"} · {user?.email || ""}</p>
          </div>
          <div className="dash-date-pill">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        <div className="dash-stats-grid">
          {stats.map((s) => (
            <div key={s.label} className={`stat-card ${s.variant}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-change">{s.change}</div>
            </div>
          ))}
        </div>

        <div className="dash-bottom-grid">
          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Pesanan Terbaru</h3>
              <button className="view-all-btn" onClick={() => handleNav("orders")}>Lihat Semua →</button>
            </div>
            {recentOrders.map((o) => (
              <div key={o.id} className="order-row">
                <div>
                  <div className="order-id">#{String(o.id).padStart(3, "0")} · {o.items?.map(i => `${i.nama} ×${i.qty}`).join(", ") || "-"}</div>
                  <div className="order-name">{o.buyer_id || "Pembeli"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="order-amount">{formatRupiah(o.total)}</div>
                  <span className={`status-badge ${o.status}`}>
                    {STATUS_CONFIG[o.status]?.icon} {STATUS_CONFIG[o.status]?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h3>🏆 Menu Terlaris</h3>
              <button className="view-all-btn" onClick={() => handleNav("menu")}>Kelola Menu →</button>
            </div>
            {topMenus.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: 13 }}>Belum ada data penjualan</p>
            ) : topMenus.map((m, idx) => {
              const maxSold = topMenus[0]?.sold || 1;
              const rankColors = ["#DAA520", "#A0A0A0", "#CD7F32"];
              const rankEmoji = ["🥇", "🥈", "🥉"];
              return (
                <div key={m.name} className="menu-row" style={{ alignItems: "center" }}>
                  <div style={{ width: 24, textAlign: "center", fontSize: 16, flexShrink: 0 }}>
                    {idx < 3 ? rankEmoji[idx] : <span style={{ color: "#aaa", fontSize: 12 }}>#{idx+1}</span>}
                  </div>
                  <div className="menu-img">
                    {m.foto_url ? <img src={m.foto_url} alt={m.name} /> : "🍴"}
                  </div>
                  <div className="menu-details" style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</h4>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 4, background: "#f0ede0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(m.sold / maxSold) * 100}%`, background: idx === 0 ? COLORS.darkGreen : COLORS.mossGreen, borderRadius: 99, transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap" }}>{m.sold} porsi</span>
                    </div>
                  </div>
                  <div className="menu-price">{m.price}</div>
                </div>
              );
            })}
          </div>

          <div className="dash-card" style={{ gridColumn: "1 / -1" }}>
            <div className="dash-card-header"><h3>Pendapatan Mingguan</h3></div>
            <div className="bar-chart">
              {weekData.map((d) => (
                <div key={d.day} className="bar-wrap">
                  <div
                    className="bar"
                    style={{
                      height: `${(d.val / maxVal) * 80}px`,
                      background: d.day === "Sab"
                        ? COLORS.darkGreen
                        : `linear-gradient(to top, ${COLORS.mossGreen}, ${COLORS.midnightGreen})`,
                    }}
                  />
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>{/* end dash-inner */}
      </main>

      {showLogoutModal && (
        <div className="seller-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="seller-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seller-modal-icon">🚪</div>
            <div className="seller-modal-title">Keluar dari akun?</div>
            <div className="seller-modal-sub">
              Kamu akan keluar dari Kantin Digital.<br />
              Pastikan semua pesanan sudah diproses.
            </div>
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