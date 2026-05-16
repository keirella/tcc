const express = require('express');
const router = express.Router();
const { pool, datastore } = require('../db'); 

router.post('/', async (req, res) => {
    const { buyer_id, stall_id, menu_id, qty, total } = req.body;
    try {
        // 1. Simpan data ke MySQL (Tabel orders)
        const [result] = await pool.query(
            'INSERT INTO orders (buyer_id, total, status) VALUES (?, ?, ?)', 
            [buyer_id, total, 'pending']
        );

        const orderId = result.insertId;

        // 2. Simpan detail item ke MySQL (Tabel order_items)
        await pool.query(
            'INSERT INTO order_items (order_id, menu_id, stall_id, qty, subtotal) VALUES (?, ?, ?, ?, ?)',
            [orderId, menu_id, stall_id, qty, total]
        );

        // 3. Simpan ke Firebase (Memakai Datastore Mode)
        const orderKey = datastore.key(['orders', orderId]);
        const orderData = {
            order_id: orderId,
            stall_id: stall_id,
            status: 'pending',
            created_at: new Date()
        };

        await datastore.save({
            key: orderKey,
            data: orderData
        });

        res.status(201).json({ message: "Order berhasil masuk MySQL & Datastore!", orderId: orderId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;