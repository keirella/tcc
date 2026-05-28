require('dotenv').config();
process.env.TZ = 'Asia/Jakarta';
const express = require('express');
const cors = require('cors');
const app = express();

console.log("WAKTU:", new Date().toString());
console.log("TZ:", process.env.TZ);


// Import Routes
const menuRoutes = require('./routes/menus');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const stallRoutes = require('./routes/stalls');

app.use(cors());
app.use(express.json());

// Daftarkan Routes ke URL
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stalls', stallRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`API Service JALAN di port ${PORT}`);
    console.log(`Siap menerima request!`);
    console.log(`=========================================`);
});