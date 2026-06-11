const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route untuk Register (Buat Akun Baru)
router.post('/register', authController.register);

// Route untuk Login (Masuk Sistem)
router.post('/login', authController.login);

module.exports = router;