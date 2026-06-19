import { useState, useEffect, useCallback } from "react";
import { USER, STATUS_CONFIG, STATUS_STEPS as STEPS } from "../../data/DummyData";
import { getOrders, getOrderById } from "../../services/api";
import { fmtDateTime } from "../../utils/dateUtils";

const COLORS = {
  primary: "#ffffff", secondary: "#D3968C", accent: "#c07060",
  bg_light: "#F7F4D5", text_dark: "#105666", white: "#ffffff",
  overlay: "rgba(16,86,102,0.4)",
};

const fmt = (n) => "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const FALLBACK_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80";
const POLL_INTERVAL = 15000;

const ACTIVE_STATUSES = ["pending", "paid", "cooking"];

const TIMELINE_STEPS = [
  { status: "pending", label: "Menunggu Konfirmasi" },
  { status: "paid",    label: "Pembayaran Diterima" },
  { status: "cooking", label: "Sedang Dimasak" },
  { status: "ready",   label: "Siap Diambil" },
];

function getStatusStep(status) {
  const map = { pending: 0, paid: 1, cooking: 2, ready: 3, cancelled: -1 };
  return map[status] ?? 0;
}

function normalizeItems(items = [], menus = []) {
  return items.map(item => ({
    id: item.menu_id || item.id,
    nama: item.nama || menus.find(m => m.id === item.menu_id)?.nama || `Menu #${item.menu_id}`,
    stall_name: item.stall_name || `Stan #${item.stall_id}`,
    qty: item.qty,
    subtotal: item.subtotal,
    foto_url: item.foto_url || FALLBACK_IMG,
  }));
}

function getItemSummary(items, maxChars = 45) {
  if (!items || items.length === 0) return null;
  const summary = items.map(i => `${i.nama} ×${i.qty}`).join(", ");
  return summary.length > maxChars ? summary.slice(0, maxChars) + "…" : summary;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }
  .os-app { display: flex; min-height: 100vh; }
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
  .os-main { margin-left: 240px; flex: 1; min-width: 0; }
  .os-page { padding: 28px 32px 60px; }
  .active-banner { background: linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%); border-radius: 20px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; margin-bottom: 28px; box-shadow: 0 4px 20px rgba(211,150,140,0.3); }
  .active-banner-icon { font-size: 36px; flex-shrink: 0; }
  .active-banner-title { font-size: 16px; font-weight: 700; color: white; margin-bottom: 3px; }
  .active-banner-sub { font-size: 13px; color: rgba(255,255,255,0.8); }
  .active-banner-right { margin-left: auto; flex-shrink: 0; }
  .active-badge { background: rgba(255,255,255,0.25); color: white; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 99px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.65; } }
  .order-card { background: white; border-radius: 20px; box-shadow: 0 2px 12px rgba(211,150,140,0.1); margin-bottom: 20px; overflow: hidden; transition: box-shadow 0.2s; }
  .order-card:hover { box-shadow: 0 4px 20px rgba(211,150,140,0.18); }
  .order-card.active-order { border: 2px solid ${COLORS.secondary}; }
  .card-hdr { padding: 16px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid rgba(211,150,140,0.1); cursor: pointer; }
  .card-order-id { font-size: 16px; font-weight: 800; color: ${COLORS.text_dark}; }
  .card-date { font-size: 12px; color: rgba(16,86,102,0.5); font-weight: 500; margin-top: 2px; }
  .card-items-preview { font-size: 12px; color: rgba(16,86,102,0.55); margin-top: 3px; font-style: italic; }
  .card-stalls { font-size: 12px; color: ${COLORS.secondary}; font-weight: 500; margin-top: 2px; }
  .card-status-pill { margin-left: auto; flex-shrink: 0; padding: 6px 14px; border-radius: 99px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
  .card-total { font-size: 15px; font-weight: 800; color: ${COLORS.text_dark}; flex-shrink: 0; }
  .card-chevron { font-size: 14px; color: rgba(16,86,102,0.35); flex-shrink: 0; transition: transform 0.2s; }
  .card-chevron.open { transform: rotate(180deg); }
  .card-body { padding: 20px; }
  .progress-wrap { margin-bottom: 24px; }
  .progress-steps { display: flex; align-items: flex-start; }
  .step-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .step-wrap:not(:last-child)::after { content: ''; position: absolute; top: 16px; left: 50%; right: -50%; height: 2px; background: rgba(211,150,140,0.2); z-index: 0; }
  .step-wrap.done:not(:last-child)::after { background: ${COLORS.secondary}; }
  .step-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; position: relative; z-index: 1; border: 2px solid rgba(211,150,140,0.2); background: white; color: rgba(16,86,102,0.3); transition: all 0.3s; }
  .step-circle.done { background: ${COLORS.secondary}; border-color: ${COLORS.secondary}; color: white; }
  .step-circle.current { background: white; border-color: ${COLORS.secondary}; color: ${COLORS.secondary}; box-shadow: 0 0 0 4px rgba(211,150,140,0.15); }
  .step-label { font-size: 10px; font-weight: 600; color: rgba(16,86,102,0.4); text-align: center; margin-top: 6px; line-height: 1.3; }
  .step-label.done { color: ${COLORS.secondary}; }
  .step-label.current { color: ${COLORS.text_dark}; font-weight: 700; }
  .card-body-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .items-title { font-size: 13px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 10px; }
  .item-mini { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid rgba(211,150,140,0.08); }
  .item-mini:last-child { border-bottom: none; }
  .item-mini-img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
  .item-mini-name { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .item-mini-stall { font-size: 11px; color: ${COLORS.secondary}; font-weight: 500; }
  .item-mini-qty { font-size: 11px; color: rgba(16,86,102,0.5); }
  .item-mini-price { margin-left: auto; font-size: 13px; font-weight: 800; color: ${COLORS.text_dark}; flex-shrink: 0; }
  .items-loading { font-size: 13px; color: rgba(16,86,102,0.4); padding: 12px 0; font-style: italic; }
  .timeline-title { font-size: 13px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 12px; }
  .tl-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 10px; }
  .tl-dot-wrap { display: flex; flex-direction: column; align-items: center; }
  .tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 3px; }
  .tl-dot.done { background: ${COLORS.secondary}; }
  .tl-dot.current { background: ${COLORS.secondary}; box-shadow: 0 0 0 3px rgba(211,150,140,0.25); }
  .tl-dot.upcoming { background: rgba(211,150,140,0.25); }
  .tl-dot.cancelled { background: #ef4444; }
  .tl-line { width: 2px; flex: 1; background: rgba(211,150,140,0.2); margin: 3px 0; min-height: 14px; }
  .tl-line.done { background: rgba(211,150,140,0.5); }
  .tl-label { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .tl-label.upcoming { color: rgba(16,86,102,0.35); font-weight: 400; }
  .tl-time { font-size: 11px; color: rgba(16,86,102,0.45); margin-top: 1px; }
  .loading-txt { text-align: center; padding: 60px 20px; font-size: 15px; color: ${COLORS.secondary}; font-weight: 500; }
  .error-banner { background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #dc2626; font-weight: 500; }
  .last-updated { font-size: 11px; color: rgba(16,86,102,0.4); font-weight: 500; margin-bottom: 20px; }
  .sec-title { font-size: 18px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 16px; }
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
    .os-main { margin-left: 0; }
    .hamburger { display: block; }
    .os-page { padding: 20px 16px 60px; }
    .card-body-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 500px) {
    .step-label { font-size: 9px; }
    .card-hdr { flex-wrap: wrap; gap: 8px; }
    .active-banner { flex-direction: column; align-items: flex-start; gap: 10px; }
  }
`;

export default function OrderStatus({ cart, onGoToHome, onGoToCart, onGoToHistory, onLogout, user }) {
  const [openCard, setOpenCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [itemsCache, setItemsCache] = useState({});
  const [itemsLoading, setItemsLoading] = useState({});

  const displayName = user?.name || USER.name;
  const totalCartItems = Object.values(cart || {}).reduce((a, b) => a + b.qty, 0);
  const buyerId = user?.id;

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getOrders();
      const mine = data.filter(o =>
        buyerId ? String(o.buyer_id) === String(buyerId) : true
      );
      const relevant = mine.filter(o => o.status !== "cancelled");
      setOrders(relevant);
      setLastUpdated(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setError(null);
    } catch (err) {
      setError(err.message || "Gagal memuat status pesanan.");
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (orders.length > 0 && openCard === null) {
      setOpenCard(orders[0].id);
      loadItemsForOrder(orders[0].id);
    }
  }, [orders]);

  useEffect(() => {
    const hasActive = orders.some(o => ACTIVE_STATUSES.includes(o.status));
    if (!hasActive) return;
    const timer = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [orders, fetchOrders]);

  const loadItemsForOrder = async (orderId) => {
    if (itemsCache[orderId] || itemsLoading[orderId]) return;
    setItemsLoading(p => ({ ...p, [orderId]: true }));
    try {
      const detail = await getOrderById(orderId);
      const items = normalizeItems(detail.items || []);
      setItemsCache(p => ({ ...p, [orderId]: items }));
    } catch (err) {
      console.error("Gagal load detail order:", err.message);
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

  const getCfg = (status) =>
    STATUS_CONFIG[status] || { label: status, bg: "rgba(16,86,102,0.1)", color: COLORS.text_dark, icon: "📦", step: 0 };

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const readyOrders = orders.filter(o => o.status === "ready");

  const getStallNames = (orderId) => {
    const items = itemsCache[orderId] || [];
    const names = [...new Set(items.map(i => i.stall_name))];
    return names.length > 0 ? names.join(", ") : null;
  };

  const OrderCard = ({ order, isActive = false }) => {
    const cfg = getCfg(order.status);
    const isOpen = openCard === order.id;
    const currentStep = getStatusStep(order.status);
    const items = itemsCache[order.id] || [];
    const isLoadingItems = itemsLoading[order.id];
    const stallNames = getStallNames(order.id);

    return (
      <div className={`order-card ${isActive ? "active-order" : ""}`}>
        <div className="card-hdr" onClick={() => handleOpenCard(order.id)}>
          <div>
            <div className="card-order-id">Pesanan #{order.id}</div>
            <div className="card-date">{fmtDateTime(order.created_at)}</div>
            {stallNames && <div className="card-stalls">🏪 {stallNames}</div>}
            {!isOpen && items.length > 0 && (
              <div className="card-items-preview">{getItemSummary(items)}</div>
            )}
          </div>
          <div className="card-status-pill" style={{ background: cfg.bg, color: cfg.color }}>
            <span>{cfg.icon}</span> {cfg.label}
          </div>
          <div className="card-total">{fmt(order.total)}</div>
          <span className={`card-chevron ${isOpen ? "open" : ""}`}>▼</span>
        </div>

        {isOpen && (
          <div className="card-body">
            {order.status !== "cancelled" && (
              <div className="progress-wrap">
                <div className="progress-steps">
                  {TIMELINE_STEPS.map((s) => {
                    const sStep = getStatusStep(s.status);
                    const state = sStep < currentStep ? "done" : sStep === currentStep ? "current" : "upcoming";
                    const sCfg = getCfg(s.status);
                    return (
                      <div key={s.status} className={`step-wrap ${state !== "upcoming" ? "done" : ""}`}>
                        <div className={`step-circle ${state}`}>
                          {state === "done" ? "✓" : sCfg.icon || s.status[0].toUpperCase()}
                        </div>
                        <div className={`step-label ${state}`}>
                          {s.label.split(" ").slice(0, 1).join(" ")}<br />
                          {s.label.split(" ").slice(1).join(" ")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card-body-grid">
              <div>
                <div className="items-title">Detail Pesanan</div>
                {isLoadingItems ? (
                  <div className="items-loading">⏳ Memuat detail...</div>
                ) : items.length === 0 ? (
                  <div className="items-loading">Tidak ada detail item.</div>
                ) : (
                  items.map((item, idx) => (
                    <div className="item-mini" key={idx}>
                      <img
                        src={item.foto_url || FALLBACK_IMG}
                        alt={item.nama}
                        className="item-mini-img"
                        onError={e => { e.target.src = FALLBACK_IMG; }}
                      />
                      <div>
                        <div className="item-mini-name">{item.nama}</div>
                        <div className="item-mini-stall">{item.stall_name}</div>
                        <div className="item-mini-qty">×{item.qty}</div>
                      </div>
                      <div className="item-mini-price">{fmt(item.subtotal)}</div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <div className="timeline-title">📍 Riwayat Status</div>
                {order.status === "cancelled" ? (
                  <>
                    <div className="tl-item">
                      <div className="tl-dot-wrap">
                        <div className="tl-dot done" />
                        <div className="tl-line done" />
                      </div>
                      <div>
                        <div className="tl-label">Pesanan dibuat</div>
                        <div className="tl-time">{fmtDateTime(order.created_at)}</div>
                      </div>
                    </div>
                    <div className="tl-item">
                      <div className="tl-dot-wrap">
                        <div className="tl-dot cancelled" />
                      </div>
                      <div>
                        <div className="tl-label">Pesanan dibatalkan</div>
                        <div className="tl-time">-</div>
                      </div>
                    </div>
                  </>
                ) : (
                  TIMELINE_STEPS.map((s, i) => {
                    const sStep = getStatusStep(s.status);
                    const isDone = sStep < currentStep;
                    const isCurrent = sStep === currentStep;
                    if (sStep > currentStep) return null;
                    return (
                      <div className="tl-item" key={s.status}>
                        <div className="tl-dot-wrap">
                          <div className={`tl-dot ${isCurrent ? "current" : "done"}`} />
                          {sStep < currentStep && <div className="tl-line done" />}
                        </div>
                        <div>
                          <div className="tl-label">{s.label}</div>
                          <div className="tl-time">
                            {s.status === "pending" ? fmtDateTime(order.created_at) : "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{css}</style>
      <div className="os-app">
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
            <button className="nav-item active">
              <span className="nav-item-icon">📋</span> Status Pesanan
              {activeOrders.length > 0 && <span className="nav-badge">{activeOrders.length}</span>}
            </button>
            <button className="nav-item" onClick={() => { onGoToHistory(); setSidebarOpen(false); }}>
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

        <div className="os-main">
          <div className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <span className="topbar-title">Status Pesanan</span>
          </div>

          <div className="os-page">
            {loading ? (
              <div className="loading-txt">⏳ Memuat status pesanan...</div>
            ) : error ? (
              <div className="error-banner">⚠️ {error}</div>
            ) : orders.length === 0 ? (
              <div className="empty">
                <div className="empty-emo">📋</div>
                <div className="empty-title">Belum Ada Pesanan</div>
                <div className="empty-sub">Kamu belum punya pesanan aktif.</div>
                <button className="empty-btn" onClick={onGoToHome}>Pesan Sekarang</button>
              </div>
            ) : (
              <>
                {activeOrders.length > 0 && (
                  <div className="active-banner">
                    <span className="active-banner-icon">🍳</span>
                    <div>
                      <div className="active-banner-title">{activeOrders.length} pesanan sedang diproses</div>
                      <div className="active-banner-sub">Refresh otomatis tiap 15 detik</div>
                    </div>
                    <div className="active-banner-right">
                      <div className="active-badge">● Live</div>
                    </div>
                  </div>
                )}
                {lastUpdated && (
                  <div className="last-updated">Terakhir diperbarui pukul {lastUpdated}</div>
                )}
                {activeOrders.length > 0 && (
                  <>
                    <div className="sec-title">⚡ Pesanan Aktif</div>
                    {activeOrders.map(o => <OrderCard key={o.id} order={o} isActive />)}
                  </>
                )}
                {readyOrders.length > 0 && (
                  <>
                    <div className="sec-title" style={{ marginTop: 28 }}>✅ Siap Diambil</div>
                    {readyOrders.map(o => <OrderCard key={o.id} order={o} />)}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
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