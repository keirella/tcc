require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({ status: "success", message: "Auth Service Kantin Digital is Running!" });
});

// Gunakan routes
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`Auth Service JALAN di port ${PORT}`);
    console.log(`Siap menerima request!`);
    console.log(`=========================================`);
});