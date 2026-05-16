const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.post('/process', async (req, res) => {
    const { order_id, jumlah } = req.body;
    try {
        // 1. Update status order menjadi 'paid' (sesuai ENUM di database)
        await pool.query('UPDATE orders SET status = "paid" WHERE id = ?', [order_id]);
        
        // 2. Catat ke tabel payments
        await pool.query(
            'INSERT INTO payments (order_id, jumlah, status) VALUES (?, ?, ?)',
            [order_id, jumlah, 'paid']
        );

        res.json({ message: "Pembayaran berhasil diproses!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;