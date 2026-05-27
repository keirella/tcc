// ── api.js ────────────────────────────────────────────────────────

// TODO: ganti dengan URL Cloud Run setelah deploy
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

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data; // { token, user: { id, name, role } }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getSavedUser() {
  try {
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload; // { id, role, iat, exp }
  } catch {
    return null;
  }
}

// ── STALLS ────────────────────────────────────────────────────────

// GET /api/stalls — ambil semua stan
export async function getStalls() {
  return request(BASE_URL_API, "/api/stalls");
}

// GET /api/stalls/:id — detail 1 stan
export async function getStallById(stallId) {
  return request(BASE_URL_API, `/api/stalls/${stallId}`);
}

// POST /api/stalls — daftarkan stan baru (admin/seller)
// body: { nama_stan, pemilik, pemilik_id }
export async function createStall(stallData) {
  return request(BASE_URL_API, "/api/stalls", {
    method: "POST",
    body: JSON.stringify(stallData),
  });
}

// DELETE /api/stalls/:id — hapus/tutup stan
export async function deleteStall(stallId) {
  return request(BASE_URL_API, `/api/stalls/${stallId}`, {
    method: "DELETE",
  });
}

// GET /api/stalls/:id/earnings — pendapatan per stan
export async function getStallEarnings(stallId) {
  return request(BASE_URL_API, `/api/stalls/${stallId}/earnings`);
}

// ── MENUS ─────────────────────────────────────────────────────────

// GET /api/menus — semua menu
export async function getMenus() {
  return request(BASE_URL_API, "/api/menus");
}

// GET /api/menus/:id — detail 1 menu
export async function getMenuById(menuId) {
  return request(BASE_URL_API, `/api/menus/${menuId}`);
}

// POST /api/menus — tambah menu baru (seller)
// body: { stall_id, nama, harga, foto_url, stok }
export async function addMenu(menuData) {
  return request(BASE_URL_API, "/api/menus", {
    method: "POST",
    body: JSON.stringify(menuData),
  });
}

// PUT /api/menus/:id — edit menu (seller)
// body: { nama, harga, foto_url, stok }
export async function updateMenu(menuId, menuData) {
  return request(BASE_URL_API, `/api/menus/${menuId}`, {
    method: "PUT",
    body: JSON.stringify(menuData),
  });
}

// DELETE /api/menus/:id — hapus menu (seller)
export async function deleteMenu(menuId) {
  return request(BASE_URL_API, `/api/menus/${menuId}`, {
    method: "DELETE",
  });
}

// GET /api/menus/earnings/:stallId — pendapatan via route menus
export async function getEarnings(stallId) {
  return request(BASE_URL_API, `/api/menus/earnings/${stallId}`);
}

// ── ORDERS ────────────────────────────────────────────────────────

// POST /api/orders — checkout keranjang
// Otomatis buat order + simpan semua item
// cart = { [menu_id]: { id, nama, harga, stall_id, qty, ... } }
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
    body: JSON.stringify({ buyer_id: buyerId, total, items }),
  });
  // Returns: { message, orderId }
}

// GET /api/orders — semua pesanan
// Backend belum support filter by buyer_id — kalau nanti ditambah, pakai query param
export async function getOrders() {
  return request(BASE_URL_API, "/api/orders");
  // Returns: array of { id, buyer_id, total, status, created_at }
}

// GET /api/orders/:id — detail 1 order + items-nya
export async function getOrderById(orderId) {
  return request(BASE_URL_API, `/api/orders/${orderId}`);
  // Returns: { id, buyer_id, total, status, created_at, items: [...] }
}

// PUT /api/orders/:id — update status pesanan (seller/admin)
// status: 'pending' | 'paid' | 'cooking' | 'ready' | 'cancelled'
export async function updateOrderStatus(orderId, status) {
  return request(BASE_URL_API, `/api/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// DELETE /api/orders/:id — batalkan + hapus data order (admin)
export async function deleteOrder(orderId) {
  return request(BASE_URL_API, `/api/orders/${orderId}`, {
    method: "DELETE",
  });
}

// ── PAYMENTS ──────────────────────────────────────────────────────

// POST /api/payments/process — proses pembayaran order
// Otomatis: update status order → 'paid', catat ke tabel payments
// body: { order_id, jumlah }
export async function processPayment(orderId, jumlah) {
  return request(BASE_URL_API, "/api/payments/process", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, jumlah }),
  });
}

// GET /api/payments — semua riwayat pembayaran global
export async function getAllPayments() {
  return request(BASE_URL_API, "/api/payments");
}

// GET /api/payments/:id — detail 1 pembayaran
export async function getPaymentDetail(paymentId) {
  return request(BASE_URL_API, `/api/payments/${paymentId}`);
}

// DELETE /api/payments/:id — hapus data pembayaran (admin)
export async function deletePayment(paymentId) {
  return request(BASE_URL_API, `/api/payments/${paymentId}`, {
    method: "DELETE",
  });
}

// ── CHECKOUT HELPER ───────────────────────────────────────────────
// Gabungkan createOrder + processPayment dalam 1 langkah
// Dipakai di Cart.jsx saat user klik "Konfirmasi & Bayar"
export async function checkoutCart(cart, buyerId) {
  // Step 1: buat order
  const orderRes = await createOrder(cart, buyerId);
  const orderId = orderRes.orderId;

  // Step 2: langsung proses bayar
  const total = Object.values(cart).reduce(
    (a, item) => a + item.harga * item.qty, 0
  );
  await processPayment(orderId, total);

  return { orderId, total };
}