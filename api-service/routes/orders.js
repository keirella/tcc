// api-service/routes/orders.js
const express = require("express");
const router = express.Router();
const { pool, datastore } = require("../db");

// ── Firebase Admin (untuk push notif) ────────────────────────────
let admin = null;
try {
  admin = require("firebase-admin");
  if (!admin.apps.length) {
    const serviceAccount = require("../db/firebase-key.json");
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
} catch (e) {
  console.warn("Firebase Admin tidak tersedia:", e.message);
}

const STATUS_NOTIF = {
  pending: {
    title: "⏳ Menunggu Konfirmasi",
    body: "Pesananmu masuk, menunggu konfirmasi pembayaran.",
  },
  paid: {
    title: "✅ Pembayaran Diterima",
    body: "Pembayaran dikonfirmasi! Pesananmu segera dimasak.",
  },
  cooking: {
    title: "🍳 Sedang Dimasak",
    body: "Pesananmu sedang dimasak. Tunggu sebentar ya!",
  },
  ready: {
    title: "🎉 Siap Diambil!",
    body: "Pesananmu sudah siap. Ambil di stan sekarang!",
  },
  cancelled: {
    title: "❌ Pesanan Dibatalkan",
    body: "Pesananmu telah dibatalkan.",
  },
};

async function sendOrderNotif(orderId, status) {
  if (!admin) return;
  try {
    const [rows] = await pool.query(
      `SELECT o.buyer_id, u.id as user_id, u.name, u.fcm_token 
             FROM orders o 
             JOIN users u ON o.buyer_id = u.id 
             WHERE o.id = ?`,
      [orderId]
    );
    console.log(
      `[NOTIF] Order #${orderId} → buyer:`,
      rows[0]?.buyer_id,
      rows[0]?.name,
      "| has token:",
      !!rows[0]?.fcm_token
    );
    const fcmToken = rows[0]?.fcm_token;
    if (!fcmToken) {
      console.log(`[NOTIF] Skip — buyer tidak punya FCM token`);
      return;
    }

    const notif = STATUS_NOTIF[status];
    if (!notif) return;

    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: `${notif.title} — Pesanan #${orderId}`,
        body: notif.body,
      },
      data: { order_id: String(orderId), status },
    });
    console.log(`✅ Notif terkirim → order #${orderId} [${status}]`);
  } catch (err) {
    console.warn(`⚠️ Gagal kirim notif order #${orderId}:`, err.message);
  }
}

// ── Kirim notif ke SELLER saat buyer checkout ─────────────────────
async function sendNewOrderNotifToSeller(orderId, buyerName, total, stallId) {
  if (!admin) return;
  try {
    // Cari FCM token seller berdasarkan stall_id
    const [rows] = await pool.query(
      `SELECT u.fcm_token, u.name AS seller_name
             FROM stalls s
             JOIN users u ON s.seller_id = u.id
             WHERE s.id = ?`,
      [stallId]
    );
    const fcmToken = rows[0]?.fcm_token;
    if (!fcmToken) {
      console.log(
        `[NOTIF-SELLER] Skip stall #${stallId} — seller tidak punya FCM token`
      );
      return;
    }
    const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: `🛒 Pesanan Baru Masuk! #${orderId}`,
        body: `${buyerName || "Pembeli"} memesan · Total ${fmt(total)}`,
      },
      data: {
        order_id: String(orderId),
        type: "new_order",
        stall_id: String(stallId),
      },
    });
    console.log(
      `✅ Notif seller terkirim → stall #${stallId} order #${orderId}`
    );
  } catch (err) {
    console.warn(`⚠️ Gagal kirim notif seller stall #${stallId}:`, err.message);
  }
}
// ─────────────────────────────────────────────────────────────────

// 1. POST Buat Pesanan Baru
router.post("/", async (req, res) => {
  const { buyer_id, total, items } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO orders (buyer_id, total, status) VALUES (?, ?, ?)",
      [buyer_id, total, "pending"]
    );
    const orderId = result.insertId;
    const stallOrders = {};

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, menu_id, stall_id, qty, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.menu_id, item.stall_id, item.qty, item.subtotal]
      );
      if (!stallOrders[item.stall_id]) {
        stallOrders[item.stall_id] = {
          order_id: orderId,
          stall_id: parseInt(item.stall_id),
          status: "pending",
          created_at: new Date(),
          menus: [],
        };
      }
      stallOrders[item.stall_id].menus.push({
        menu_id: item.menu_id,
        qty: item.qty,
        subtotal: item.subtotal,
      });
    }

    for (const stallId in stallOrders) {
      const orderKey = datastore.key(["orders", `${orderId}_${stallId}`]);
      await datastore.save({ key: orderKey, data: stallOrders[stallId] });
    }

    // Kirim notifikasi ke setiap seller yang terlibat dalam order ini
    const [buyerRows] = await pool.query(
      "SELECT name FROM users WHERE id = ?",
      [buyer_id]
    );
    const buyerName = buyerRows[0]?.name || "Pembeli";
    // for (const stallId in stallOrders) {
    //     sendNewOrderNotifToSeller(orderId, buyerName, total, parseInt(stallId)).catch(() => {});
    // }

    // res.status(201).json({ message: "Order berhasil masuk!", orderId });
    // Kirim response dulu biar buyer tidak nunggu lama
    res.status(201).json({ message: "Order berhasil masuk!", orderId });

    // Baru kirim notif setelah response — tapi tetap await supaya Cloud Run tidak kill proses
    for (const stallId in stallOrders) {
      try {
        await sendNewOrderNotifToSeller(
          orderId,
          buyerName,
          total,
          parseInt(stallId)
        );
      } catch (e) {
        console.warn(`⚠️ Notif seller stall #${stallId} gagal:`, e.message);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET Semua pesanan
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET Detail 1 order + items (JOIN nama menu & stan)
router.get("/:id", async (req, res) => {
  try {
    const [order] = await pool.query("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);
    if (order.length === 0)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    const [items] = await pool.query(
      `SELECT 
                oi.id, oi.order_id, oi.menu_id, oi.stall_id,
                oi.qty, oi.subtotal,
                m.nama      AS nama,
                m.foto_url  AS foto_url,
                s.nama_stan AS stall_name
             FROM order_items oi
             LEFT JOIN menus  m ON oi.menu_id  = m.id
             LEFT JOIN stalls s ON oi.stall_id = s.id
             WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...order[0], items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. PUT Update status + kirim push notif ke buyer
router.put("/:id", async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await pool.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    // Kirim push notif (fire and forget — tidak blokir response)
    sendOrderNotif(req.params.id, status).catch(() => {});

    res.json({ message: `Status order #${req.params.id} → ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE Hapus order
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM order_items WHERE order_id = ?", [
      req.params.id,
    ]);
    const [result] = await pool.query("DELETE FROM orders WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    res.json({ message: `Order #${req.params.id} berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
