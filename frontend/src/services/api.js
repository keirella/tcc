// ── api.js ────────────────────────────────────────────────────────
// Taruh di: src/services/api.js
// ─────────────────────────────────────────────────────────────────
const BASE_URL_AUTH = "https://auth-service-194342266835.us-central1.run.app/";
const BASE_URL_API  = "https://api-service-194342266835.us-central1.run.app/";

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

export async function register(name, email, password) {
  return request(BASE_URL_AUTH, "/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role: "buyer" }),
  });
}

export async function login(email, password) {
  const data = await request(BASE_URL_AUTH, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function logout() {
  // Hapus FCM token dari DB dulu supaya user ini tidak dapat notif orang lain
  // (penting kalau 1 device dipakai banyak user)
  try {
    const token = getToken();
    if (token) {
      await fetch(`${BASE_URL_API}/api/users/fcm-token`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch { /* tidak perlu crash kalau gagal */ }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("notifs"); // hapus notif lokal juga
}

export function getSavedUser() {
  try {
    const stored = localStorage.getItem("user");
    if (stored) return JSON.parse(stored);
    const token = getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
  } catch {
    return null;
  }
}

// ── STALLS ────────────────────────────────────────────────────────

export async function getStalls() {
  return request(BASE_URL_API, "/api/stalls");
}

export async function getStallById(stallId) {
  return request(BASE_URL_API, `/api/stalls/${stallId}`);
}

export async function getMyStall() {
  return request(BASE_URL_API, "/api/stalls/mine");
}

export async function createStall(stallData) {
  return request(BASE_URL_API, "/api/stalls", {
    method: "POST",
    body: JSON.stringify(stallData),
  });
}

export async function deleteStall(stallId) {
  return request(BASE_URL_API, `/api/stalls/${stallId}`, { method: "DELETE" });
}

export async function getStallEarnings(stallId) {
  return request(BASE_URL_API, `/api/stalls/${stallId}/earnings`);
}

// ── MENUS ─────────────────────────────────────────────────────────

export async function getMenus() {
  return request(BASE_URL_API, "/api/menus");
}

export async function getMenuById(menuId) {
  return request(BASE_URL_API, `/api/menus/${menuId}`);
}

export async function addMenu(menuData) {
  return request(BASE_URL_API, "/api/menus", {
    method: "POST",
    body: JSON.stringify(menuData),
  });
}

export async function updateMenu(menuId, menuData) {
  return request(BASE_URL_API, `/api/menus/${menuId}`, {
    method: "PUT",
    body: JSON.stringify(menuData),
  });
}

export async function deleteMenu(menuId) {
  return request(BASE_URL_API, `/api/menus/${menuId}`, { method: "DELETE" });
}


export async function reduceMenuStock(menuId, qty) {
  return request(BASE_URL_API, `/api/menus/${menuId}/stok`, {
    method: "PATCH",
    body: JSON.stringify({ qty }),
  });
}

export async function getEarnings(stallId) {
  return request(BASE_URL_API, `/api/menus/earnings/${stallId}`);
}

// ── ORDERS ────────────────────────────────────────────────────────

// export async function getOrders() {
//   return request(BASE_URL_API, "/api/orders");
// }

export async function getOrders(stallId) {
  const query = stallId ? `?stall_id=${stallId}` : "";
  return request(BASE_URL_API, `/api/orders${query}`);
}

// Dipakai untuk lazy-load detail items saat kartu order dibuka
export async function getOrderById(orderId) {
  return request(BASE_URL_API, `/api/orders/${orderId}`);
}

export async function updateOrderStatus(orderId, status) {
  return request(BASE_URL_API, `/api/orders/${orderId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteOrder(orderId) {
  return request(BASE_URL_API, `/api/orders/${orderId}`, { method: "DELETE" });
}

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
}

// ── PAYMENTS ──────────────────────────────────────────────────────

export async function processPayment(orderId, jumlah) {
  return request(BASE_URL_API, "/api/payments/process", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, jumlah }),
  });
}

export async function getAllPayments() {
  return request(BASE_URL_API, "/api/payments");
}

export async function getPaymentDetail(paymentId) {
  return request(BASE_URL_API, `/api/payments/${paymentId}`);
}

export async function deletePayment(paymentId) {
  return request(BASE_URL_API, `/api/payments/${paymentId}`, { method: "DELETE" });
}

// ── CHECKOUT HELPER ───────────────────────────────────────────────
// Step 1: createOrder → status 'pending'
// Step 2: processPayment → status 'paid'
// Kalau step 2 gagal, order tetap ada dengan status 'pending'
// User bisa lihat di Status Pesanan dan admin bisa konfirmasi manual
export async function checkoutCart(cart, buyerId) {
  const orderRes = await createOrder(cart, buyerId);
  const orderId = orderRes.orderId;
  const total = Object.values(cart).reduce((a, item) => a + item.harga * item.qty, 0);

  try {
    await processPayment(orderId, total);
  } catch (payErr) {
    const err = new Error("ORDER_CREATED_PAYMENT_FAILED");
    err.orderId = orderId;
    throw err;
  }

  // Stok dikurangi otomatis oleh BE di payments.js saat proses payment
  // Tidak perlu reduceMenuStock di sini supaya tidak dobel

  return { orderId, total };
}