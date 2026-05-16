const mysql = require('mysql2/promise');
const { Datastore } = require('@google-cloud/datastore'); // Pakai Datastore 
require('dotenv').config();

// Koneksi MySQL kamu
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Konfigurasi Google Cloud Datastore
const datastore = new Datastore({
    keyFilename: "./db/firebase-key.json", 
});

module.exports = { pool, datastore }; 