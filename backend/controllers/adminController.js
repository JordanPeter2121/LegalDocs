const db = require('../config/database');

// Dapatkan semua users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tambah user baru
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Cek email sudah ada
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    await db.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );

    res.status(201).json({ success: true, message: 'User berhasil ditambahkan' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    await db.execute(
      'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE id = ?',
      [name, email, password, role, id]
    );

    res.json({ success: true, message: 'User berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Jangan izinkan hapus diri sendiri
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dapatkan semua dokumen (termasuk yang dari semua staff)
exports.getAllDocuments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, u.name as created_by_name, u.email as created_by_email
      FROM documents d
      LEFT JOIN users u ON d.created_by = u.id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus dokumen (admin bisa hapus dokumen siapa saja)
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM documents WHERE id = ?', [id]);
    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};