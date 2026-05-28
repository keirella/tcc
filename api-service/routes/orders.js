const express = require('express');
const router = express.Router();
const { pool, datastore } = require('../db'); 

// 1. Buat Pesanan Baru / Checkout Keranjang 
router.post('/', async (req, res) => {
    const { buyer_id, total, items } = req.body; 
    console.log("NODE TIME:", new Date());
    try {
        // A. Simpan data utama ke tabel orders dulu (MySQL)
        const [result] = await pool.query(
            'INSERT INTO orders (buyer_id, total, status) VALUES (?, ?, ?)', 
            [buyer_id, total, 'pending']
        );
        const orderId = result.insertId;
        const stallOrders = {};

        // B. Loop semua item makanan yang dibeli
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items (order_id, menu_id, stall_id, qty, subtotal) 
                 VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.menu_id, item.stall_id, item.qty, item.subtotal]
            );

            // C. Satukan menu yang berasal dari stan yang sama agar tidak saling menimpa
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

        // D. Simpan ke Google Cloud Datastore 
        for (const stallId in stallOrders) {
            const orderKey = datastore.key(['orders', `${orderId}_${stallId}`]);
            await datastore.save({
                key: orderKey,
                data: stallOrders[stallId]
            });
        }

        res.status(201).json({ message: "Order keranjang berhasil masuk MySQL & Datastore!", orderId: orderId });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 2. GET Ambil semua daftar pesanan global 
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY id DESC');
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 3. GET Ambil detail 1 orderan + daftar item makanannya (Tambahan Target)
// router.get('/:id', async (req, res) => {
//     try {
//         const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
//         if (order.length === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        
//         const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
//         res.json({ 
//             ...order[0], 
//             items: items 
//         });
//     } catch (err) { 
//         res.status(500).json({ error: err.message }); 
//     }
// });
// Di orders.js, ganti GET /:id
router.get('/:id', async (req, res) => {
    try {
      const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
      if (order.length === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
      
      // JOIN menus dan stalls biar dapat nama
      const [items] = await pool.query(`
        SELECT 
          oi.*,
          m.nama,
          m.foto_url,
          s.nama_stan as stall_name
        FROM order_items oi
        LEFT JOIN menus m ON oi.menu_id = m.id
        LEFT JOIN stalls s ON oi.stall_id = s.id
        WHERE oi.order_id = ?
      `, [req.params.id]);
      
      res.json({ ...order[0], items });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// 4. PUT Update status pesanan / Kelola Status Seller (Tambahan Target)
router.put('/:id', async (req, res) => {
    const { status } = req.body; 
    try {
        const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        
        res.json({ message: `Status order #${req.params.id} berhasil diubah menjadi: ${status}` });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// 5. DELETE Batalkan / Hapus data transaksi orderan (Tambahan Target)
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);

        const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Order tidak ditemukan" });
        
        res.json({ message: `Data transaksi order #${req.params.id} berhasil dihapus dari sistem` });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

module.exports = router;