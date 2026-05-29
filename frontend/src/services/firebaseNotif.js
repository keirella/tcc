// ── firebaseNotif.js ──────────────────────────────────────────────
// Taruh di: src/services/firebaseNotif.js
//
// Setup:
// 1. Install: npm install firebase
// 2. Buat project Firebase → Enable Cloud Messaging
// 3. Ganti firebaseConfig di bawah dengan config proyekmu
// 4. Generate VAPID key di Firebase Console → Project Settings → Cloud Messaging
// 5. Buat file public/firebase-messaging-sw.js (ada di bawah sebagai komentar)
// ─────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// TODO: ganti dengan config Firebase proyekmu
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
  

// VAPID key dari Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
  const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const BASE_URL_API = import.meta.env.VITE_API_URL || "http://localhost:5002";

/**
 * Simpan FCM token ke BE — dipanggil otomatis setelah dapat token
 * BE butuh endpoint: PUT /api/users/fcm-token  (lihat users_fcm.js)
 */
async function saveFcmTokenToBE(token) {
  try {
    const jwtToken = localStorage.getItem("token");
    if (!jwtToken) return; // belum login, skip
    await fetch(`${BASE_URL_API}/api/users/fcm-token`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ fcm_token: token }),
    });
  } catch (err) {
    console.warn("Gagal simpan FCM token ke BE:", err.message);
  }
}

// Inisialisasi sekali — hindari duplikasi kalau modul di-import berkali-kali
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
let messaging = null;

// Messaging hanya tersedia di browser (bukan SSR)
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (e) {
    console.warn("Firebase Messaging tidak tersedia:", e.message);
  }
}

/**
 * Minta izin notifikasi + ambil FCM token.
 * Panggil ini setelah user login berhasil.
 * 
 * @returns {Promise<string|null>} FCM token, atau null kalau ditolak/error
 */
export async function requestNotifPermission() {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Izin notifikasi ditolak user.");
      return null;
    }
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log("FCM Token:", token);
      await saveFcmTokenToBE(token);
    }
    return token;
  } catch (err) {
    console.error("Gagal mendapatkan FCM token:", err);
    return null;
  }
}

/**
 * Listener untuk notifikasi saat app sedang terbuka (foreground).
 * Panggil sekali di App.jsx atau komponen root.
 * 
 * @param {function} onReceive - callback({ title, body, data })
 * @returns {function} unsubscribe — panggil saat cleanup
 */
export function listenForegroundNotif(onReceive) {
  if (!messaging) return () => {};
  const unsubscribe = onMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    const data = payload.data || {};
    console.log("Notifikasi foreground:", { title, body, data });
    if (onReceive) onReceive({ title, body, data });
  });
  return unsubscribe;
}

// ─────────────────────────────────────────────────────────────────
// FILE WAJIB: public/firebase-messaging-sw.js
// Paste konten ini ke file tersebut (bukan di-import, tapi file terpisah)
// ─────────────────────────────────────────────────────────────────
/*
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

// Tangani notifikasi background (saat tab tidak aktif / browser di-minimize)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data,
  });
});
*/

// ─────────────────────────────────────────────────────────────────
// CARA KIRIM NOTIFIKASI DARI BE (Node.js)
// Install: npm install firebase-admin
// ─────────────────────────────────────────────────────────────────
/*
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // download dari Firebase Console

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

async function sendOrderNotif(fcmToken, status, orderId) {
  const messages = {
    pending:  { title: "⏳ Menunggu Konfirmasi",   body: `Pesanan #${orderId} menunggu konfirmasi pembayaran.` },
    paid:     { title: "✅ Pembayaran Diterima",    body: `Pesanan #${orderId} sudah dibayar, sedang antri masak!` },
    cooking:  { title: "🍳 Sedang Dimasak",         body: `Pesanan #${orderId} sedang dimasak. Tunggu sebentar ya!` },
    ready:    { title: "🎉 Pesanan Siap Diambil!",  body: `Pesanan #${orderId} sudah siap. Ambil di stan ya!` },
    cancelled:{ title: "❌ Pesanan Dibatalkan",     body: `Pesanan #${orderId} dibatalkan.` },
  };
  const notif = messages[status];
  if (!notif || !fcmToken) return;

  await admin.messaging().send({
    token: fcmToken,
    notification: { title: notif.title, body: notif.body },
    data: { order_id: String(orderId), status },
  });
}

// Panggil setiap kali status order diupdate:
// await sendOrderNotif(user.fcm_token, 'cooking', 42);
*/