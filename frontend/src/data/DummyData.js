// ── SINGLE SOURCE OF TRUTH ───────────────────────────────────────
// Semua halaman import dari sini. Kalau mau ganti dummy data,
// cukup ubah di file ini aja.
// Nanti pas nyambung ke API, ganti dengan fetch/useEffect di tiap komponen.

export const USER = {
    id: 7,
    name: "Budi Santoso",
    email: "budi@gmail.com",
  };
  
  export const STALLS = [
    { id: 1, name: "Stan Padang",   emoji: "🍛", count: 2 },
    { id: 2, name: "Ayam Geprek",   emoji: "🍗", count: 2 },
    { id: 3, name: "Minuman",       emoji: "🧃", count: 2 },
  ];
  
  export const ALL_MENUS = [
    { id: 1, stall_id: 1, nama: "Nasi Rendang",    harga: 15000, stok: 20, foto_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", stall_name: "Stan Padang" },
    { id: 2, stall_id: 1, nama: "Ayam Gulai",      harga: 18000, stok: 15, foto_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80", stall_name: "Stan Padang" },
    { id: 3, stall_id: 2, nama: "Ayam Geprek L1",  harga: 12000, stok: 25, foto_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80", stall_name: "Ayam Geprek" },
    { id: 4, stall_id: 2, nama: "Ayam Geprek L5",  harga: 15000, stok: 20, foto_url: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&q=80", stall_name: "Ayam Geprek" },
    { id: 5, stall_id: 3, nama: "Es Teh Manis",    harga: 5000,  stok: 30, foto_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80", stall_name: "Minuman" },
    { id: 6, stall_id: 3, nama: "Jus Alpukat",     harga: 10000, stok: 0,  foto_url: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80", stall_name: "Minuman" },
  ];
  
  export const POPULAR_MENUS = [ALL_MENUS[0], ALL_MENUS[2], ALL_MENUS[1]];
  
  // Status pesanan
  export const STATUS_CONFIG = {
    pending:   { label: "Menunggu Konfirmasi", icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",    step: 0 },
    paid:      { label: "Pembayaran Diterima", icon: "✅", color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   step: 1 },
    cooking:   { label: "Sedang Dimasak",      icon: "🍳", color: "#D3968C", bg: "rgba(211,150,140,0.12)", step: 2 },
    ready:     { label: "Siap Diambil!",       icon: "🎉", color: "#10b981", bg: "rgba(16,185,129,0.1)",   step: 3 },
    cancelled: { label: "Dibatalkan",          icon: "❌", color: "#ef4444", bg: "rgba(239,68,68,0.1)",    step: -1 },
  };
  
  export const STATUS_STEPS = ["pending", "paid", "cooking", "ready"];
  
  // Dummy orders — dipakai di OrderStatus & History
  export const DUMMY_ORDERS = [
    {
      id: 5,
      created_at: "2026-05-13 10:23",
      status: "cooking",
      total: 30000,
      items: [
        { id: 1, nama: "Nasi Rendang", qty: 2, subtotal: 30000, stall_name: "Stan Padang", foto_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80" },
      ],
      stalls: ["Stan Padang"],
      timeline: [
        { status: "pending", time: "10:23", label: "Pesanan dibuat" },
        { status: "paid",    time: "10:23", label: "Pembayaran dikonfirmasi" },
        { status: "cooking", time: "10:25", label: "Penjual mulai memasak" },
      ],
    },
    {
      id: 4,
      created_at: "2026-05-13 09:45",
      status: "ready",
      total: 27000,
      items: [
        { id: 3, nama: "Ayam Geprek L1", qty: 1, subtotal: 12000, stall_name: "Ayam Geprek", foto_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&q=80" },
        { id: 5, nama: "Es Teh Manis",   qty: 3, subtotal: 15000, stall_name: "Minuman",     foto_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&q=80" },
      ],
      stalls: ["Ayam Geprek", "Minuman"],
      timeline: [
        { status: "pending", time: "09:40", label: "Pesanan dibuat" },
        { status: "paid",    time: "09:41", label: "Pembayaran dikonfirmasi" },
        { status: "cooking", time: "09:42", label: "Penjual mulai memasak" },
        { status: "ready",   time: "09:55", label: "Pesanan siap diambil!" },
      ],
    },
    {
      id: 3,
      created_at: "2026-05-12 12:10",
      status: "ready",
      total: 20000,
      items: [
        { id: 2, nama: "Ayam Gulai",    qty: 1, subtotal: 18000, stall_name: "Stan Padang", foto_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&q=80" },
        { id: 5, nama: "Es Teh Manis",  qty: 2, subtotal:  2000, stall_name: "Minuman",     foto_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&q=80" },
      ],
      stalls: ["Stan Padang", "Minuman"],
      timeline: [
        { status: "pending", time: "12:10", label: "Pesanan dibuat" },
        { status: "paid",    time: "12:11", label: "Pembayaran dikonfirmasi" },
        { status: "cooking", time: "12:13", label: "Penjual mulai memasak" },
        { status: "ready",   time: "12:25", label: "Pesanan siap diambil!" },
      ],
    },
    {
      id: 2,
      created_at: "2026-05-11 11:30",
      status: "cancelled",
      total: 12000,
      items: [
        { id: 3, nama: "Ayam Geprek L1", qty: 1, subtotal: 12000, stall_name: "Ayam Geprek", foto_url: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=200&q=80" },
      ],
      stalls: ["Ayam Geprek"],
      timeline: [
        { status: "pending",   time: "11:30", label: "Pesanan dibuat" },
        { status: "cancelled", time: "11:32", label: "Pesanan dibatalkan" },
      ],
    },
  ];
  
  // Dummy notifikasi
  export const DUMMY_NOTIFS = [
    { id: 1, msg: "Pesanan #5 sedang dimasak 🍳", time: "10:25", read: false },
    { id: 2, msg: "Pesanan #4 sudah siap diambil! ✅", time: "09:55", read: true },
    { id: 3, msg: "Pesanan #3 sudah siap diambil! ✅", time: "12:25", read: true },
  ];
  
  // Helper: ambil menu dari stan yang belum ada di cart
  // Dipakai di Cart.jsx untuk rekomendasi
  export function getRekoMenus(cart) {
    const stallsInCart = new Set(Object.values(cart).map((i) => i.stall_id));
    // Prioritas: menu dari stan yang belum di cart
    const fromOtherStalls = ALL_MENUS.filter(
      (m) => !stallsInCart.has(m.stall_id) && !cart[m.id] && m.stok > 0
    );
    // Kalau semua stan udah ada di cart, tampilkan menu lain yang belum di cart
    const fallback = ALL_MENUS.filter((m) => !cart[m.id] && m.stok > 0);
    const result = fromOtherStalls.length > 0 ? fromOtherStalls : fallback;
    return result.slice(0, 3);
  }