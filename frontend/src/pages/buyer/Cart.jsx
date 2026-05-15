import { useState } from "react";

// ── Theme (sama persis dengan Home.jsx) ───────────────────────────
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

const fmt = (n) => "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function groupByStall(cart) {
  const groups = {};
  Object.values(cart).forEach((item) => {
    if (!groups[item.stall_name]) groups[item.stall_name] = [];
    groups[item.stall_name].push(item);
  });
  return groups;
}

// Rekomendasi menu (dummy — nanti dari API)
const rekoMenus = [
  { id: 5, nama: "Es Teh Manis", harga: 5000, stall_name: "Minuman", foto_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&q=80" },
  { id: 2, nama: "Ayam Gulai", harga: 18000, stall_name: "Stan Padang", foto_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=80" },
  { id: 3, nama: "Ayam Geprek L1", harga: 12000, stall_name: "Ayam Geprek", foto_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300&q=80" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }

  /* ── LAYOUT ── */
  .cart-app { display: flex; min-height: 100vh; }

  /* ── SIDEBAR (sama dengan Home) ── */
  .sidebar {
    width: 240px; flex-shrink: 0;
    background: ${COLORS.primary};
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 200; transition: transform 0.3s;
    border-right: 1px solid rgba(211,150,140,0.15);
  }
  .sidebar-brand {
    padding: 24px 20px 20px;
    border-bottom: 1px solid rgba(211,150,140,0.1);
    display: flex; align-items: center; gap: 10px;
  }
  .sidebar-brand-icon { font-size: 28px; }
  .sidebar-brand-name { font-size: 18px; font-weight: 800; color: ${COLORS.text_dark}; }
  .sidebar-brand-sub { font-size: 11px; color: rgba(16,86,102,0.5); }
  .sidebar-nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s;
    color: ${COLORS.text_dark}; font-size: 14px; font-weight: 500;
    border: none; background: none; width: 100%; text-align: left;
    font-family: 'Poppins', sans-serif; position: relative;
  }
  .nav-item:hover { background: rgba(16,86,102,0.05); }
  .nav-item.active { background: ${COLORS.bg_light}; font-weight: 700; }
  .nav-item-icon { font-size: 18px; flex-shrink: 0; }
  .nav-badge {
    position: absolute; right: 12px;
    background: ${COLORS.secondary}; color: white;
    font-size: 10px; font-weight: 700;
    min-width: 18px; height: 18px; border-radius: 99px;
    display: flex; align-items: center; justify-content: center; padding: 0 4px;
  }
  .sidebar-footer {
    padding: 16px 12px; margin-top: auto;
    border-top: 1px solid rgba(211,150,140,0.1);
  }
  .user-info { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px; margin-bottom: 8px; }
  .user-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: ${COLORS.secondary};
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: ${COLORS.bg_light}; font-weight: 700; flex-shrink: 0;
  }
  .user-name { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .user-email { font-size: 11px; color: rgba(16,86,102,0.45); }
  .logout-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 12px;
    cursor: pointer; transition: all 0.2s;
    color: ${COLORS.text_dark}; font-size: 13px; font-weight: 600;
    border: none; background: none; width: 100%;
    font-family: 'Poppins', sans-serif;
  }
  .logout-btn:hover { background: rgba(211,150,140,0.1); color: ${COLORS.secondary}; }
  .sidebar-overlay {
    display: none; position: fixed; inset: 0;
    background: ${COLORS.overlay}; z-index: 190;
  }
  .hamburger {
    display: none; background: none; border: none;
    font-size: 22px; cursor: pointer; color: ${COLORS.text_dark};
  }

  /* ── TOPBAR ── */
  .topbar {
    background: ${COLORS.white};
    padding: 0 24px; height: 64px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid rgba(211,150,140,0.15);
    position: sticky; top: 0; z-index: 100;
  }
  .back-btn {
    background: ${COLORS.bg_light}; border: none; border-radius: 10px;
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 18px; color: ${COLORS.text_dark};
    transition: background 0.2s; flex-shrink: 0;
  }
  .back-btn:hover { background: rgba(211,150,140,0.15); }
  .topbar-title { font-size: 18px; font-weight: 700; color: ${COLORS.text_dark}; }
  .topbar-sub { font-size: 13px; color: ${COLORS.secondary}; font-weight: 500; }

  /* ── MAIN ── */
  .cart-main {
    margin-left: 240px; flex: 1; min-width: 0;
    display: flex; flex-direction: column;
  }

  /* ── PAGE LAYOUT ── */
  .cart-page {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 24px;
    padding: 28px 32px 120px;
    align-items: start;
    max-width: 1200px;
  }

  /* ── SECTION TITLE ── */
  .col-title { font-size: 17px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 16px; }

  /* ── STALL GROUP ── */
  .stall-group {
    background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(211,150,140,0.1); margin-bottom: 20px;
  }
  .stall-hdr {
    background: rgba(211,150,140,0.07);
    padding: 14px 20px;
    display: flex; align-items: center; gap: 8px;
    border-bottom: 1px solid rgba(211,150,140,0.12);
  }
  .stall-hdr-name { font-size: 15px; font-weight: 700; color: ${COLORS.text_dark}; }
  .stall-hdr-ct { font-size: 12px; color: ${COLORS.secondary}; font-weight: 500; }
  .stall-subtotal { font-size: 13px; font-weight: 700; color: ${COLORS.text_dark}; margin-left: auto; }

  /* ── ITEM ROW ── */
  .item-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 20px;
    border-bottom: 1px solid rgba(211,150,140,0.07);
  }
  .item-row:last-of-type { border-bottom: none; }
  .item-img { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; flex-shrink: 0; }
  .item-info { flex: 1; min-width: 0; }
  .item-name { font-size: 14px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 3px; }
  .item-price-unit { font-size: 12px; color: ${COLORS.secondary}; font-weight: 500; }
  .item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
  .item-subtotal { font-size: 14px; font-weight: 800; color: ${COLORS.text_dark}; }
  .qty-ctrl { display: flex; align-items: center; background: rgba(211,150,140,0.1); border-radius: 10px; }
  .qty-btn {
    background: none; border: none; width: 32px; height: 32px;
    font-size: 17px; font-weight: 700; cursor: pointer; color: ${COLORS.secondary};
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; transition: background 0.15s; font-family: 'Poppins', sans-serif;
  }
  .qty-btn:hover { background: rgba(211,150,140,0.2); }
  .qty-num { font-size: 14px; font-weight: 700; color: ${COLORS.text_dark}; min-width: 26px; text-align: center; }
  .del-btn {
    background: none; border: none; width: 30px; height: 30px; font-size: 15px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; transition: background 0.15s;
  }
  .del-btn:hover { background: rgba(211,150,140,0.15); }

  /* ── CATATAN PER STAN ── */
  .note-wrap { padding: 4px 20px 16px; }
  .note-label { font-size: 12px; font-weight: 600; color: ${COLORS.secondary}; margin-bottom: 6px; display: block; }
  .note-input {
    width: 100%; padding: 10px 13px;
    border: 1.5px solid rgba(211,150,140,0.25);
    border-radius: 10px; background: ${COLORS.bg_light};
    font-size: 13px; color: ${COLORS.text_dark};
    font-family: 'Poppins', sans-serif; resize: none; outline: none;
    transition: border 0.2s;
  }
  .note-input:focus { border-color: ${COLORS.secondary}; }
  .note-input::placeholder { color: rgba(16,86,102,0.3); }

  /* ── SUMMARY CARD ── */
  .summary-card {
    background: white; border-radius: 20px; padding: 22px;
    box-shadow: 0 2px 12px rgba(211,150,140,0.1);
    position: sticky; top: 88px;
  }
  .sum-title { font-size: 17px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 18px; }
  .sum-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
  .sum-label { font-size: 13px; color: ${COLORS.text_dark}; font-weight: 500; }
  .sum-val { font-size: 13px; color: ${COLORS.text_dark}; font-weight: 600; }
  .sum-divider { height: 1px; background: rgba(211,150,140,0.18); margin: 14px 0; }
  .sum-total-label { font-size: 16px; font-weight: 700; color: ${COLORS.text_dark}; }
  .sum-total-val { font-size: 20px; font-weight: 800; color: ${COLORS.secondary}; }

  /* estimasi */
  .est-box {
    background: rgba(211,150,140,0.08);
    border-radius: 12px; padding: 12px 14px;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 14px;
  }
  .est-icon { font-size: 20px; }
  .est-label { font-size: 12px; color: ${COLORS.text_dark}; font-weight: 500; }
  .est-val { font-size: 13px; font-weight: 700; color: ${COLORS.secondary}; }

  .pay-btn {
    width: 100%; margin-top: 18px;
    padding: 15px; background: ${COLORS.secondary};
    color: ${COLORS.bg_light}; border: none; border-radius: 14px;
    font-size: 15px; font-weight: 700; cursor: pointer;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 6px 20px rgba(211,150,140,0.35);
    transition: opacity 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .pay-btn:hover { opacity: 0.88; }

  /* ── REKOMENDASI ── */
  .reko-section { margin-top: 8px; }
  .reko-row { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
  .reko-row::-webkit-scrollbar { display: none; }
  .reko-card {
    flex-shrink: 0; width: 150px; background: white;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 2px 10px rgba(211,150,140,0.1);
    transition: transform 0.2s;
  }
  .reko-card:hover { transform: translateY(-2px); }
  .reko-img { width: 100%; height: 90px; object-fit: cover; }
  .reko-body { padding: 8px 10px 10px; }
  .reko-stall { font-size: 9px; color: ${COLORS.secondary}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
  .reko-name { font-size: 12px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 4px; line-height: 1.3; }
  .reko-price { font-size: 12px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 8px; }
  .reko-add {
    width: 100%; padding: 6px; background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 8px; font-size: 11px; font-weight: 600;
    cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s;
  }
  .reko-add:hover { opacity: 0.85; }

  /* ── EMPTY ── */
  .empty-page { max-width: 500px; margin: 80px auto; padding: 0 24px; text-align: center; }
  .empty-emo { font-size: 64px; margin-bottom: 20px; }
  .empty-title { font-size: 22px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 8px; }
  .empty-sub { font-size: 15px; color: ${COLORS.secondary}; margin-bottom: 28px; line-height: 1.6; }
  .empty-btn {
    padding: 14px 36px; background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 14px; font-size: 15px; font-weight: 700;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    box-shadow: 0 6px 20px rgba(211,150,140,0.35); transition: opacity 0.2s;
  }
  .empty-btn:hover { opacity: 0.88; }

  /* ── MODAL KONFIRMASI ── */
  .overlay {
    position: fixed; inset: 0;
    background: ${COLORS.overlay};
    display: flex; align-items: center; justify-content: center;
    z-index: 300; backdrop-filter: blur(4px); padding: 20px;
  }
  .modal {
    background: ${COLORS.bg_light}; border-radius: 24px; padding: 32px;
    width: 100%; max-width: 460px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: popIn 0.25s ease;
  }
  @keyframes popIn {
    from { transform: scale(0.92); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .modal-title { font-size: 22px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 6px; }
  .modal-sub { font-size: 14px; color: ${COLORS.secondary}; margin-bottom: 22px; }
  .modal-items { margin-bottom: 16px; max-height: 220px; overflow-y: auto; }
  .modal-item {
    display: flex; justify-content: space-between;
    padding: 9px 0; border-bottom: 1px solid rgba(211,150,140,0.15);
    font-size: 14px; color: ${COLORS.text_dark};
  }
  .modal-item:last-child { border-bottom: none; }
  .modal-item-name { font-weight: 500; }
  .modal-item-val { font-weight: 700; }
  .modal-total {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0; border-top: 2px solid rgba(211,150,140,0.2); margin-bottom: 22px;
  }
  .modal-total-lbl { font-size: 16px; font-weight: 700; color: ${COLORS.text_dark}; }
  .modal-total-val { font-size: 22px; font-weight: 800; color: ${COLORS.secondary}; }
  .modal-btns { display: flex; gap: 12px; }
  .modal-cancel {
    flex: 1; padding: 14px; background: rgba(211,150,140,0.12);
    color: ${COLORS.text_dark}; border: none; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'Poppins', sans-serif; transition: background 0.2s;
  }
  .modal-cancel:hover { background: rgba(211,150,140,0.22); }
  .modal-confirm {
    flex: 2; padding: 14px; background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 12px; font-size: 14px; font-weight: 700;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    box-shadow: 0 4px 16px rgba(211,150,140,0.4); transition: opacity 0.2s;
  }
  .modal-confirm:hover { opacity: 0.88; }

  /* ── SUCCESS ── */
  .success-page { max-width: 500px; margin: 80px auto; padding: 0 24px; text-align: center; }
  .success-emo { font-size: 72px; margin-bottom: 20px; }
  .success-title { font-size: 26px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 10px; }
  .success-sub { font-size: 15px; color: ${COLORS.secondary}; line-height: 1.7; margin-bottom: 32px; }
  .success-btn {
    padding: 15px 44px; background: ${COLORS.secondary}; color: ${COLORS.bg_light};
    border: none; border-radius: 14px; font-size: 16px; font-weight: 700;
    cursor: pointer; font-family: 'Poppins', sans-serif;
    box-shadow: 0 6px 20px rgba(211,150,140,0.4); transition: opacity 0.2s;
  }
  .success-btn:hover { opacity: 0.88; }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.open { display: block; }
    .cart-main { margin-left: 0; }
    .hamburger { display: block; }
    .cart-page { grid-template-columns: 1fr; padding: 20px 16px 120px; gap: 16px; }
    .summary-card { position: static; }
  }
  @media (max-width: 480px) {
    .item-img { width: 56px; height: 56px; }
    .item-row { padding: 12px 14px; gap: 10px; }
    .stall-hdr { padding: 12px 14px; }
    .note-wrap { padding: 4px 14px 14px; }
  }
`;

const USER = { name: "Budi Santoso", email: "budi@gmail.com" };

export default function Cart({ cart, setCart, onBack, onGoToStatus, onGoToHome, onGoToHistory, onLogout }) {
  const [notes, setNotes] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = Object.values(cart);
  const groups = groupByStall(cart);

  const addQty = (item) =>
    setCart((p) => ({ ...p, [item.id]: { ...item, qty: item.qty + 1 } }));
  const removeQty = (item) =>
    setCart((p) => {
      const n = { ...p };
      if (n[item.id].qty > 1) n[item.id] = { ...n[item.id], qty: n[item.id].qty - 1 };
      else delete n[item.id];
      return n;
    });
  const deleteItem = (item) =>
    setCart((p) => { const n = { ...p }; delete n[item.id]; return n; });

  const totalItems = items.reduce((a, b) => a + b.qty, 0);
  const subtotal = items.reduce((a, b) => a + b.harga * b.qty, 0);
  const stallCount = Object.keys(groups).length;

  const handleConfirm = () => {
    // TODO: POST /orders + POST /payments ke API
    setShowModal(false);
    setOrdered(true);
    setCart({});
  };

  const Sidebar = ({ active }) => (
    <>
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
          <button className="nav-item active" onClick={() => setSidebarOpen(false)}>
            <span className="nav-item-icon">🛒</span> Keranjang
            {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
          </button>
          <button className="nav-item" onClick={() => { onGoToStatus(); setSidebarOpen(false); }}>
            <span className="nav-item-icon">📋</span> Status Pesanan
          </button>
          <button className="nav-item" onClick={() => { onGoToHistory(); setSidebarOpen(false); }}>
            <span className="nav-item-icon">🕐</span> Riwayat
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{USER.name[0]}</div>
            <div>
              <div className="user-name">{USER.name}</div>
              <div className="user-email">{USER.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}><span>🚪</span> Keluar</button>
        </div>
      </aside>
    </>
  );

  // SUCCESS
  if (ordered) {
    return (
      <>
        <style>{css}</style>
        <div className="cart-app">
          <Sidebar />
          <div className="cart-main">
            <div className="topbar">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <span className="topbar-title">Pesanan Berhasil!</span>
            </div>
            <div className="success-page">
              <div className="success-emo">🎉</div>
              <div className="success-title">Pesanan Diterima!</div>
              <div className="success-sub">
                Pesananmu sudah masuk ke sistem.<br />
                Penjual sedang memproses pesananmu.<br />
                Pantau statusnya di halaman Status Pesanan ya!
              </div>
              <button className="success-btn" onClick={onGoToStatus}>
                Lihat Status Pesanan →
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // EMPTY
  if (items.length === 0) {
    return (
      <>
        <style>{css}</style>
        <div className="cart-app">
          <Sidebar />
          <div className="cart-main">
            <div className="topbar">
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <button className="back-btn" onClick={onBack}>←</button>
              <span className="topbar-title">Keranjang</span>
            </div>
            <div className="empty-page">
              <div className="empty-emo">🛒</div>
              <div className="empty-title">Keranjang Kosong</div>
              <div className="empty-sub">Belum ada makanan yang dipilih.<br />Yuk pilih dulu dari menu!</div>
              <button className="empty-btn" onClick={onBack}>← Kembali ke Menu</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="cart-app">
        <Sidebar />

        <div className="cart-main">
          {/* TOPBAR */}
          <div className="topbar">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <button className="back-btn" onClick={onBack}>←</button>
            <div>
              <div className="topbar-title">Keranjang</div>
              <div className="topbar-sub">{totalItems} item · {stallCount} stan</div>
            </div>
          </div>

          <div className="cart-page">
            {/* KIRI — ITEMS */}
            <div>
              <div className="col-title">Pesananmu</div>

              {Object.entries(groups).map(([stallName, stallItems]) => {
                const stallSubtotal = stallItems.reduce((a, b) => a + b.harga * b.qty, 0);
                return (
                  <div className="stall-group" key={stallName}>
                    <div className="stall-hdr">
                      <span>🏪</span>
                      <span className="stall-hdr-name">{stallName}</span>
                      <span className="stall-hdr-ct">({stallItems.reduce((a, b) => a + b.qty, 0)} item)</span>
                      <span className="stall-subtotal">{fmt(stallSubtotal)}</span>
                    </div>

                    {stallItems.map((item) => (
                      <div className="item-row" key={item.id}>
                        <img src={item.foto_url} alt={item.nama} className="item-img" />
                        <div className="item-info">
                          <div className="item-name">{item.nama}</div>
                          <div className="item-price-unit">{fmt(item.harga)} / porsi</div>
                        </div>
                        <div className="item-right">
                          <button className="del-btn" onClick={() => deleteItem(item)} title="Hapus">🗑️</button>
                          <div className="qty-ctrl">
                            <button className="qty-btn" onClick={() => removeQty(item)}>−</button>
                            <span className="qty-num">{item.qty}</span>
                            <button className="qty-btn" onClick={() => addQty(item)}>+</button>
                          </div>
                          <div className="item-subtotal">{fmt(item.harga * item.qty)}</div>
                        </div>
                      </div>
                    ))}

                    {/* CATATAN PER STAN */}
                    <div className="note-wrap">
                      <span className="note-label">📝 Catatan untuk {stallName}</span>
                      <textarea
                        className="note-input"
                        rows={2}
                        placeholder="Contoh: jangan pedas, tambah kerupuk..."
                        value={notes[stallName] || ""}
                        onChange={(e) => setNotes((p) => ({ ...p, [stallName]: e.target.value }))}
                      />
                    </div>
                  </div>
                );
              })}

              {/* REKOMENDASI */}
              <div className="reko-section">
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text_dark, marginBottom: 14 }}>
                  🍴 Mau tambah ini juga?
                </div>
                <div className="reko-row">
                  {rekoMenus.filter((r) => !cart[r.id]).map((m) => (
                    <div className="reko-card" key={m.id}>
                      <img src={m.foto_url} alt={m.nama} className="reko-img" />
                      <div className="reko-body">
                        <div className="reko-stall">{m.stall_name}</div>
                        <div className="reko-name">{m.nama}</div>
                        <div className="reko-price">{fmt(m.harga)}</div>
                        <button className="reko-add" onClick={() => setCart((p) => ({ ...p, [m.id]: { ...m, stok: 10, qty: 1 } }))}>
                          + Tambah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KANAN — SUMMARY */}
            <div>
              <div className="summary-card">
                <div className="sum-title">Ringkasan Pembayaran</div>

                {/* Estimasi waktu */}
                <div className="est-box">
                  <span className="est-icon">⏱️</span>
                  <div>
                    <div className="est-label">Estimasi siap</div>
                    <div className="est-val">~{stallCount * 10}–{stallCount * 15} menit</div>
                  </div>
                </div>

                {Object.entries(groups).map(([stallName, stallItems]) => (
                  <div key={stallName}>
                    {stallItems.map((item) => (
                      <div className="sum-row" key={item.id}>
                        <span className="sum-label">{item.nama} ×{item.qty}</span>
                        <span className="sum-val">{fmt(item.harga * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                ))}

                <div className="sum-divider" />

                <div className="sum-row">
                  <span className="sum-label">Total Item</span>
                  <span className="sum-val">{totalItems} item</span>
                </div>
                <div className="sum-row">
                  <span className="sum-label">Dari {stallCount} stan</span>
                  <span className="sum-val">{stallCount} stan</span>
                </div>
                <div className="sum-divider" />
                <div className="sum-row">
                  <span className="sum-total-label">Total Bayar</span>
                  <span className="sum-total-val">{fmt(subtotal)}</span>
                </div>

                <button className="pay-btn" onClick={() => setShowModal(true)}>
                  🛒 Bayar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL KONFIRMASI */}
        {showModal && (
          <div className="overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Konfirmasi Pesanan</div>
              <div className="modal-sub">Pastikan pesananmu sudah benar sebelum bayar.</div>
              <div className="modal-items">
                {items.map((item) => (
                  <div className="modal-item" key={item.id}>
                    <span className="modal-item-name">{item.nama} ×{item.qty}</span>
                    <span className="modal-item-val">{fmt(item.harga * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="modal-total">
                <span className="modal-total-lbl">Total Pembayaran</span>
                <span className="modal-total-val">{fmt(subtotal)}</span>
              </div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setShowModal(false)}>Batal</button>
                <button className="modal-confirm" onClick={handleConfirm}>✓ Konfirmasi &amp; Bayar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}