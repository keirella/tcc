const mysql = require('mysql2/promise');
const { Datastore } = require('@google-cloud/datastore'); 
const path = require('path');
require('dotenv').config();

// 1. Koneksi MySQL Terpusat 
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,  
    queueLimit: 0
});

// 2. Konfigurasi Google Cloud Datastore
const datastore = new Datastore({
    keyFilename: path.join(__dirname, 'firebase-key.json'), 
});

module.exports = { pool, datastore };