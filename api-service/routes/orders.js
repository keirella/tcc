const express = require('express');
const router = express.Router();
const { pool, datastore } = require('../db'); 

// 1. Buat Pesanan Baru / Checkout Keranjang 
router.post('/', async (req, res) => {
    const { buyer_id, total, items } = req.body; 
    try {
        const [result] = await pool.query(
            'INSERT INTO orders (buyer_id, total, status) VALUES (?, ?, ?)', 
            [buyer_id, total, 'pending']
        );
        const orderId = result.insertId;
        const stallOrders = {};

        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (order_id, menu_id, stall_id, qty, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.menu_id, item.stall_id, item.qty, item.subtotal]
            );

            if (!stallOrders[item.stall_id]) {
                stallOrders[item.stall_id] = {
                    order_id: orderId,
                    stall_id: parseInt(item.stall_id),
                    status: 'pending',
                    created_at: new Date(),
                    menus: [] 
                };
            }
            stallOrders[item.stall_id].menus.push({
                menu_id: item.menu_id,
                qty: item.qty,
                subtotal: item.subtotal
            });
        }

        for (const stallId in stallOrders) {
            const orderKey = datastore.key(['orders', `${orderId}_${stallId}`]);
            await datastore.save({
                key: orderKey,
                data: stallOrders[stallId]
            });
        }

        res.status(201).json({ message: "Order berhasil masuk!", orderId: orderId });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 2. GET Semua pesanan — include buyer_id untuk filter di FE
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM orders ORDER BY id DESC'
        );
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 3. GET Detail 1 order + items dengan nama menu & nama stan (JOIN)
// ⚠️ INI YANG DIFIX: tambah JOIN ke menus dan stalls supaya FE dapat nama
router.get('/:id', async (req, res) => {
    try {
        const [order] = await pool.query(
            'SELECT * FROM orders WHERE id = ?', 
            [req.params.id]
        );
        if (order.length === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        
        // JOIN order_items dengan menus dan stalls untuk dapat nama
        const [items] = await pool.query(
            `SELECT 
                oi.id,
                oi.order_id,
                oi.menu_id,
                oi.stall_id,
                oi.qty,
                oi.subtotal,
                m.nama        AS nama,
                m.foto_url    AS foto_url,
                s.nama_stan   AS stall_name
             FROM order_items oi
             LEFT JOIN menus  m ON oi.menu_id  = m.id
             LEFT JOIN stalls s ON oi.stall_id = s.id
             WHERE oi.order_id = ?`,
            [req.params.id]
        );

        res.json({ 
            ...order[0], 
            items: items 
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 4. PUT Update status pesanan
router.put('/:id', async (req, res) => {
    const { status } = req.body; 
    try {
        const [result] = await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?', 
            [status, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        
        res.json({ message: `Status order #${req.params.id} berhasil diubah menjadi: ${status}` });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 5. DELETE Batalkan / Hapus order
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        
        res.json({ message: `Order #${req.params.id} berhasil dihapus` });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;