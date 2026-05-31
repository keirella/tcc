const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. List semua menu
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menus');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Tambah menu baru (Seller)
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

// 3. Earnings (Pendapatan per stan)
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
            stall_id: parseInt(stallId), 
            total_earnings: rows[0].total_pendapatan || 0 
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. GET Detail 1 menu berdasarkan ID (Tambahan Target)
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menus WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. PUT Update data menu / Edit Menu (Tambahan Target)
router.put('/:id', async (req, res) => {
    const { nama, harga, foto_url, stok } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE menus SET nama = ?, harga = ?, foto_url = ?, stok = ? WHERE id = ?',
            [nama, harga, foto_url, stok, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Menu gagal diupdate atau tidak ditemukan" });
        res.json({ message: "Menu berhasil diperbarui!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. DELETE Hapus menu (Tambahan Target)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM menus WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        res.json({ message: "Menu berhasil dihapus!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// 7. PATCH Kurangi stok menu saat payment berhasil
router.patch('/:id/stok', async (req, res) => {
    const { qty } = req.body;
    if (!qty || qty <= 0) return res.status(400).json({ error: "qty harus lebih dari 0" });
    try {
        const [result] = await pool.query(
            'UPDATE menus SET stok = GREATEST(0, stok - ?) WHERE id = ?',
            [qty, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Menu tidak ditemukan" });
        // Kembalikan stok terbaru
        const [rows] = await pool.query('SELECT stok FROM menus WHERE id = ?', [req.params.id]);
        res.json({ message: "Stok berhasil dikurangi", stok: rows[0].stok });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;