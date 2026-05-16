const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// List semua menu
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menus');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tambah menu (Seller)
router.post('/', async (req, res) => {
    const { stall_id, nama, harga, foto_url, stok } = req.body;
    try {
        await pool.query(
            'INSERT INTO menus (stall_id, nama, harga, foto_url, stok) VALUES (?, ?, ?, ?, ?)', 
            [stall_id, nama, harga, foto_url, stok]
        );
        res.status(201).json({ message: "Menu berhasil ditambah!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Earnings (Pendapatan per stan)
router.get('/earnings/:stallId', async (req, res) => {
    const { stallId } = req.params; 
    try {
        const [rows] = await pool.query(
            `SELECT SUM(oi.subtotal) as total_pendapatan 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.stall_id = ? AND o.status = "paid"`,
            [stallId]
        );
        res.json({ 
            stall_id: stallId, 
            total_earnings: rows[0].total_pendapatan || 0 
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;