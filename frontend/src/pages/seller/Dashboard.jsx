import { useState } from "react";

const COLORS = {
  darkGreen: "#0A3323",
  mossGreen: "#839958",
  beige: "#F7F4D5",
  rosyBrown: "#D3968C",
  midnightGreen: "#105666",
};

// ─── Shared sidebar styles (matching buyer sidebar pattern) ───────────────────
const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

  .seller-sidebar {
    width: 240px;
    background: ${COLORS.darkGreen};
    min-height: 100vh;
    position: fixed;
    left: 0; top: 0;
    display: flex;
    flex-direction: column;
    z-index: 10;
    font-family: 'Poppins', sans-serif;
    overflow-y: auto;
  }

  /* ── Logo ── */
  .sb-logo {
    padding: 24px 20px 18px;
    border-bottom: 1px solid rgba(131,153,88,0.25);
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .sb-logo-icon {
    width: 40px; height: 40px;
    background: rgba(131,153,88,0.2);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .sb-logo h2 {
    color: ${COLORS.beige};
    font-size: 16px; font-weight: 800;
    letter-spacing: -0.4px; margin: 0; line-height: 1.2;
  }
  .sb-logo span {
    color: ${COLORS.mossGreen};
    font-size: 10px; font-weight: 500;
    letter-spacing: 1.5px; text-transform: uppercase;
  }

  /* ── Nav items ── */
  .sb-nav { padding: 14px 10px; }

  .sb-nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 10px;
    cursor: pointer;
    color: rgba(247,244,213,0.55);
    font-size: 14px; font-weight: 500;
    transition: all 0.2s; margin-bottom: 3px;
    border: none; background: none; width: 100%;
    text-align: left; font-family: 'Poppins', sans-serif;
    position: relative;
  }
  .sb-nav-item:hover { background: rgba(131,153,88,0.18); color: ${COLORS.beige}; }
  .sb-nav-item.active { background: ${COLORS.mossGreen}; color: ${COLORS.darkGreen}; font-weight: 700; }
  .sb-nav-item .nav-icon { font-size: 17px; width: 20px; text-align: center; flex-shrink: 0; }
  .sb-nav-item .nav-badge {
    margin-left: auto;
    background: ${COLORS.rosyBrown}; color: white;
    font-size: 11px; font-weight: 700;
    min-width: 20px; height: 20px; border-radius: 99px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 5px;
  }
  .sb-nav-item.active .nav-badge {
    background: ${COLORS.darkGreen}; color: ${COLORS.beige};
  }

  /* ── Pesanan Aktif section ── */
  .sb-section {
    margin: 0 10px 4px;
    background: rgba(16,86,102,0.35);
    border-radius: 10px;
    padding: 12px 14px;
  }
  .sb-section-title {
    font-size: 10px; font-weight: 700;
    color: ${COLORS.mossGreen};
    letter-spacing: 1.2px; text-transform: uppercase;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .sb-section-title .dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${COLORS.rosyBrown};
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .sb-order-item {
    margin-bottom: 8px;
  }
  .sb-order-item:last-child { margin-bottom: 0; }
  .sb-order-name {
    color: ${COLORS.beige};
    font-size: 12px; font-weight: 600;
    margin-bottom: 4px;
  }
  .sb-order-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 600;
    padding: 3px 8px; border-radius: 99px;
  }
  .sb-order-status.paid    { background: rgba(131,153,88,0.2);  color: ${COLORS.mossGreen}; }
  .sb-order-status.cooking { background: rgba(211,150,140,0.2); color: ${COLORS.rosyBrown}; }
  .sb-order-status.ready   { background: rgba(16,86,102,0.3);   color: #7ec8d8; }
  .sb-empty-section {
    color: rgba(247,244,213,0.35);
    font-size: 11px; text-align: center; padding: 4px 0;
  }

  /* ── Notifikasi section ── */
  .sb-notif-title {
    font-size: 10px; font-weight: 700;
    color: ${COLORS.rosyBrown};
    letter-spacing: 1.2px; text-transform: uppercase;
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .sb-notif-item {
    padding: 8px 0;
    border-bottom: 1px solid rgba(131,153,88,0.12);
    display: flex; gap: 8px; align-items: flex-start;
  }
  .sb-notif-item:last-child { border-bottom: none; padding-bottom: 0; }
  .sb-notif-dot {
    width: 6px; height: 6px; border-radius: 50%;
    flex-shrink: 0; margin-top: 4px;
  }
  .sb-notif-dot.new   { background: ${COLORS.rosyBrown}; }
  .sb-notif-dot.read  { background: rgba(247,244,213,0.2); }
  .sb-notif-text {
    color: rgba(247,244,213,0.7);
    font-size: 11px; line-height: 1.4;
    flex: 1;
  }
  .sb-notif-time {
    color: rgba(247,244,213,0.3);
    font-size: 10px; margin-top: 2px;
  }

  /* ── User profile card ── */
  .sb-user-card {
    margin: 8px 10px;
    background: rgba(131,153,88,0.12);
    border: 1px solid rgba(131,153,88,0.2);
    border-radius: 10px;
    padding: 12px 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .sb-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: ${COLORS.mossGreen};
    display: flex; align-items: center; justify-content: center;
    color: ${COLORS.darkGreen}; font-weight: 800; font-size: 14px;
    flex-shrink: 0;
  }
  .sb-user-name  { color: ${COLORS.beige};    font-size: 12px; font-weight: 600; margin: 0 0 1px; }
  .sb-user-code  { color: ${COLORS.mossGreen}; font-size: 10px; font-weight: 500; margin: 0; }

  /* ── Logout button ── */
  .sb-logout {
    margin: 4px 10px 16px;
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    cursor: pointer;
    color: rgba(247,244,213,0.4);
    font-size: 13px; font-weight: 500;
    border: 1px solid rgba(247,244,213,0.1);
    background: none; width: calc(100% - 20px);
    font-family: 'Poppins', sans-serif;
    transition: all 0.2s;
  }
  .sb-logout:hover {
    background: rgba(211,150,140,0.15);
    color: ${COLORS.rosyBrown};
    border-color: rgba(211,150,140,0.3);
  }
`;

// ─── Shared Sidebar Component ─────────────────────────────────────────────────
const navItems = [
  { icon: "📊", label: "Dashboard", key: "dashboard" },
  { icon: "🍽️", label: "Menu",      key: "menu" },
  { icon: "📋", label: "Pesanan",   key: "orders" },
];

const seller = { name: "Seller Padang", stall: "Stan Padang", code: "STAN001" };

// Live incoming orders (visible to seller)
const liveOrders = [
  { id: 10, items: "Nasi Rendang ×2", status: "paid" },
  { id: 9,  items: "Gulai Tunjang ×1", status: "cooking" },
];

const notifications = [
  { text: "Pesanan #10 masuk, perlu dikonfirmasi", time: "06:51", isNew: true },
  { text: "Pesanan #8 sudah selesai diproses", time: "06:30", isNew: false },
];

const statusLabel = { paid: "Menunggu Konfirmasi", cooking: "Sedang Dimasak", ready: "Siap Diambil" };

function SellerSidebar({ active, onNavigate, pendingCount = 0 }) {
  return (
    <aside className="seller-sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon">🍽️</div>
        <div>
          <h2>Kantin Digital</h2>
          <span>Seller Portal</span>
        </div>
      </div>

      {/* Nav */}
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

      {/* ⚡ Pesanan Aktif */}
      <div className="sb-section">
        <div className="sb-section-title">
          <span className="dot" />
          ⚡ PESANAN AKTIF
        </div>
        {liveOrders.length === 0 ? (
          <p className="sb-empty-section">Belum ada pesanan aktif</p>
        ) : (
          liveOrders.map((o) => (
            <div key={o.id} className="sb-order-item">
              <div className="sb-order-name">#{o.id} · {o.items}</div>
              <span className={`sb-order-status ${o.status}`}>
                {o.status === "cooking" ? "🔥" : o.status === "ready" ? "✅" : "⏳"}{" "}
                {statusLabel[o.status]}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 🔔 Notifikasi */}
      <div className="sb-section">
        <div className="sb-notif-title">
          🔔 NOTIFIKASI
        </div>
        {notifications.map((n, i) => (
          <div key={i} className="sb-notif-item">
            <span className={`sb-notif-dot ${n.isNew ? "new" : "read"}`} />
            <div>
              <div className="sb-notif-text">{n.text}</div>
              <div className="sb-notif-time">{n.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* User card */}
      <div className="sb-user-card">
        <div className="sb-avatar">{seller.name[0]}</div>
        <div>
          <p className="sb-user-name">{seller.name}</p>
          <p className="sb-user-code">{seller.code}</p>
        </div>
      </div>

      {/* Logout */}
      <button className="sb-logout" onClick={() => onNavigate("logout")}>
        🚪 Keluar
      </button>
    </aside>
  );
}

// ─── Dashboard-specific styles ────────────────────────────────────────────────
const dashStyles = `
  .dash-root {
    font-family: 'Poppins', sans-serif;
    background-color: ${COLORS.beige};
    min-height: 100vh;
    color: ${COLORS.darkGreen};
  }
  .dash-main {
    margin-left: 240px;
    padding: 36px 40px;
    min-height: 100vh;
  }
  .dash-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .dash-header h1 { font-size: 26px; font-weight: 800; color: ${COLORS.darkGreen}; margin: 0; }
  .dash-header p  { color: ${COLORS.mossGreen}; font-size: 13px; margin: 4px 0 0; font-weight: 500; }
  .dash-date-pill {
    background: ${COLORS.darkGreen}; color: ${COLORS.beige};
    font-size: 12px; font-weight: 500;
    padding: 8px 16px; border-radius: 20px;
  }
  .dash-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
  .stat-card {
    background: white; border-radius: 16px;
    padding: 22px 20px; position: relative;
    overflow: hidden; transition: transform 0.2s;
    box-shadow: 0 2px 12px rgba(10,51,35,0.06);
  }
  .stat-card:hover { transform: translateY(-3px); }
  .stat-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 4px;
    border-radius: 16px 16px 0 0;
  }
  .stat-card.green::before   { background: ${COLORS.darkGreen}; }
  .stat-card.moss::before    { background: ${COLORS.mossGreen}; }
  .stat-card.rosy::before    { background: ${COLORS.rosyBrown}; }
  .stat-card.midnight::before{ background: ${COLORS.midnightGreen}; }
  .stat-icon  { font-size: 24px; margin-bottom: 12px; }
  .stat-label { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .stat-value { font-size: 28px; font-weight: 800; color: ${COLORS.darkGreen}; line-height: 1; margin-bottom: 6px; }
  .stat-change { font-size: 12px; font-weight: 500; color: ${COLORS.mossGreen}; }
  .dash-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .dash-card {
    background: white; border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(10,51,35,0.06);
  }
  .dash-card-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
  }
  .dash-card-header h3 { font-size: 15px; font-weight: 700; color: ${COLORS.darkGreen}; margin: 0; }
  .view-all-btn {
    font-size: 12px; color: ${COLORS.midnightGreen}; font-weight: 600;
    background: none; border: none; cursor: pointer; padding: 0;
  }
  .order-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid #f0ede0;
  }
  .order-row:last-child { border-bottom: none; }
  .order-id   { font-size: 12px; color: #999; font-weight: 500; }
  .order-name { font-size: 13px; font-weight: 600; color: ${COLORS.darkGreen}; margin-top: 2px; }
  .order-amount { font-size: 14px; font-weight: 700; color: ${COLORS.darkGreen}; }
  .status-badge {
    display: inline-block; padding: 3px 10px; border-radius: 20px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .status-badge.paid    { background: rgba(131,153,88,0.15); color: ${COLORS.mossGreen}; }
  .status-badge.pending { background: rgba(211,150,140,0.18); color: ${COLORS.rosyBrown}; }
  .menu-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid #f0ede0;
  }
  .menu-row:last-child { border-bottom: none; }
  .menu-img {
    width: 42px; height: 42px; border-radius: 10px;
    background: ${COLORS.beige};
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }
  .menu-details h4 { font-size: 13px; font-weight: 600; color: ${COLORS.darkGreen}; margin: 0 0 2px; }
  .menu-details p  { font-size: 12px; color: #999; margin: 0; }
  .menu-price { font-size: 14px; font-weight: 700; color: ${COLORS.midnightGreen}; margin-left: auto; }
  .bar-chart  { display: flex; align-items: flex-end; gap: 8px; height: 100px; margin-top: 8px; }
  .bar-wrap   { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end; }
  .bar        { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.6s cubic-bezier(0.34,1.56,0.64,1); }
  .bar-label  { font-size: 10px; color: #aaa; font-weight: 500; }
`;

// ─── Dashboard data ───────────────────────────────────────────────────────────
const stats = [
  { label: "Total Pendapatan", value: "Rp 135K", icon: "💰", change: "+12% minggu ini", variant: "green" },
  { label: "Total Pesanan",    value: "24",       icon: "🛒", change: "+5 hari ini",     variant: "moss" },
  { label: "Menu Aktif",       value: "4",        icon: "🍽️", change: "2 kategori",     variant: "midnight" },
  { label: "Stok Rendah",      value: "1",        icon: "⚠️", change: "Perlu restock",  variant: "rosy" },
];

const recentOrders = [
  { id: "#005", buyer: "Budi Santoso", amount: "Rp 30.000", status: "paid",    items: "Nasi Rendang ×2" },
  { id: "#006", buyer: "Siti Rahma",   amount: "Rp 15.000", status: "pending", items: "Ayam Geprek ×1" },
];

const topMenus = [
  { name: "Nasi Rendang",     emoji: "🍛", sold: 12, price: "Rp 15.000" },
  { name: "Ayam Gulai",       emoji: "🍲", sold: 8,  price: "Rp 18.000" },
  { name: "Ayam Geprek L5",   emoji: "🌶️", sold: 6,  price: "Rp 15.000" },
];

const weekData = [
  { day: "Sen", val: 60 }, { day: "Sel", val: 80 }, { day: "Rab", val: 45 },
  { day: "Kam", val: 90 }, { day: "Jum", val: 70 }, { day: "Sab", val: 100 },
  { day: "Min", val: 55 },
];

// ─── Dashboard Component ──────────────────────────────────────────────────────
export default function Dashboard({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const maxVal = Math.max(...weekData.map((d) => d.val));

  const handleNav = (key) => {
    setActiveNav(key);
    if (onNavigate) onNavigate(key);
  };

  return (
    <div className="dash-root">
      <style>{sidebarStyles + dashStyles}</style>

      <SellerSidebar active={activeNav} onNavigate={handleNav} pendingCount={2} />

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1>Selamat Datang 👋</h1>
            <p>{seller.stall} · {seller.code}</p>
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
                  <div className="order-id">{o.id} · {o.items}</div>
                  <div className="order-name">{o.buyer}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="order-amount">{o.amount}</div>
                  <span className={`status-badge ${o.status}`}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="dash-card">
            <div className="dash-card-header">
              <h3>Menu Terlaris</h3>
              <button className="view-all-btn" onClick={() => handleNav("menu")}>Kelola Menu →</button>
            </div>
            {topMenus.map((m) => (
              <div key={m.name} className="menu-row">
                <div className="menu-img">{m.emoji}</div>
                <div className="menu-details">
                  <h4>{m.name}</h4>
                  <p>Terjual {m.sold} porsi</p>
                </div>
                <div className="menu-price">{m.price}</div>
              </div>
            ))}
          </div>

          <div className="dash-card" style={{ gridColumn: "1 / -1" }}>
            <div className="dash-card-header">
              <h3>Pendapatan Mingguan</h3>
            </div>
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
      </main>
    </div>
  );
}