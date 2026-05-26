const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Setup koneksi ke MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,  
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false 
    },
    authPlugins: {
        mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
    }
});

// ENDPOINT REGISTER
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Hash password sebelum disimpan
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );
        
        res.status(201).json({ message: "Registrasi berhasil!", userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// ENDPOINT LOGIN
// ENDPOINT LOGIN (Ubah sementara untuk cek data)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // 1. TAMBAHKAN LOG INI DI PALING ATAS ENDPOINT LOGIN:
    console.log("=== DATA YANG DIKETIK DI WEB ===");
    console.log("Email dari Web:", email);
    console.log("Password dari Web:", password);

    try {
        // Cari user berdasarkan email
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        // 2. TAMBAHKAN LOG INI JUGA:
        console.log("=== DATA USER YANG KETEMU DI DATABASE GCP ===");
        console.log("Hasil Query Row:", rows);

        if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = rows[0];

        // 3. TAMBAHKAN LOG INI UNTUK BANDINGKAN PASSWORD:
        console.log("Password asli dari Web:", password);
        console.log("Password Hash dari GCP:", user.password);

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log("Apakah Bcrypt Match?:", isMatch); // 4. LOG HASIL PENCOCOKAN

        if (!isMatch) return res.status(401).json({ message: "Password salah" });

        // Buat JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login Berhasil",
            token: token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;