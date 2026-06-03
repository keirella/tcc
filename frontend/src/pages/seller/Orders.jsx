import { useState, useEffect } from "react";
import {
  getSavedUser,
  getMyStall,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
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
    width: 240px; background: ${COLORS.darkGreen}; min-height: 100vh;
    position: fixed; left: 0; top: 0;
    display: flex; flex-direction: column; z-index: 10;
    font-family: 'Poppins', sans-serif; overflow-y: auto;
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
      <div style={{ flex: 1 }} />
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

const ordersStyles = `
  .orders-root { font-family: 'Poppins', sans-serif; background-color: ${COLORS.beige}; min-height: 100vh; color: ${COLORS.darkGreen}; display: flex; }
  .orders-main { margin-left: 240px; padding: 0; min-height: 100vh; flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .orders-content { padding: clamp(16px, 3vw, 28px) clamp(16px, 3vw, 40px) clamp(24px, 3vw, 40px); flex: 1; }
  .orders-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
  .orders-header h1 { font-size: clamp(18px, 2.2vw, 26px); font-weight: 800; margin: 0 0 4px; }
  .orders-header p  { font-size: 13px; color: ${COLORS.mossGreen}; margin: 0; font-weight: 500; }
  .export-btn { background: white; color: ${COLORS.darkGreen}; border: 2px solid rgba(10,51,35,0.12); padding: 11px 20px; border-radius: 12px; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; white-space: nowrap; flex-shrink: 0; }
  .export-btn:hover { border-color: ${COLORS.mossGreen}; color: ${COLORS.mossGreen}; background: rgba(131,153,88,0.06); }
  .export-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .strip-card { background: white; border-radius: 14px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 10px rgba(10,51,35,0.05); }
  .strip-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .strip-value { font-size: 20px; font-weight: 800; color: ${COLORS.darkGreen}; line-height: 1.2; }
  .strip-label { font-size: 11px; color: #aaa; font-weight: 500; }
  .filter-toolbar { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; }
  .search-input { flex: 1; min-width: 180px; padding: 11px 18px; border: 2px solid rgba(10,51,35,0.1); border-radius: 12px; font-family: 'Poppins', sans-serif; font-size: 13px; background: white; color: ${COLORS.darkGreen}; outline: none; transition: border 0.2s; }
  .search-input:focus { border-color: ${COLORS.mossGreen}; }
  .tab-btn { padding: 10px 18px; border-radius: 12px; border: 2px solid transparent; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; background: white; color: #999; transition: all 0.2s; white-space: nowrap; }
  .tab-btn.active.all       { background: ${COLORS.darkGreen};     color: ${COLORS.beige}; }
  .tab-btn.active.pending   { background: #f59e0b;                 color: white; }
  .tab-btn.active.paid      { background: ${COLORS.mossGreen};     color: ${COLORS.darkGreen}; }
  .tab-btn.active.cooking   { background: ${COLORS.rosyBrown};     color: white; }
  .tab-btn.active.ready     { background: #10b981;                 color: white; }
  .tab-btn.active.cancelled { background: #ef4444;                 color: white; }
  .orders-table-wrap { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 14px rgba(10,51,35,0.06); }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: ${COLORS.darkGreen}; }
  thead th { padding: 14px 18px; text-align: left; font-size: 11px; font-weight: 700; color: rgba(247,244,213,0.7); text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
  tbody tr { border-bottom: 1px solid #f5f2e8; transition: background 0.15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: rgba(247,244,213,0.4); }
  td { padding: 16px 18px; font-size: 13px; color: ${COLORS.darkGreen}; vertical-align: middle; }
  .order-id-cell { font-weight: 700; color: ${COLORS.midnightGreen}; font-size: 14px; }
  .buyer-name { font-weight: 600; font-size: 13px; }
  .buyer-sub  { font-size: 11px; color: #aaa; margin-top: 2px; }
  .items-cell { max-width: 200px; }
  .item-tag { display: inline-block; background: ${COLORS.beige}; color: ${COLORS.darkGreen}; padding: 3px 9px; border-radius: 8px; font-size: 11px; font-weight: 600; margin: 2px 2px 2px 0; }
  .amount-cell { font-size: 15px; font-weight: 800; color: ${COLORS.darkGreen}; white-space: nowrap; }
  .date-cell   { font-size: 12px; color: #aaa; white-space: nowrap; }
  .status-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; white-space: nowrap; }
  .status-badge.pending   { background: rgba(245,158,11,0.15);  color: #f59e0b; }
  .status-badge.paid      { background: rgba(59,130,246,0.12);  color: #3b82f6; }
  .status-badge.cooking   { background: rgba(211,150,140,0.18); color: ${COLORS.rosyBrown}; }
  .status-badge.ready     { background: rgba(16,185,129,0.15);  color: #10b981; }
  .status-badge.cancelled { background: rgba(239,68,68,0.1);    color: #ef4444; }
  .action-btn { padding: 7px 14px; border-radius: 8px; border: none; font-family: 'Poppins', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
  .action-btn.advance  { background: rgba(16,86,102,0.12); color: ${COLORS.midnightGreen}; }
  .action-btn.advance:hover { background: ${COLORS.midnightGreen}; color: white; }
  .action-btn.advance:disabled { opacity: 0.5; cursor: not-allowed; }
  .action-btn.view { background: rgba(10,51,35,0.07); color: ${COLORS.darkGreen}; }
  .action-btn.view:hover { background: rgba(10,51,35,0.15); }
  .empty-state { text-align: center; padding: 60px 20px; color: #bbb; }
  .empty-state .emoji { font-size: 48px; margin-bottom: 12px; }
  .empty-state h3 { font-size: 16px; font-weight: 600; color: ${COLORS.darkGreen}; margin: 0 0 8px; }
  .empty-state p  { font-size: 13px; margin: 0; }
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-top: 1px solid #f5f2e8; }
  .page-info { font-size: 12px; color: #aaa; font-weight: 500; }
  .page-btns { display: flex; gap: 6px; }
  .page-btn { width: 32px; height: 32px; border-radius: 8px; border: 2px solid rgba(10,51,35,0.1); background: white; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 600; color: #999; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
  .page-btn:hover, .page-btn.active { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; border-color: ${COLORS.darkGreen}; }
  .drawer-overlay { position: fixed; inset: 0; background: rgba(10,51,35,0.35); z-index: 100; backdrop-filter: blur(3px); }
  .drawer { position: fixed; right: 0; top: 0; bottom: 0; width: 380px; background: white; z-index: 101; padding: 32px 28px; overflow-y: auto; box-shadow: -8px 0 40px rgba(10,51,35,0.12); animation: slideInDrawer 0.25s ease; }
  @keyframes slideInDrawer { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .drawer-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
  .drawer-header h2 { font-size: 20px; font-weight: 800; color: ${COLORS.darkGreen}; margin: 0; }
  .close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: #aaa; transition: color 0.2s; padding: 0; line-height: 1; }
  .close-btn:hover { color: ${COLORS.darkGreen}; }
  .drawer-section { margin-bottom: 22px; }
  .drawer-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #bbb; margin-bottom: 10px; }
  .drawer-info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f2e8; font-size: 13px; }
  .drawer-info-row:last-child { border-bottom: none; }
  .drawer-info-label { color: #aaa; font-weight: 500; }
  .drawer-info-value { font-weight: 600; color: ${COLORS.darkGreen}; }
  .drawer-item { background: ${COLORS.beige}; border-radius: 10px; padding: 12px 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .drawer-item-name  { font-weight: 600; }
  .drawer-item-qty   { color: #aaa; font-size: 12px; margin-top: 2px; }
  .drawer-item-price { font-weight: 700; color: ${COLORS.midnightGreen}; }
  .drawer-total { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; border-radius: 12px; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
  .drawer-total span   { font-size: 14px; font-weight: 600; }
  .drawer-total strong { font-size: 20px; font-weight: 800; }
  .drawer-actions { margin-top: 20px; display: flex; gap: 10px; }
  .drawer-action-btn { flex: 1; padding: 12px; border-radius: 12px; border: none; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .drawer-action-btn.primary   { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; }
  .drawer-action-btn.primary:hover { background: ${COLORS.darkGreen}; color: ${COLORS.beige}; }
  .drawer-action-btn.secondary { background: rgba(211,150,140,0.15); color: ${COLORS.rosyBrown}; }
  .drawer-action-btn.secondary:hover { background: ${COLORS.rosyBrown}; color: white; }

  /* ── TOPBAR ──────────────────────────────────────────────────── */
  .orders-topbar {
    background: white;
    padding: 0 clamp(16px, 3vw, 40px);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(131,153,88,0.12);
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: 0 1px 4px rgba(10,51,35,0.06);
    flex-shrink: 0;
    box-sizing: border-box;
  }
  .orders-topbar-title { font-size: 17px; font-weight: 700; color: #0A3323; }
  .orders-topbar-right { display: flex; align-items: center; gap: 12px; }
  .seller-notif-btn {
    position: relative; display: flex; align-items: center; justify-content: center;
    background: rgba(131,153,88,0.12); color: #0A3323;
    border: none; border-radius: 12px; width: 42px; height: 42px;
    font-size: 18px; cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s;
  }
  .seller-notif-btn:hover { background: rgba(131,153,88,0.22); }
  .seller-notif-btn.has-notif { background: rgba(211,150,140,0.18); }
  .seller-notif-count {
    position: absolute; top: 4px; right: 4px; background: #D3968C; color: white;
    font-size: 9px; font-weight: 700; min-width: 16px; height: 16px;
    border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 3px;
  }
  .seller-notif-panel {
    position: absolute; top: 54px; right: 0; width: 320px;
    background: white; border-radius: 18px;
    box-shadow: 0 8px 32px rgba(10,51,35,0.15); z-index: 200; overflow: hidden;
  }
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
  .seller-notif-toast {
    position: fixed; top: 80px; right: 24px; z-index: 999; max-width: 340px;
    background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(10,51,35,0.18);
    padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px;
    border-left: 4px solid #839958;
  }
  .seller-notif-toast-icon { font-size: 22px; flex-shrink: 0; }
  .seller-notif-toast-title { font-size: 13px; font-weight: 700; color: #0A3323; margin-bottom: 3px; }
  .seller-notif-toast-body { font-size: 12px; color: rgba(10,51,35,0.65); line-height: 1.4; }
  .seller-notif-toast-close { margin-left: auto; background: none; border: none; font-size: 16px; cursor: pointer; color: rgba(10,51,35,0.3); flex-shrink: 0; padding: 0 4px; }
  .seller-notif-toast-close:hover { color: #0A3323; }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1100px) {
    .seller-sidebar { width: 200px; }
    .orders-main { margin-left: 200px; }
    .stat-strip { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }
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
    .orders-main { margin-left: 64px; }
  }
  @media (max-width: 600px) {
    .seller-sidebar { display: none; }
    .orders-main { margin-left: 0; }
    .stat-strip { grid-template-columns: repeat(2, 1fr); }
    .filter-toolbar { gap: 6px; }
  }
`;

const ADVANCE_LABEL = {
  pending: "✅ Konfirmasi Bayar",
  paid:    "🍳 Mulai Masak",
  cooking: "🎉 Siap Diambil",
};

function formatRupiah(v) { return "Rp " + Number(v).toLocaleString("id-ID"); }

const STAT_CONFIGS = [
  { key: "all",     label: "Total Pesanan", icon: "📋", bg: "#0A332315", color: COLORS.darkGreen },
  { key: "pending", label: "Menunggu",      icon: "⏳", bg: "#f59e0b20", color: "#f59e0b" },
  { key: "paid",    label: "Konfirmasi",    icon: "✅", bg: "#3b82f620", color: "#3b82f6" },
  { key: "cooking", label: "Dimasak",       icon: "🍳", bg: "#D3968C20", color: COLORS.rosyBrown },
  { key: "ready",   label: "Siap Ambil",    icon: "🎉", bg: "#10b98120", color: "#10b981" },
];

const TAB_LIST  = ["all", "pending", "paid", "cooking", "ready", "cancelled"];
const TAB_LABEL = {
  all: "Semua", pending: "⏳ Menunggu", paid: "✅ Konfirmasi",
  cooking: "🍳 Dimasak", ready: "🎉 Siap", cancelled: "❌ Batal",
};

const STATUS_LABEL_TEXT = {
  pending: "Menunggu",
  paid: "Terkonfirmasi",
  cooking: "Dimasak",
  ready: "Siap Diambil",
  cancelled: "Dibatalkan",
};

// ── PDF Export ────────────────────────────────────────────────────
async function exportOrdersToPDF(orders, sellerName) {
  // Load jsPDF dari CDN secara dinamis
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const col = {
    id:     margin,
    buyer:  margin + 18,
    date:   margin + 52,
    status: margin + 98,
    total:  margin + 138,
  };

  // ── Header ──
  doc.setFillColor(10, 51, 35); // darkGreen
  doc.rect(0, 0, pageW, 36, "F");

  doc.setTextColor(247, 244, 213); // beige
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("KANTIN DIGITAL", margin, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Laporan Penjualan — Seller Portal", margin, 23);

  const now = new Date();
  doc.text(
    `Dicetak: ${now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} pukul ${now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`,
    pageW - margin,
    16,
    { align: "right" }
  );
  doc.text(`Seller: ${sellerName || "–"}`, pageW - margin, 23, { align: "right" });

  // ── Summary Box ──
  let y = 46;
  const totalPendapatan = orders
    .filter(o => o.status !== "cancelled")
    .reduce((a, o) => a + Number(o.total), 0);
  const jumlahPesanan = orders.length;
  const selesai = orders.filter(o => o.status === "ready").length;
  const dibatalkan = orders.filter(o => o.status === "cancelled").length;

  const summaryBoxH = 26;
  doc.setFillColor(245, 242, 220);
  doc.roundedRect(margin, y, pageW - margin * 2, summaryBoxH, 4, 4, "F");

  const summaryItems = [
    { label: "Total Pesanan", value: String(jumlahPesanan) },
    { label: "Selesai",       value: String(selesai) },
    { label: "Dibatalkan",    value: String(dibatalkan) },
    { label: "Total Pendapatan", value: formatRupiah(totalPendapatan) },
  ];
  const colW = (pageW - margin * 2) / summaryItems.length;

  summaryItems.forEach((item, i) => {
    const x = margin + colW * i + colW / 2;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 100);
    doc.text(item.label.toUpperCase(), x, y + 8, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 51, 35);
    doc.text(item.value, x, y + 18, { align: "center" });
  });

  y += summaryBoxH + 10;

  // ── Table Header ──
  doc.setFillColor(10, 51, 35);
  doc.rect(margin, y, pageW - margin * 2, 9, "F");
  doc.setTextColor(247, 244, 213);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text("ID",       col.id + 2,    y + 6);
  doc.text("BUYER ID", col.buyer + 2, y + 6);
  doc.text("TANGGAL",  col.date + 2,  y + 6);
  doc.text("STATUS",   col.status + 2,y + 6);
  doc.text("TOTAL",    col.total + 2, y + 6);
  y += 9;

  // ── Table Rows ──
  const rowH = 8;
  orders.forEach((o, idx) => {
    if (y + rowH > pageH - 20) {
      doc.addPage();
      y = 20;
      // mini header on new page
      doc.setFillColor(10, 51, 35);
      doc.rect(margin, y - 9, pageW - margin * 2, 9, "F");
      doc.setTextColor(247, 244, 213);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("ID",       col.id + 2,    y);
      doc.text("BUYER ID", col.buyer + 2, y);
      doc.text("TANGGAL",  col.date + 2,  y);
      doc.text("STATUS",   col.status + 2,y);
      doc.text("TOTAL",    col.total + 2, y);
      y += 0;
    }

    // zebra stripe
    if (idx % 2 === 0) {
      doc.setFillColor(252, 250, 240);
      doc.rect(margin, y, pageW - margin * 2, rowH, "F");
    }

    doc.setTextColor(10, 51, 35);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(`#${String(o.id).padStart(3, "0")}`, col.id + 2, y + 5.5);

    doc.setFont("helvetica", "normal");
    doc.text(`#${o.buyer_id}`, col.buyer + 2, y + 5.5);
    const tgl = o.created_at
      ? new Date(o.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
      : "-";
    doc.text(tgl, col.date + 2, y + 5.5);

    const statusText = STATUS_LABEL_TEXT[o.status] || o.status;
    // status color dot
    const statusColors = {
      pending:   [245, 158, 11],
      paid:      [59, 130, 246],
      cooking:   [211, 150, 140],
      ready:     [16, 185, 129],
      cancelled: [239, 68, 68],
    };
    const sc = statusColors[o.status] || [150, 150, 150];
    doc.setFillColor(sc[0], sc[1], sc[2]);
    doc.circle(col.status + 3, y + 4.5, 1.5, "F");
    doc.setTextColor(sc[0], sc[1], sc[2]);
    doc.text(statusText, col.status + 7, y + 5.5);

    doc.setTextColor(10, 51, 35);
    doc.setFont("helvetica", "bold");
    doc.text(formatRupiah(o.total), col.total + 2, y + 5.5);

    // row border bottom
    doc.setDrawColor(235, 232, 220);
    doc.line(margin, y + rowH, pageW - margin, y + rowH);

    y += rowH;
  });

  // ── Footer ──
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 160);
  doc.text(
    `Kantin Digital © ${now.getFullYear()} — Dokumen ini dibuat otomatis`,
    pageW / 2,
    pageH - 8,
    { align: "center" }
  );

  // ── Save ──
  const fileName = `Laporan-Penjualan-${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export default function Orders({ onNavigate }) {
  const [orders, setOrders]           = useState([]);
  const [tab, setTab]                 = useState("all");
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState(null);
  const [activeNav, setActiveNav]     = useState("orders");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [exporting, setExporting]     = useState(false);

  const user = getSavedUser();

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

  // useEffect(() => {
  //   async function loadOrders() {
  //     try {
  //       const data = await getOrders();
  //       setOrders(data);
  //     } catch (err) {
  //       console.error("Gagal load orders:", err);
  //     }
  //   }
  //   loadOrders();
  // }, []);

  useEffect(() => {
    async function loadOrders() {
      try {
        const stallData = await getMyStall();
        const data = await getOrders(stallData.id);
        setOrders(data);
      } catch (err) {
        console.error("Gagal load orders:", err);
      }
    }
    loadOrders();
  }, []);

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

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportOrdersToPDF(orders, user?.name);
    } catch (err) {
      console.error("Export PDF gagal:", err);
      alert("Gagal export PDF: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  const liveOrders    = orders.filter((o) => ["pending", "paid", "cooking"].includes(o.status));
  const pendingCount  = orders.filter((o) => o.status === "pending").length;
  const notifications = buildSellerNotifs(orders);

  const stats = STAT_CONFIGS.map((s) => ({
    ...s,
    count: s.key === "all" ? orders.length : orders.filter((o) => o.status === s.key).length,
    total: (s.key === "all" ? orders : orders.filter((o) => o.status === s.key))
      .filter((o) => o.status !== "cancelled")
      .reduce((a, o) => a + o.total, 0),
  }));

  const filtered = orders.filter((o) => {
    const matchTab    = tab === "all" || o.status === tab;
    const matchSearch = search === "" ||
      String(o.buyer_id).toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    return matchTab && matchSearch;
  });

  const handleDetail = async (o) => {
    setLoadingDetail(true);
    setSelected(o);
    try {
      const detail = await getOrderById(o.id);
      setSelected(detail);
    } catch (err) {
      console.error("Gagal load detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const advanceStatus = async (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order || !STATUS_FLOW[order.status]) return;
    const nextStatus = STATUS_FLOW[order.status];
    try {
      await updateOrderStatus(id, nextStatus);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: nextStatus } : o));
      if (selected?.id === id) setSelected((prev) => ({ ...prev, status: nextStatus }));
    } catch (err) {
      alert("Gagal update status: " + err.message);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await updateOrderStatus(id, "cancelled");
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "cancelled" } : o));
      if (selected?.id === id) setSelected((prev) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      alert("Gagal membatalkan pesanan: " + err.message);
    }
  };

  return (
    <div className="orders-root">
      <style>{sidebarStyles + ordersStyles}</style>

      <SellerSidebar
        active={activeNav}
        onNavigate={handleNav}
        liveOrders={liveOrders}
        notifications={notifications}
        pendingCount={pendingCount}
        onLogoutClick={() => setShowLogoutModal(true)}
        user={user}
      />

      <main className="orders-main">

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

        {/* ── Topbar ── */}
        <div className="orders-topbar">
          <span className="orders-topbar-title">Pesanan Masuk 📋</span>
          <div className="orders-topbar-right">
            {showNotifPanel && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 150 }}
                onClick={() => setShowNotifPanel(false)}
              />
            )}
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

        {/* ── Main Content ── */}
        <div className="orders-content">
          <div className="orders-header">
            <div>
              <h1>Pesanan Masuk 📋</h1>
              <p>{user?.name || "Seller"} · {orders.length} total pesanan</p>
            </div>
            <button
              className="export-btn"
              onClick={handleExport}
              disabled={exporting || orders.length === 0}
            >
              {exporting ? "⏳ Mengexport..." : "📤 Export PDF"}
            </button>
          </div>

          <div className="stat-strip">
            {stats.map((s) => (
              <div key={s.key} className="strip-card">
                <div className="strip-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="strip-value" style={{ color: s.color }}>{s.count}</div>
                  <div className="strip-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="filter-toolbar">
            <input
              className="search-input"
              placeholder="🔍 Cari ID pesanan atau buyer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {TAB_LIST.map((t) => (
              <button
                key={t}
                className={`tab-btn${tab === t ? ` active ${t}` : ""}`}
                onClick={() => setTab(t)}
              >
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>

          <div className="orders-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Buyer ID</th><th>Total</th>
                  <th>Tanggal</th><th>Status</th><th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="emoji">📭</div>
                      <h3>Tidak ada pesanan</h3>
                      <p>Belum ada pesanan untuk filter ini</p>
                    </div>
                  </td></tr>
                ) : filtered.map((o) => (
                  <tr key={o.id}>
                    <td className="order-id-cell">#{String(o.id).padStart(3, "0")}</td>
                    <td>
                      <div className="buyer-name">#{o.buyer_id}</div>
                      <div className="buyer-sub">{o.created_at ? new Date(o.created_at).toLocaleDateString("id-ID") : "-"}</div>
                    </td>
                    <td className="amount-cell">{formatRupiah(o.total)}</td>
                    <td className="date-cell">{o.created_at ? new Date(o.created_at).toLocaleString("id-ID") : "-"}</td>
                    <td>
                      <span className={`status-badge ${o.status}`}>
                        {STATUS_CONFIG[o.status]?.icon} {STATUS_CONFIG[o.status]?.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button className="action-btn view" onClick={() => handleDetail(o)}>Detail</button>
                        {STATUS_FLOW[o.status] && (
                          <button className="action-btn advance" onClick={() => advanceStatus(o.id)}>
                            {ADVANCE_LABEL[o.status]}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              <span className="page-info">Menampilkan {filtered.length} dari {orders.length} pesanan</span>
              <div className="page-btns">
                <button className="page-btn">‹</button>
                <button className="page-btn active">1</button>
                <button className="page-btn">›</button>
              </div>
            </div>
          </div>
        </div>{/* end orders-content */}
      </main>

      {/* Detail Drawer */}
      {selected && (
        <>
          <div className="drawer-overlay" onClick={() => setSelected(null)} />
          <div className="drawer">
            <div className="drawer-header">
              <h2>Detail Pesanan #{String(selected.id).padStart(3, "0")}</h2>
              <button className="close-btn" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="drawer-section">
              <div className="drawer-section-title">Informasi Pesanan</div>
              <div className="drawer-info-row"><span className="drawer-info-label">ID Pembeli</span><span className="drawer-info-value">#{selected.buyer_id}</span></div>
              <div className="drawer-info-row"><span className="drawer-info-label">Tanggal</span><span className="drawer-info-value">{selected.created_at ? new Date(selected.created_at).toLocaleString("id-ID") : "-"}</span></div>
              <div className="drawer-info-row">
                <span className="drawer-info-label">Status</span>
                <span className={`status-badge ${selected.status}`}>
                  {STATUS_CONFIG[selected.status]?.icon} {STATUS_CONFIG[selected.status]?.label}
                </span>
              </div>
            </div>
            <div className="drawer-section">
              <div className="drawer-section-title">Item Pesanan</div>
              {loadingDetail ? (
                <p style={{ color: "#aaa", fontSize: 13 }}>Memuat item...</p>
              ) : selected.items?.length > 0 ? selected.items.map((item, i) => (
                <div key={i} className="drawer-item">
                  <div>
                    <div className="drawer-item-name">{item.nama || `Menu #${item.menu_id}`}</div>
                    <div className="drawer-item-qty">×{item.qty} porsi</div>
                  </div>
                  <div className="drawer-item-price">{formatRupiah(item.subtotal)}</div>
                </div>
              )) : (
                <p style={{ color: "#aaa", fontSize: 13 }}>Klik Detail untuk load item</p>
              )}
              <div className="drawer-total">
                <span>Total Pembayaran</span>
                <strong>{formatRupiah(selected.total)}</strong>
              </div>
            </div>
            {STATUS_FLOW[selected.status] && (
              <div className="drawer-actions">
                <button className="drawer-action-btn primary" onClick={() => advanceStatus(selected.id)}>
                  {ADVANCE_LABEL[selected.status]}
                </button>
                <button className="drawer-action-btn secondary" onClick={() => cancelOrder(selected.id)}>
                  ✕ Batalkan
                </button>
              </div>
            )}
          </div>
        </>
      )}

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