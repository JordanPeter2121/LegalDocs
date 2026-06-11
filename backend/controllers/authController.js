const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ==========================================
// 📝 REGISTER USER (Buat Akun Baru)
// ==========================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validasi input dasar
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    // 2. Cek apakah email sudah terdaftar
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // 3. Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan user baru ke database
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'staff']
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan akun baru Anda.',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🔐 LOGIN USER (Masuk ke Sistem)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = users[0];

    // 2. Verifikasi password
    // (Support dual mode: hashed bcrypt untuk akun baru, plain text untuk akun demo lama)
    let isPasswordValid = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Password sudah di-hash (bcrypt)
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password masih plain text (fallback kompatibilitas data lama)
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key_default',
      { expiresIn: '24h' }
    );

    // 4. Kirim response ke frontend
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ message: error.message });
  }
};