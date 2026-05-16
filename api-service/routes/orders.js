const express = require('express');
const router = express.Router();
const { pool, datastore } = require('../db'); 

router.post('/', async (req, res) => {
    const { buyer_id, total, items } = req.body; 
    try {
        // 1. Simpan data utama ke tabel orders dulu
        const [result] = await pool.query(
            'INSERT INTO orders (buyer_id, total, status) VALUES (?, ?, ?)', 
            [buyer_id, total, 'pending']
        );
        const orderId = result.insertId;

        // 2. Loop semua item makanan yang dibeli, masukkan ke order_items
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (order_id, menu_id, stall_id, qty, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.menu_id, item.stall_id, item.qty, item.subtotal]
            );

            // 3. Simpan ke Firebase Realtime Datastore per Item Stan
            const orderKey = datastore.key(['orders', `${orderId}_${item.stall_id}`]);
            await datastore.save({
                key: orderKey,
                data: {
                    order_id: orderId,
                    stall_id: item.stall_id,
                    status: 'pending',
                    created_at: new Date()
                }
            });
        }

        res.status(201).json({ message: "Order keranjang berhasil masuk MySQL & Datastore!", orderId: orderId });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;