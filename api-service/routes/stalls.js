// const express = require('express');
// const router = express.Router();
// const { pool } = require('../db');

// // 1. GET Ambil semua daftar stan 
// router.get('/', async (req, res) => {
//     try {
//         const [rows] = await pool.query('SELECT * FROM stalls');
//         res.json(rows);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 2. GET Ambil detail data 1 stan spesifik berdasarkan ID (Tambahan Target)
// router.get('/:id', async (req, res) => {
//     try {
//         const [rows] = await pool.query('SELECT * FROM stalls WHERE id = ?', [req.params.id]);
//         if (rows.length === 0) return res.status(404).json({ message: "Stan tidak ditemukan" });
//         res.json(rows[0]);
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 3. POST Tambah stan baru / Pendaftaran Stan Baru (Tambahan Target)
// router.post('/', async (req, res) => {
//     const { nama_stan, pemilik, pemilik_id } = req.body;
//     try {
//         await pool.query(
//             'INSERT INTO stalls (nama_stan, pemilik, pemilik_id) VALUES (?, ?, ?)',
//             [nama_stan, pemilik, pemilik_id]
//         );
//         res.status(201).json({ message: "Stan baru berhasil didaftarkan!" });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 4. DELETE Hapus / Tutup stan berdasarkan ID (Tambahan Target)
// router.delete('/:id', async (req, res) => {
//     try {
//         const [result] = await pool.query('DELETE FROM stalls WHERE id = ?', [req.params.id]);
//         if (result.affectedRows === 0) return res.status(404).json({ message: "Stan tidak ditemukan" });
        
//         res.json({ message: `Stan dengan ID #${req.params.id} berhasil dihapus dari sistem` });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// // 5. GET Alternatif Cek Pendapatan via Route Stall (Tambahan Target)
// router.get('/:id/earnings', async (req, res) => {
//     try {
//         const [rows] = await pool.query(
//             `SELECT SUM(oi.subtotal) as total_pendapatan 
//              FROM order_items oi 
//              JOIN orders o ON oi.order_id = o.id 
//              WHERE oi.stall_id = ? AND o.status = "paid"`, 
//             [req.params.id]
//         );
//         res.json({ stall_id: parseInt(req.params.id), total_earnings: rows[0].total_pendapatan || 0 });
//     } catch (err) { res.status(500).json({ error: err.message }); }
// });

// module.exports = router;

// api-service/routes/stalls.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. GET Semua stan
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stalls');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. GET Stan milik seller yang sedang login
// GET /api/stalls/mine — pakai req.user dari authMiddleware
const jwt = require('jsonwebtoken');

router.get('/mine', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const sellerId = decoded.id;

    const [rows] = await pool.query(
      'SELECT * FROM stalls WHERE seller_id = ?', [sellerId]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Stan tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET Detail 1 stan by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM stalls WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Stan tidak ditemukan" });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. POST Tambah stan baru
router.post('/', async (req, res) => {
    const { nama_stan, pemilik, pemilik_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO stalls (nama_stan, pemilik, pemilik_id) VALUES (?, ?, ?)',
            [nama_stan, pemilik, pemilik_id]
        );
        res.status(201).json({ message: "Stan baru berhasil didaftarkan!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. DELETE Hapus stan
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM stalls WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Stan tidak ditemukan" });
        res.json({ message: `Stan #${req.params.id} berhasil dihapus` });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. GET Pendapatan stan
router.get('/:id/earnings', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT SUM(oi.subtotal) as total_pendapatan 
             FROM order_items oi 
             JOIN orders o ON oi.order_id = o.id 
             WHERE oi.stall_id = ? AND o.status = "paid"`,
            [req.params.id]
        );
        res.json({ stall_id: parseInt(req.params.id), total_earnings: rows[0].total_pendapatan || 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;