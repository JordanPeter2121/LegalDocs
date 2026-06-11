const jwt = require('jsonwebtoken');
const db = require('../config/database');

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ambil user dari database
    const [rows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }
    
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak - role tidak sesuai' });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };