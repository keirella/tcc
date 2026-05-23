// ── api.js ────────────────────────────────────────────────────────
// Taruh di: src/services/api.js
//
// CARA PAKAI:
// 1. Ganti BASE_URL_AUTH dan BASE_URL_API dengan URL dari Atiqa
// 2. Di tiap komponen, ganti dummy data dengan fungsi dari sini
// ─────────────────────────────────────────────────────────────────

// TODO: ganti dengan URL Cloud Run Atiqa setelah deploy
// Saat development lokal:
const BASE_URL_AUTH = "http://localhost:5001";  // auth-service
const BASE_URL_API  = "http://localhost:5002";  // api-service

// ── Helper ────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("token");
}

async function request(baseUrl, path, options = {}) {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request gagal");
  return data;
}

// ── AUTH ──────────────────────────────────────────────────────────

// POST /auth/register
// body: { name, email, password }
export async function register(name, email, password) {
  return request(BASE_URL_AUTH, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role: "buyer" }),
  });
}

// POST /auth/login
// Untuk buyer: { email, password }
// Untuk seller: { email: kode_unik, password }
export async function login(email, password) {
  const data = await request(BASE_URL_AUTH, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  // Simpan token ke localStorage
  if (data.token) localStorage.setItem("token", data.token);
  return data; // { token, user: { id, name, role } }
}

export function logout() {
  localStorage.removeItem("token");
}

export function getSavedUser() {
  try {
    const token = getToken();
    if (!token) return null;
    // Decode payload JWT (tanpa verifikasi — hanya untuk baca data)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, role, iat, exp }
  } catch {
    return null;
  }
}

// ── STALLS ────────────────────────────────────────────────────────

// GET /api/stalls
export async function getStalls() {
  return request(BASE_URL_API, "/api/stalls");
}

// ── MENUS ─────────────────────────────────────────────────────────

// GET /api/menus
export async function getMenus() {
  return request(BASE_URL_API, "/api/menus");
}

// POST /api/menus  (seller only)
// body: { stall_id, nama, harga, foto_url, stok }
export async function addMenu(menuData) {
  return request(BASE_URL_API, "/api/menus", {
    method: "POST",
    body: JSON.stringify(menuData),
  });
}

// GET /api/menus/earnings/:stallId  (seller only)
export async function getEarnings(stallId) {
  return request(BASE_URL_API, `/api/menus/earnings/${stallId}`);
}

// ── ORDERS ────────────────────────────────────────────────────────

// POST /api/orders
// cart = { [menu_id]: { id, nama, harga, stall_id, qty, ... } }
// Kirim semua item dalam 1 request — Atiqa perlu update orders.js untuk terima array
export async function createOrder(cart, buyerId) {
  const items = Object.values(cart).map(item => ({
    menu_id: item.id,
    stall_id: item.stall_id,
    qty: item.qty,
    subtotal: item.harga * item.qty,
  }));
  const total = items.reduce((a, b) => a + b.subtotal, 0);

  return request(BASE_URL_API, "/api/orders", {
    method: "POST",
    body: JSON.stringify({
      buyer_id: buyerId,
      total,
      items, // Atiqa perlu update orders.js supaya terima array ini
    }),
  });
}

// GET /api/orders  (nanti ditambah Atiqa)
export async function getOrders() {
  return request(BASE_URL_API, "/api/orders");
}

// PUT /api/orders/:id  (nanti ditambah Atiqa — untuk seller update status)
export async function updateOrderStatus(orderId, status) {
  return request(BASE_URL_API, `/api/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// ── PAYMENTS ──────────────────────────────────────────────────────

// POST /api/payments/process
export async function processPayment(orderId, jumlah) {
  return request(BASE_URL_API, "/api/payments/process", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, jumlah }),
  });
}