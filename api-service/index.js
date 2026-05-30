require('dotenv').config();
process.env.TZ = 'Asia/Jakarta';
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

console.log("WAKTU:", new Date().toString());
console.log("TZ:", process.env.TZ);

// ── Auth Middleware ───────────
function authMiddleware(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(403).json({ message: "Token tidak valid atau kadaluarsa" });
    }
}

// Import Routes
const menuRoutes    = require('./routes/menus');
const orderRoutes   = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const stallRoutes   = require('./routes/stalls');
const userRoutes    = require('./routes/users');

app.use(cors());
app.use(express.json());

// Rute Default (Health Check) agar tidak "Cannot GET /"
app.get('/', (req, res) => {
    res.status(200).json({ status: "success", message: "API Service Kantin Digital is Running!" });
});

// Publik — tidak butuh login
app.use('/api/menus',    menuRoutes);
app.use('/api/stalls',   stallRoutes);

// Butuh login
app.use('/api/orders',   authMiddleware, orderRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/users',    authMiddleware, userRoutes);

// Cloud Run biasanya menggunakan port 8080 sebagai default, 
// tapi tetap bisa membaca environment variable PORT
const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`API Service JALAN di port ${PORT}`);
    console.log(`Siap menerima request!`);
    console.log(`=========================================`);
});