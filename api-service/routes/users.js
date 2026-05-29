// api-service/routes/users.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// PUT /api/users/fcm-token
router.put('/fcm-token', async (req, res) => {
    const { fcm_token } = req.body;
    const userId = req.user?.id;

    // Log untuk debug
    console.log("[FCM] userId dari token JWT:", userId);
    console.log("[FCM] fcm_token diterima:", fcm_token ? fcm_token.slice(0, 20) + "..." : "KOSONG");

    if (!userId) return res.status(401).json({ message: "User tidak terautentikasi" });
    if (!fcm_token) return res.status(400).json({ message: "fcm_token wajib diisi" });

    try {
        const [result] = await pool.query(
            'UPDATE users SET fcm_token = ? WHERE id = ?',
            [fcm_token, userId]
        );
        console.log("[FCM] Rows updated:", result.affectedRows);
        if (result.affectedRows === 0)
            return res.status(404).json({ message: "User tidak ditemukan di DB" });

        res.json({ message: "FCM token berhasil disimpan" });
    } catch (err) {
        console.error("[FCM] Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;