import { useState, useEffect } from "react";
import { USER, STATUS_CONFIG } from "../../data/DummyData";
import { getOrders, getOrderById } from "../../services/api";
import { fmtDateTime } from "../../utils/dateUtils";

const COLORS = {
  primary: "#ffffff", secondary: "#D3968C", accent: "#c07060",
  bg_light: "#F7F4D5", text_dark: "#105666", white: "#ffffff",
  overlay: "rgba(16,86,102,0.4)",
};

const fmt = (n) => "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const FALLBACK_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80";

const FILTER_TABS = [
  { key: "all",       label: "Semua" },
  { key: "cooking",   label: "Dimasak 🍳" },
  { key: "ready",     label: "Siap Diambil ✅" },
  { key: "cancelled", label: "Dibatalkan ❌" },
];

const TIMELINE_STEPS = [
  { status: "pending",  label: "Pesanan dibuat" },
  { status: "paid",     label: "Pembayaran Diterima" },
  { status: "cooking",  label: "Sedang Dimasak" },
  { status: "ready",    label: "Siap Diambil" },
];

function getStatusStep(status) {
  const map = { pending: 0, paid: 1, cooking: 2, ready: 3, cancelled: -1 };
  return map[status] ?? 0;
}

function normalizeItems(items = []) {
  return items.map(item => ({
    id: item.menu_id || item.id,
    nama: item.nama || `Menu #${item.menu_id}`,
    stall_name: item.stall_name || `Stan #${item.stall_id}`,
    qty: item.qty,
    subtotal: item.subtotal,
    foto_url: item.foto_url || FALLBACK_IMG,
  }));
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }
  .hs-app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; flex-shrink: 0; background: ${COLORS.primary}; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 200; transition: transform 0.3s; border-right: 1px solid rgba(211,150,140,0.15); }
  .sidebar-brand { padding: 24px 20px 20px; border-bottom: 1px solid rgba(211,150,140,0.1); display: flex; align-items: center; gap: 10px; }
  .sidebar-brand-icon { font-size: 28px; }
  .sidebar-brand-name { font-size: 18px; font-weight: 800; color: ${COLORS.text_dark}; }
  .sidebar-brand-sub { font-size: 11px; color: rgba(16,86,102,0.45); }
  .sidebar-nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: ${COLORS.text_dark}; font-size: 14px; font-weight: 500; border: none; background: none; width: 100%; text-align: left; font-family: 'Poppins', sans-serif; position: relative; }
  .nav-item:hover { background: rgba(16,86,102,0.05); }
  .nav-item.active { background: ${COLORS.bg_light}; font-weight: 700; }
  .nav-item-icon { font-size: 18px; flex-shrink: 0; }
  .nav-badge { position: absolute; right: 12px; background: ${COLORS.secondary}; color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
  .sidebar-footer { padding: 16px 12px; margin-top: auto; border-top: 1px solid rgba(211,150,140,0.1); }
  .user-info { display: flex; align-items: center; gap: 10px; padding: 8px; margin-bottom: 6px; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: ${COLORS.secondary}; display: flex; align-items: center; justify-content: center; font-size: 16px; color: ${COLORS.bg_light}; font-weight: 700; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .user-email { font-size: 11px; color: rgba(16,86,102,0.45); }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: ${COLORS.text_dark}; font-size: 13px; font-weight: 600; border: none; background: none; width: 100%; font-family: 'Poppins', sans-serif; }
  .logout-btn:hover { background: rgba(211,150,140,0.1); color: ${COLORS.secondary}; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: ${COLORS.overlay}; z-index: 190; }
  .hamburger { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: ${COLORS.text_dark}; }
  .topbar { background: ${COLORS.white}; padding: 0 24px; height: 64px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(211,150,140,0.15); position: sticky; top: 0; z-index: 100; }
  .topbar-title { font-size: 18px; font-weight: 700; color: ${COLORS.text_dark}; }
  .hs-main { margin-left: 240px; flex: 1; min-width: 0; }
  .hs-page { padding: 28px 32px 60px; }
  .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 16px; padding: 16px 18px; box-shadow: 0 2px 10px rgba(211,150,140,0.08); }
  .stat-label { font-size: 12px; color: rgba(16,86,102,0.55); font-weight: 500; margin-bottom: 6px; }
  .stat-val { font-size: 22px; font-weight: 800; color: ${COLORS.text_dark}; }
  .stat-sub { font-size: 11px; color: ${COLORS.secondary}; font-weight: 500; margin-top: 3px; }
  .filter-row { display: flex; gap: 8px; margin-bottom: 22px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
  .filter-row::-webkit-scrollbar { display: none; }
  .filter-tab { flex-shrink: 0; padding: 8px 18px; border-radius: 99px; border: 2px solid transparent; background: white; font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; cursor: pointer; transition: all 0.2s; font-family: 'Poppins', sans-serif; box-shadow: 0 2px 8px rgba(211,150,140,0.08); }
  .filter-tab.active { background: ${COLORS.secondary}; border-color: ${COLORS.secondary}; color: ${COLORS.bg_light}; }
  .filter-tab:hover:not(.active) { border-color: ${COLORS.secondary}; }
  .order-card { background: white; border-radius: 18px; box-shadow: 0 2px 12px rgba(211,150,140,0.08); margin-bottom: 16px; overflow: hidden; transition: box-shadow 0.2s; }
  .order-card:hover { box-shadow: 0 4px 20px rgba(211,150,140,0.15); }
  .card-hdr { padding: 16px 20px; display: flex; align-items: center; gap: 12px; cursor: pointer; }
  .card-id { font-size: 15px; font-weight: 800; color: ${COLORS.text_dark}; }
  .card-date { font-size: 12px; color: rgba(16,86,102,0.5); margin-top: 2px; }
  .card-stalls { font-size: 12px; color: ${COLORS.secondary}; font-weight: 500; margin-top: 2px; }
  .card-right { margin-left: auto; display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .status-pill { padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; }
  .card-total { font-size: 15px; font-weight: 800; color: ${COLORS.text_dark}; }
  .chevron { font-size: 13px; color: rgba(16,86,102,0.35); transition: transform 0.2s; }
  .chevron.open { transform: rotate(180deg); }
  .card-body { padding: 16px 20px 20px; border-top: 1px solid rgba(211,150,140,0.1); }
  .card-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .items-title { font-size: 13px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 10px; }
  .item-mini { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(211,150,140,0.08); }
  .item-mini:last-child { border-bottom: none; }
  .item-mini-img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
  .item-mini-name { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .item-mini-stall { font-size: 11px; color: ${COLORS.secondary}; }
  .item-mini-qty { font-size: 11px; color: rgba(16,86,102,0.5); }
  .item-mini-price { margin-left: auto; font-size: 13px; font-weight: 800; color: ${COLORS.text_dark}; flex-shrink: 0; }
  .items-loading { font-size: 13px; color: rgba(16,86,102,0.4); padding: 12px 0; font-style: italic; }
  .timeline-title { font-size: 13px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 12px; }
  .tl-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .tl-dot-wrap { display: flex; flex-direction: column; align-items: center; }
  .tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .tl-dot.done { background: ${COLORS.secondary}; }
  .tl-dot.cancelled { background: #ef4444; }
  .tl-line { width: 2px; flex: 1; background: rgba(211,150,140,0.2); margin: 3px 0; min-height: 14px; }
  .tl-label { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .tl-time { font-size: 11px; color: rgba(16,86,102,0.45); margin-top: 1px; }
  .reorder-btn { margin-top: 14px; padding: 10px 20px; background: rgba(211,150,140,0.1); color: ${COLORS.secondary}; border: 1.5px solid rgba(211,150,140,0.3); border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s; }
  .reorder-btn:hover { background: ${COLORS.secondary}; color: ${COLORS.bg_light}; }
  .loading-txt { text-align: center; padding: 60px 20px; font-size: 15px; color: ${COLORS.secondary}; font-weight: 500; }
  .error-banner { background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #dc2626; font-weight: 500; }
  .empty { text-align: center; padding: 60px 20px; }
  .empty-emo { font-size: 56px; margin-bottom: 16px; }
  .empty-title { font-size: 20px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 8px; }
  .empty-sub { font-size: 14px; color: ${COLORS.secondary}; margin-bottom: 24px; }
  .empty-btn { padding: 13px 32px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
  .empty-btn:hover { opacity: 0.88; }
  .modal-overlay { position: fixed; inset: 0; background: ${COLORS.overlay}; display: flex; align-items: center; justify-content: center; z-index: 300; backdrop-filter: blur(4px); padding: 20px; }
  .modal { background: ${COLORS.bg_light}; border-radius: 24px; padding: 32px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: popIn 0.25s ease; text-align: center; }
  @keyframes popIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { font-size: 48px; margin-bottom: 14px; }
  .modal-title { font-size: 20px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: rgba(16,86,102,0.6); margin-bottom: 24px; line-height: 1.5; }
  .modal-btns { display: flex; gap: 12px; }
  .modal-cancel { flex: 1; padding: 13px; background: rgba(211,150,140,0.12); color: ${COLORS.text_dark}; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
  .modal-cancel:hover { background: rgba(211,150,140,0.22); }
  .modal-confirm { flex: 1; padding: 13px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
  .modal-confirm:hover { opacity: 0.88; }
  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .hs-main { margin-left: 0; }
    .hamburger { display: block; }
    .hs-page { padding: 20px 16px 60px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .card-body-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .card-hdr { flex-wrap: wrap; gap: 8px; }
    .card-right { margin-left: 0; }
  }
`;

export default function History({ cart, onGoToHome, onGoToCart, onGoToStatus, onLogout, user }) {
  const [openCard, setOpenCard] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsCache, setItemsCache] = useState({});
  const [itemsLoading, setItemsLoading] = useState({});

  const displayName = user?.name || USER.name;
  const buyerId = user?.id;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        // Filter hanya order milik user ini
        const mine = data.filter(o =>
          buyerId ? String(o.buyer_id) === String(buyerId) : true
        );
        setOrders(mine);
      } catch (err) {
        setError(err.message || "Gagal memuat riwayat pesanan.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [buyerId]);

  const loadItemsForOrder = async (orderId) => {
    if (itemsCache[orderId] || itemsLoading[orderId]) return;
    setItemsLoading(p => ({ ...p, [orderId]: true }));
    try {
      const detail = await getOrderById(orderId);
      setItemsCache(p => ({ ...p, [orderId]: normalizeItems(detail.items || []) }));
    } catch {
      setItemsCache(p => ({ ...p, [orderId]: [] }));
    } finally {
      setItemsLoading(p => ({ ...p, [orderId]: false }));
    }
  };

  const handleOpenCard = (orderId) => {
    if (openCard === orderId) {
      setOpenCard(null);
    } else {
      setOpenCard(orderId);
      loadItemsForOrder(orderId);
    }
  };

  const totalCartItems = Object.values(cart || {}).reduce((a, b) => a + b.qty, 0);
  const filtered = orders.filter(o => filter === "all" ? true : o.status === filter);
  const totalSpent = orders.filter(o => o.status !== "cancelled").reduce((a, o) => a + o.total, 0);
  const doneOrders = orders.filter(o => o.status === "ready").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

  const getCfg = (status) =>
    STATUS_CONFIG[status] || { label: status, bg: "rgba(16,86,102,0.1)", color: COLORS.text_dark, icon: "📦" };

  const getStallNames = (orderId) => {
    const items = itemsCache[orderId] || [];
    const names = [...new Set(items.map(i => i.stall_name))];
    return names.join(", ");
  };

  return (
    <>
      <style>{css}</style>
      <div className="hs-app">
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon">🍽️</span>
            <div>
              <div className="sidebar-brand-name">Kantin Digital</div>
              <div className="sidebar-brand-sub">Kantin UPN</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <button className="nav-item" onClick={() => { onGoToHome(); setSidebarOpen(false); }}>
              <span className="nav-item-icon">🏠</span> Menu
            </button>
            <button className="nav-item" onClick={() => { onGoToCart(); setSidebarOpen(false); }}>
              <span className="nav-item-icon">🛒</span> Keranjang
              {totalCartItems > 0 && <span className="nav-badge">{totalCartItems}</span>}
            </button>
            <button className="nav-item" onClick={() => { onGoToStatus(); setSidebarOpen(false); }}>
              <span className="nav-item-icon">📋</span> Status Pesanan
            </button>
            <button className="nav-item active">
              <span className="nav-item-icon">🕐</span> Riwayat
            </button>
          </nav>
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">{displayName[0]}</div>
              <div>
                <div className="user-name">{displayName}</div>
                <div className="user-email">{user?.email || USER.email}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
              <span>🚪</span> Keluar
            </button>
          </div>
        </aside>

        <div className="hs-main">
          <div className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <span className="topbar-title">Riwayat Pesanan</span>
          </div>

          <div className="hs-page">
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Total Pesanan</div>
                <div className="stat-val">{orders.length}</div>
                <div className="stat-sub">semua waktu</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Pengeluaran</div>
                <div className="stat-val" style={{ fontSize: 16 }}>{fmt(totalSpent)}</div>
                <div className="stat-sub">pesanan selesai</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pesanan Selesai</div>
                <div className="stat-val" style={{ color: "#10b981" }}>{doneOrders}</div>
                <div className="stat-sub">berhasil diambil</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Dibatalkan</div>
                <div className="stat-val" style={{ color: "#ef4444" }}>{cancelledOrders}</div>
                <div className="stat-sub">tidak diproses</div>
              </div>
            </div>

            <div className="filter-row">
              {FILTER_TABS.map(t => (
                <button key={t.key} className={`filter-tab ${filter === t.key ? "active" : ""}`} onClick={() => setFilter(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading-txt">⏳ Memuat riwayat pesanan...</div>
            ) : error ? (
              <div className="error-banner">⚠️ {error}</div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-emo">📋</div>
                <div className="empty-title">Tidak ada pesanan</div>
                <div className="empty-sub">Belum ada pesanan dengan status ini.</div>
                <button className="empty-btn" onClick={onGoToHome}>Pesan Sekarang</button>
              </div>
            ) : (
              filtered.map(order => {
                const cfg = getCfg(order.status);
                const isOpen = openCard === order.id;
                const items = itemsCache[order.id] || [];
                const isLoadingItems = itemsLoading[order.id];
                const currentStep = getStatusStep(order.status);
                const stallNames = getStallNames(order.id);

                return (
                  <div key={order.id} className="order-card">
                    <div className="card-hdr" onClick={() => handleOpenCard(order.id)}>
                      <div>
                        <div className="card-id">Pesanan #{order.id}</div>
                        <div className="card-date">{fmtDateTime(order.created_at)}</div>
                        {stallNames && <div className="card-stalls">🏪 {stallNames}</div>}
                      </div>
                      <div className="card-right">
                        <div className="status-pill" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </div>
                        <div className="card-total">{fmt(order.total)}</div>
                        <span className={`chevron ${isOpen ? "open" : ""}`}>▼</span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="card-body">
                        <div className="card-body-grid">
                          <div>
                            <div className="items-title">Detail Item</div>
                            {isLoadingItems ? (
                              <div className="items-loading">⏳ Memuat detail...</div>
                            ) : items.length === 0 ? (
                              <div className="items-loading">Tidak ada detail item.</div>
                            ) : (
                              items.map((item, idx) => (
                                <div className="item-mini" key={idx}>
                                  <img src={item.foto_url || FALLBACK_IMG} alt={item.nama} className="item-mini-img" onError={e => { e.target.src = FALLBACK_IMG; }} />
                                  <div>
                                    <div className="item-mini-name">{item.nama}</div>
                                    <div className="item-mini-stall">{item.stall_name}</div>
                                    <div className="item-mini-qty">×{item.qty}</div>
                                  </div>
                                  <div className="item-mini-price">{fmt(item.subtotal)}</div>
                                </div>
                              ))
                            )}
                            {order.status === "ready" && (
                              <button className="reorder-btn" onClick={onGoToHome}>🔄 Pesan Lagi</button>
                            )}
                          </div>
                          <div>
                            <div className="timeline-title">📍 Riwayat Status</div>
                            {order.status === "cancelled" ? (
                              <>
                                <div className="tl-item">
                                  <div className="tl-dot-wrap"><div className="tl-dot done" /><div className="tl-line" /></div>
                                  <div><div className="tl-label">Pesanan dibuat</div><div className="tl-time">{fmtDateTime(order.created_at)}</div></div>
                                </div>
                                <div className="tl-item">
                                  <div className="tl-dot-wrap"><div className="tl-dot cancelled" /></div>
                                  <div><div className="tl-label">Pesanan dibatalkan</div><div className="tl-time">-</div></div>
                                </div>
                              </>
                            ) : (
                              TIMELINE_STEPS.filter(s => getStatusStep(s.status) <= currentStep).map((s, i, arr) => (
                                <div className="tl-item" key={s.status}>
                                  <div className="tl-dot-wrap">
                                    <div className="tl-dot done" />
                                    {i < arr.length - 1 && <div className="tl-line" />}
                                  </div>
                                  <div>
                                    <div className="tl-label">{s.label}</div>
                                    <div className="tl-time">{s.status === "pending" ? fmtDateTime(order.created_at) : "-"}</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🚪</div>
              <div className="modal-title">Keluar dari akun?</div>
              <div className="modal-sub">Kamu akan keluar dari Kantin Digital.</div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
                <button className="modal-confirm" onClick={() => { setShowLogoutModal(false); onLogout(); }}>Ya, Keluar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}