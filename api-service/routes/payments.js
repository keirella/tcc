const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. POST Proses Pembayaran Baru 
router.post('/process', async (req, res) => {
    const { order_id, jumlah } = req.body;
    try {
        // A. Update status order menjadi 'paid' 
        await pool.query('UPDATE orders SET status = "paid" WHERE id = ?', [order_id]);
        
        // B. Catat ke tabel payments
        await pool.query(
            'INSERT INTO payments (order_id, jumlah, status) VALUES (?, ?, ?)',
            [order_id, jumlah, 'paid']
        );

        res.json({ message: "Pembayaran berhasil diproses!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 2. GET Ambil semua riwayat transaksi pembayaran global (Tambahan Target)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM payments ORDER BY id DESC');
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 3. GET Ambil detail data 1 pembayaran berdasarkan ID (Tambahan Target)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Data pembayaran tidak ditemukan" });
        res.json(rows[0]);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. DELETE Batalkan riwayat / Hapus data pembayaran (Tambahan Target)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Data pembayaran tidak ditemukan" });
        
        res.json({ message: `Data riwayat pembayaran #${req.params.id} berhasil dihapus dari sistem` });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;