const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config();

app.use(express.json());

// Gunakan routes yang akan di buat
app.use('/auth', authRoutes);
app.use(cors());

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`API Service JALAN di port ${PORT}`);
    console.log(`Siap menerima request!`);
    console.log(`=========================================`);
});