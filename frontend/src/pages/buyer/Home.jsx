import { useState, useEffect } from "react";
import { getMenus, getStalls, getOrders, getOrderById } from "../../services/api";
import { requestNotifPermission, listenForegroundNotif } from "../../services/firebaseNotif";
import { fmtRelative } from "../../utils/dateUtils";
import { USER, STATUS_CONFIG } from "../../data/DummyData";

// Ambil hanya status aktif (bukan selesai/batal)
const ACTIVE_STATUSES = ["pending", "paid", "cooking"];

const statusLabel = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])
);
const fmt = (n) => "Rp " + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const STALL_EMOJIS = { 1: "🍛", 2: "🍗", 3: "🧃", 4: "🍜", 5: "🥤" };
const FALLBACK_IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80";

const COLORS = {
  primary: "#ffffff", secondary: "#D3968C", accent: "#c07060",
  bg_light: "#F7F4D5", text_dark: "#105666", white: "#ffffff",
  overlay: "rgba(16,86,102,0.4)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: ${COLORS.bg_light}; }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 240px; flex-shrink: 0; background: ${COLORS.primary}; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 200; transition: transform 0.3s; height: 100vh; }
  .sidebar-brand { padding: 24px 20px 20px; border-bottom: 1px solid rgba(211,150,140,0.1); display: flex; align-items: center; gap: 10px; }
  .sidebar-brand-icon { font-size: 28px; }
  .sidebar-brand-name { font-size: 18px; font-weight: 800; color: ${COLORS.text_dark}; }
  .sidebar-brand-sub { font-size: 11px; color: ${COLORS.text_dark}; }
  .sidebar-content-wrapper { flex: 1; overflow-y: auto; display: flex; flex-direction: column; scrollbar-width: thin; }
  .sidebar-nav { padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: ${COLORS.text_dark}; font-size: 14px; font-weight: 500; border: none; background: none; width: 100%; text-align: left; font-family: 'Poppins', sans-serif; position: relative; }
  .nav-item:hover { background: rgba(16,86,102,0.05); }
  .nav-item.active { background: ${COLORS.bg_light}; font-weight: 700; }
  .nav-item-icon { font-size: 18px; flex-shrink: 0; }
  .nav-badge { position: absolute; right: 12px; background: ${COLORS.secondary}; color: white; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
  .active-order-panel { margin: 0 12px 12px; background: rgba(211,150,140,0.2); border-radius: 14px; padding: 12px; border: 1px solid rgba(211,150,140,0.25); }
  .aop-title { font-size: 11px; font-weight: 700; color: #D3968C; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
  .aop-item { padding: 4px 0; }
  .aop-items-text { font-size: 12px; color: ${COLORS.text_dark}; margin-bottom: 4px; }
  .aop-status { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px; background: rgba(211,150,140,0.25); color: #D3968C; }
  .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(16,86,102,0.05); }
  .user-info { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px; margin-bottom: 8px; }
  .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: #D3968C; display: flex; align-items: center; justify-content: center; font-size: 16px; color: #F7F4D5; font-weight: 700; flex-shrink: 0; }
  .user-name { font-size: 13px; font-weight: 600; color: ${COLORS.text_dark}; }
  .user-email { font-size: 11px; color: rgba(16,86,102,0.5); }
  .logout-btn { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 12px; cursor: pointer; transition: all 0.2s; color: ${COLORS.text_dark}; font-size: 13px; font-weight: 600; border: none; background: none; width: 100%; font-family: 'Poppins', sans-serif; }
  .logout-btn:hover { background: rgba(211,150,140,0.1); color: ${COLORS.secondary}; }
  .main-content { margin-left: 240px; flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .topbar { background: ${COLORS.white}; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(211,150,140,0.15); position: sticky; top: 0; z-index: 100; }
  .topbar-title { font-size: 18px; font-weight: 700; color: ${COLORS.text_dark}; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }
  .cart-topbar-btn { display: flex; align-items: center; gap: 8px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 12px; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
  .cart-topbar-btn:hover { opacity: 0.88; }
  .cart-topbar-badge { background: ${COLORS.primary}; color: ${COLORS.text_dark}; font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .notif-topbar-btn { position: relative; display: flex; align-items: center; justify-content: center; background: rgba(211,150,140,0.12); color: ${COLORS.text_dark}; border: none; border-radius: 12px; width: 42px; height: 42px; font-size: 18px; cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s; }
  .notif-topbar-btn:hover { background: rgba(211,150,140,0.22); }
  .notif-topbar-btn.has-notif { background: rgba(211,150,140,0.18); }
  .notif-count { position: absolute; top: 4px; right: 4px; background: ${COLORS.secondary}; color: white; font-size: 9px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
  .notif-panel-popup { position: absolute; top: 54px; right: 0; width: 320px; background: white; border-radius: 18px; box-shadow: 0 8px 32px rgba(16,86,102,0.15); z-index: 200; overflow: hidden; animation: popIn 0.2s ease; }
  @keyframes popIn { from { transform: scale(0.95) translateY(-8px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
  .notif-panel-hdr { padding: 16px 18px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(211,150,140,0.12); }
  .notif-panel-title { font-size: 15px; font-weight: 700; color: ${COLORS.text_dark}; }
  .notif-panel-close { background: none; border: none; font-size: 18px; cursor: pointer; color: rgba(16,86,102,0.4); padding: 2px 6px; border-radius: 6px; }
  .notif-panel-close:hover { background: rgba(211,150,140,0.1); }
  .notif-list { max-height: 340px; overflow-y: auto; }
  .notif-row { display: flex; gap: 12px; padding: 13px 18px; border-bottom: 1px solid rgba(211,150,140,0.07); align-items: flex-start; transition: background 0.15s; cursor: default; }
  .notif-row:last-child { border-bottom: none; }
  .notif-row.unread { background: rgba(211,150,140,0.05); }
  .notif-row:hover { background: rgba(211,150,140,0.08); }
  .notif-dot { width: 8px; height: 8px; border-radius: 50%; background: ${COLORS.secondary}; flex-shrink: 0; margin-top: 5px; }
  .notif-dot.read { background: rgba(16,86,102,0.2); }
  .notif-row-msg { font-size: 13px; color: ${COLORS.text_dark}; line-height: 1.45; font-weight: 500; margin-bottom: 3px; }
  .notif-row-time { font-size: 11px; color: rgba(16,86,102,0.4); }
  .notif-empty { padding: 32px 18px; text-align: center; font-size: 13px; color: rgba(16,86,102,0.4); }
  .hero { background: linear-gradient(135deg, ${COLORS.secondary} 0%, ${COLORS.accent} 100%); padding: 32px 32px 28px; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 240px; height: 240px; background: rgba(247,244,213,0.1); border-radius: 50%; }
  .hero-sub { font-size: 13px; color: rgba(247,244,213,0.8); font-weight: 500; margin-bottom: 4px; }
  .hero-title { font-size: clamp(20px, 3vw, 30px); font-weight: 800; color: #F7F4D5; margin-bottom: 18px; }
  .hero-search-wrap { max-width: 100%; position: relative; }
  .hero-search-ico { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 17px; }
  .hero-search-input { width: 100%; padding: 13px 18px 13px 46px; border-radius: 14px; border: none; color: #105666; font-size: 14px; font-family: 'Poppins', sans-serif; outline: none; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
  .hero-search-input::placeholder { color: rgba(16,86,102,0.38); }
  .page-body { padding: 28px 32px 100px; }
  .chip-row { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; margin-bottom: 28px; }
  .chip-row::-webkit-scrollbar { display: none; }
  .chip { flex-shrink: 0; display: flex; align-items: center; gap: 8px; background: white; border: 2px solid transparent; border-radius: 50px; padding: 9px 18px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(211,150,140,0.1); }
  .chip.active { background: ${COLORS.secondary}; border-color: ${COLORS.secondary}; }
  .chip:hover:not(.active) { border-color: #D3968C; }
  .chip-emo { font-size: 17px; }
  .chip-name { font-size: 13px; font-weight: 600; color: #105666; white-space: nowrap; }
  .chip.active .chip-name { color: ${COLORS.bg_light}; }
  .chip-ct { font-size: 11px; background: rgba(16,86,102,0.1); color: #105666; padding: 2px 8px; border-radius: 99px; font-weight: 600; }
  .chip.active .chip-ct { background: rgba(247,244,213,0.25); color: ${COLORS.bg_light}; }
  .sec-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .sec-title { font-size: 18px; font-weight: 700; color: #105666; }
  .sec-link { font-size: 13px; color: #D3968C; font-weight: 600; background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; }
  .pop-row { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: none; margin-bottom: 36px; }
  .pop-row::-webkit-scrollbar { display: none; }
  .pop-wrap { position: relative; flex-shrink: 0; }
  .pop-card { width: 190px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 16px rgba(211,150,140,0.13); transition: transform 0.2s; }
  .pop-card:hover { transform: translateY(-4px); }
  .pop-img { width: 100%; height: 120px; object-fit: cover; }
  .pop-body { padding: 11px 13px 13px; }
  .pop-stall { font-size: 10px; color: #D3968C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
  .pop-name { font-size: 13px; font-weight: 700; color: #105666; margin-bottom: 5px; }
  .pop-price { font-size: 14px; font-weight: 800; color: #105666; }
  .pop-badge { position: absolute; top: 9px; left: 9px; background: #D3968C; color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 99px; }
  .mgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
  .mcard { background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 12px rgba(211,150,140,0.1); transition: transform 0.2s; }
  .mcard:hover { transform: translateY(-3px); }
  .mcard-img { width: 100%; height: 130px; object-fit: cover; }
  .mcard-body { padding: 12px 13px 13px; }
  .mcard-stall { font-size: 10px; color: #D3968C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
  .mcard-name { font-size: 13px; font-weight: 700; color: #105666; margin-bottom: 4px; line-height: 1.3; }
  .mcard-price { font-size: 14px; font-weight: 800; color: #105666; margin-bottom: 10px; }
  .habis { font-size: 12px; color: #D3968C; font-weight: 600; text-align: center; padding: 7px; background: rgba(211,150,140,0.1); border-radius: 8px; }
  .add-btn { width: 100%; padding: 8px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
  .add-btn:hover { opacity: 0.85; }
  .qty-ctrl { display: flex; align-items: center; justify-content: space-between; background: rgba(211,150,140,0.1); border-radius: 10px; }
  .qty-btn { background: none; border: none; width: 32px; height: 32px; font-size: 17px; font-weight: 700; cursor: pointer; color: #D3968C; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: background 0.15s; font-family: 'Poppins', sans-serif; }
  .qty-btn:hover { background: rgba(211,150,140,0.2); }
  .qty-num { font-size: 14px; font-weight: 700; color: #105666; min-width: 24px; text-align: center; }
  .empty { text-align: center; padding: 60px 20px; }
  .empty-emo { font-size: 52px; margin-bottom: 14px; }
  .empty-txt { font-size: 15px; font-weight: 500; color: #D3968C; }
  .loading-txt { text-align: center; padding: 40px; font-size: 15px; color: #D3968C; font-weight: 500; }
  .bot-bar { position: fixed; bottom: 0; left: 240px; right: 0; padding: 12px 32px 20px; background: linear-gradient(to top, #F7F4D5 70%, transparent); z-index: 99; pointer-events: none; }
  .co-btn { max-width: 100%; width: 100%; display: flex; align-items: center; justify-content: space-between; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 18px; padding: 15px 24px; cursor: pointer; font-family: 'Poppins', sans-serif; box-shadow: 0 8px 28px rgba(211,150,140,0.45); transition: opacity 0.2s; pointer-events: all; }
  .co-btn:hover { opacity: 0.9; }
  .co-left { display: flex; align-items: center; gap: 12px; }
  .co-badge { background: ${COLORS.primary}; color: ${COLORS.text_dark}; font-size: 12px; font-weight: 700; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .co-label { font-size: 15px; font-weight: 700; color: #F7F4D5; }
  .co-price { font-size: 15px; font-weight: 800; color: rgba(247,244,213,0.9); }
  .hamburger { display: none; background: none; border: none; font-size: 22px; cursor: pointer; color: #105666; }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: ${COLORS.overlay}; z-index: 190; }
  .notif-toast { position: fixed; top: 80px; right: 24px; z-index: 999; max-width: 340px; background: white; border-radius: 16px; box-shadow: 0 8px 32px rgba(16,86,102,0.18); padding: 14px 18px; display: flex; align-items: flex-start; gap: 12px; animation: slideInRight 0.3s ease; border-left: 4px solid ${COLORS.secondary}; }
  @keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .notif-toast-icon { font-size: 22px; flex-shrink: 0; }
  .notif-toast-title { font-size: 13px; font-weight: 700; color: ${COLORS.text_dark}; margin-bottom: 3px; }
  .notif-toast-body { font-size: 12px; color: rgba(16,86,102,0.65); line-height: 1.4; }
  .notif-toast-close { margin-left: auto; background: none; border: none; font-size: 16px; cursor: pointer; color: rgba(16,86,102,0.3); flex-shrink: 0; padding: 0 4px; }
  .notif-toast-close:hover { color: ${COLORS.text_dark}; }
  .modal-overlay { position: fixed; inset: 0; background: ${COLORS.overlay}; display: flex; align-items: center; justify-content: center; z-index: 300; backdrop-filter: blur(4px); padding: 20px; }
  .modal { background: ${COLORS.bg_light}; border-radius: 24px; padding: 32px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: popIn 0.25s ease; text-align: center; }
  @keyframes popIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .modal-icon { font-size: 48px; margin-bottom: 14px; }
  .modal-title { font-size: 20px; font-weight: 800; color: ${COLORS.text_dark}; margin-bottom: 8px; }
  .modal-sub { font-size: 14px; color: rgba(16,86,102,0.6); margin-bottom: 24px; line-height: 1.5; }
  .modal-btns { display: flex; gap: 12px; }
  .modal-cancel { flex: 1; padding: 13px; background: rgba(211,150,140,0.12); color: ${COLORS.text_dark}; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }
  .modal-cancel:hover { background: rgba(211,150,140,0.22); }
  .modal-confirm-logout { flex: 1; padding: 13px; background: ${COLORS.secondary}; color: ${COLORS.bg_light}; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s; }
  .modal-confirm-logout:hover { opacity: 0.88; }
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

export default function Home({ cart, setCart, onGoToCart, onGoToStatus, onGoToHistory, onLogout, user }) {
  const [stalls, setStalls] = useState([]);
  const [allMenus, setAllMenus] = useState([]);
  const [popularMenus, setPopularMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStall, setActiveStall] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  // Load notifs dari localStorage supaya tidak hilang saat pindah halaman
  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem("notifs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [toastNotif, setToastNotif] = useState(null); // popup dari atas

  // Pesanan aktif dari API — kosong dulu sampai data datang
  const [activeOrders, setActiveOrders] = useState([]);
  const [activeOrderCount, setActiveOrderCount] = useState(0); // total semua, untuk badge

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dataMenus, dataStalls] = await Promise.all([getMenus(), getStalls()]);

        const menusWithStall = dataMenus.map(m => ({
          ...m,
          stall_name: dataStalls.find(s => s.id === m.stall_id)?.nama_stan || "Stan",
        }));

        const formattedStalls = dataStalls.map(s => ({
          id: s.id,
          name: s.nama_stan,
          emoji: STALL_EMOJIS[s.id] || "🍽️",
          count: dataMenus.filter(m => m.stall_id === s.id).length,
        }));

        setAllMenus(menusWithStall);
        setPopularMenus(menusWithStall.slice(0, 3));
        setStalls(formattedStalls);
      } catch (err) {
        console.error("Gagal memuat data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Setup Firebase push notification — tunggu sampai user & token tersedia
  useEffect(() => {
    // Jangan setup kalau belum login
    if (!user?.id) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    let unsubscribe = () => {};
    const setup = async () => {
      await requestNotifPermission(); // di dalam ini saveFcmTokenToBE dipanggil
      unsubscribe = listenForegroundNotif(({ title, body, data }) => {
        const newNotif = {
          title,
          body,
          data,
          time: new Date().toISOString(), // simpan ISO, format saat render
          read: false,
        };
        setNotifs(prev => {
          const updated = [newNotif, ...prev].slice(0, 20);
          // Persist ke localStorage supaya tidak hilang saat pindah halaman
          try { localStorage.setItem("notifs", JSON.stringify(updated)); } catch {}
          return updated;
        });
        // Tampilkan toast popup dari atas
        setToastNotif(newNotif);
        setTimeout(() => setToastNotif(null), 5000); // hilang setelah 5 detik
      });
    };
    setup().catch(console.warn);
    return () => unsubscribe();
  }, [user?.id]); // re-run kalau user berubah (misal login ulang)

  // Fetch active orders milik user ini, lengkap dengan nama item
  useEffect(() => {
    const loadActiveOrders = async () => {
      try {
        const allOrders = await getOrders();
        const buyerId = user?.id;

        // DEBUG: log untuk cek format buyer_id dari BE
        if (allOrders.length > 0) {
          console.log("[DEBUG] Sample order buyer_id:", allOrders[0].buyer_id, "| user.id:", buyerId);
        }

        // Filter by buyer_id — handle kalau BE kirim number atau string
        const mine = allOrders.filter(o =>
          ACTIVE_STATUSES.includes(o.status) &&
          (buyerId ? String(o.buyer_id) === String(buyerId) : false)
        );

        // Simpan total count untuk badge — sebelum di-slice
        setActiveOrderCount(mine.length);

        if (mine.length === 0) {
          setActiveOrders([]);
          setActiveOrderCount(0);
          return;
        }

        // Fetch detail tiap order untuk dapat nama item
        // Sidebar panel batasi 5 supaya tidak spam BE
        const details = await Promise.allSettled(
          mine.slice(0, 5).map(o => getOrderById(o.id))
        );

        const active = mine.slice(0, 5).map((o, i) => {
          const detail = details[i].status === "fulfilled" ? details[i].value : null;
          const items = detail?.items || [];
          const itemsText = items
            .map(item => item.nama ? `${item.nama} ×${item.qty}` : null)
            .filter(Boolean)
            .join(", ");
          return {
            id: o.id,
            total: o.total,
            status: o.status,
            items: itemsText || `Pesanan #${o.id}`,
          };
        });

        setActiveOrders(active);
      } catch (err) {
        console.error("Gagal memuat pesanan aktif:", err.message);
        setActiveOrders([]);
      }
    };

    loadActiveOrders();
  }, [user]);

  const filtered = allMenus.filter(m => {
    const stallOk = activeStall ? m.stall_id === activeStall : true;
    const searchOk = m.nama.toLowerCase().includes(search.toLowerCase());
    return stallOk && searchOk;
  });

  const addToCart = (menu) => setCart(p => ({ ...p, [menu.id]: { ...menu, qty: (p[menu.id]?.qty || 0) + 1 } }));
  const removeFromCart = (menu) => setCart(p => {
    const n = { ...p };
    if (n[menu.id]?.qty > 1) n[menu.id] = { ...n[menu.id], qty: n[menu.id].qty - 1 };
    else delete n[menu.id];
    return n;
  });

  const totalItems = Object.values(cart).reduce((a, b) => a + b.qty, 0);
  const totalPrice = Object.values(cart).reduce((a, b) => a + b.harga * b.qty, 0);
  const showPopular = !search && !activeStall;
  const displayName = user?.name || USER.name;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
        {showNotifPanel && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowNotifPanel(false)} />}

        {/* Toast notif popup dari atas kanan */}
        {toastNotif && (
          <div className="notif-toast">
            <span className="notif-toast-icon">🔔</span>
            <div>
              {toastNotif.title && <div className="notif-toast-title">{toastNotif.title}</div>}
              <div className="notif-toast-body">{toastNotif.body}</div>
            </div>
            <button className="notif-toast-close" onClick={() => setToastNotif(null)}>✕</button>
          </div>
        )}

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
              <button className="nav-item active" onClick={() => setSidebarOpen(false)}>
                <span className="nav-item-icon">🏠</span> Menu
              </button>
              <button className="nav-item" onClick={() => { onGoToCart(); setSidebarOpen(false); }}>
                <span className="nav-item-icon">🛒</span> Keranjang
                {totalItems > 0 && <span className="nav-badge">{totalItems}</span>}
              </button>
              <button className="nav-item" onClick={() => { onGoToStatus(); setSidebarOpen(false); }}>
                <span className="nav-item-icon">📋</span> Status Pesanan
                {activeOrderCount > 0 && <span className="nav-badge">{activeOrderCount}</span>}
              </button>
              <button className="nav-item" onClick={() => { onGoToHistory(); setSidebarOpen(false); }}>
                <span className="nav-item-icon">🕐</span> Riwayat
              </button>
            </nav>

            {/* Pesanan Aktif — hanya tampil kalau ada data dari API */}
            {activeOrders.length > 0 && (
              <div className="active-order-panel">
                <div className="aop-title">⚡ Pesanan Aktif</div>
                {activeOrders.map(o => (
                  <div className="aop-item" key={o.id}>
                    <div className="aop-items-text">{o.items}</div>
                    <span className="aop-status">{statusLabel[o.status] || o.status}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notifikasi — dihapus karena belum ada endpoint dari BE */}
            {/* TODO: tambahkan kembali setelah BE punya GET /api/notifications */}
          </div>

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

        <div className="main-content">
          <div className="topbar">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
              <span className="topbar-title">Selamat Datang, {displayName.split(" ")[0]}! 👋</span>
            </div>
            <div className="topbar-right">
              <div style={{ position: "relative" }}>
                <button
                  className={`notif-topbar-btn ${notifs.length > 0 ? "has-notif" : ""}`}
                  onClick={() => {
                  setShowNotifPanel(p => {
                    const next = !p;
                    if (next) {
                      // Tandai semua sudah dibaca saat panel dibuka
                      setNotifs(prev => {
                        const updated = prev.map(n => ({ ...n, read: true }));
                        try { localStorage.setItem("notifs", JSON.stringify(updated)); } catch {}
                        return updated;
                      });
                    }
                    return next;
                  });
                }}
                  title="Notifikasi"
                >
                  🔔
                  {notifs.filter(n => !n.read).length > 0 && (
                    <span className="notif-count">{notifs.filter(n => !n.read).length}</span>
                  )}
                </button>
                {showNotifPanel && (
                  <div className="notif-panel-popup">
                    <div className="notif-panel-hdr">
                      <span className="notif-panel-title">🔔 Notifikasi</span>
                      <button className="notif-panel-close" onClick={() => setShowNotifPanel(false)}>✕</button>
                    </div>
                    <div className="notif-list">
                      {notifs.length === 0 ? (
                        <div className="notif-empty">Belum ada notifikasi</div>
                      ) : (
                        notifs.map((n, i) => (
                          <div key={i} className={`notif-row ${n.read ? "" : "unread"}`}>
                            <div className={`notif-dot ${n.read ? "read" : ""}`} />
                            <div>
                              <div className="notif-row-msg">{n.title && <strong>{n.title} — </strong>}{n.body}</div>
                              <div className="notif-row-time">{fmtRelative(n.time)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button className="cart-topbar-btn" onClick={onGoToCart}>
                🛒 <span className="cart-text">Keranjang</span>
                {totalItems > 0 && <span className="cart-topbar-badge">{totalItems}</span>}
              </button>
            </div>
          </div>

          <div className="hero">
            <div className="hero-sub">Mau makan apa hari ini?</div>
            <div className="hero-title">Pesan dari berbagai stan, bayar sekali. 🎉</div>
            <div className="hero-search-wrap">
              <span className="hero-search-ico">🔍</span>
              <input
                className="hero-search-input"
                placeholder="Cari makanan atau minuman..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="page-body">
            {/* STALL CHIPS */}
            <div className="chip-row">
              <div className={`chip ${!activeStall ? "active" : ""}`} onClick={() => setActiveStall(null)}>
                <span className="chip-emo">🍽️</span>
                <span className="chip-name">Semua Stan</span>
                <span className="chip-ct">{allMenus.length}</span>
              </div>
              {stalls.map(s => (
                <div key={s.id} className={`chip ${activeStall === s.id ? "active" : ""}`} onClick={() => setActiveStall(activeStall === s.id ? null : s.id)}>
                  <span className="chip-emo">{s.emoji}</span>
                  <span className="chip-name">{s.name}</span>
                  <span className="chip-ct">{s.count}</span>
                </div>
              ))}
            </div>

            {/* POPULAR */}
            {showPopular && popularMenus.length > 0 && (
              <div style={{ marginBottom: 36 }}>
                <div className="sec-hd">
                  <span className="sec-title">🔥 Populer Hari Ini</span>
                  <button className="sec-link">Lihat semua</button>
                </div>
                <div className="pop-row">
                  {popularMenus.map(m => (
                    <div key={m.id} className="pop-wrap">
                      <div className="pop-card">
                        <img src={m.foto_url || FALLBACK_IMG} alt={m.nama} className="pop-img" onError={e => { e.target.src = FALLBACK_IMG; }} />
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

            {/* MENU GRID */}
            <div className="sec-hd">
              <span className="sec-title">
                {search ? `Hasil "${search}"` : activeStall ? stalls.find(s => s.id === activeStall)?.name : "Semua Menu"}
              </span>
              <span style={{ fontSize: 14, color: "#D3968C", fontWeight: 500 }}>{filtered.length} item</span>
            </div>

            {loading ? (
              <div className="loading-txt">⏳ Memuat menu...</div>
            ) : filtered.length === 0 ? (
              <div className="empty"><div className="empty-emo">🍽️</div><div className="empty-txt">Menu tidak ditemukan</div></div>
            ) : (
              <div className="mgrid">
                {filtered.map(m => {
                  const qty = cart[m.id]?.qty || 0;
                  return (
                    <div key={m.id} className="mcard">
                      <img src={m.foto_url || FALLBACK_IMG} alt={m.nama} className="mcard-img" onError={e => { e.target.src = FALLBACK_IMG; }} />
                      <div className="mcard-body">
                        <div className="mcard-stall">{m.stall_name}</div>
                        <div className="mcard-name">{m.nama}</div>
                        <div className="mcard-price">{fmt(m.harga)}</div>
                        {m.stok === 0 ? (
                          <div className="habis">Stok habis</div>
                        ) : qty > 0 ? (
                          <div className="qty-ctrl">
                            <button className="qty-btn" onClick={() => removeFromCart(m)}>−</button>
                            <span className="qty-num">{qty}</span>
                            <button className="qty-btn" onClick={() => addToCart(m)}>+</button>
                          </div>
                        ) : (
                          <button className="add-btn" onClick={() => addToCart(m)}>+ Tambah</button>
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

        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🚪</div>
              <div className="modal-title">Keluar dari akun?</div>
              <div className="modal-sub">Kamu akan keluar dari Kantin Digital.<br />Keranjang yang belum checkout akan hilang.</div>
              <div className="modal-btns">
                <button className="modal-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
                <button className="modal-confirm-logout" onClick={() => { setShowLogoutModal(false); onLogout(); }}>Ya, Keluar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}