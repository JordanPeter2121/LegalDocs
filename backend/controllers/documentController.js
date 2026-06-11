const db = require('../config/database');
const path = require('path');
const fs = require('fs');

// GET Semua Dokumen
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
    console.error("Error getAllDocuments:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET Dokumen by ID
exports.getDocumentById = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT d.*, u.name as created_by_name, u.email as created_by_email
      FROM documents d
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dokumen tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE Dokumen + Upload File
exports.createDocument = async (req, res) => {
  try {
    const { name, number, start_date, validity, description, status } = req.body;
    
    // Handle file upload
    let filePath = null;
    if (req.file) {
      filePath = '/uploads/' + req.file.filename;
    }

    const [result] = await db.execute(
      `INSERT INTO documents (name, number, start_date, validity, description, status, file_path, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, number, start_date, validity, description || '', status || 'aktif', filePath, req.user.id]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Dokumen berhasil dibuat',
      file: filePath
    });
  } catch (error) {
    console.error("Error createDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Dokumen + Optional Re-upload File
exports.updateDocument = async (req, res) => {
  try {
    const { name, number, start_date, validity, description, status, existing_file } = req.body;
    let filePath = existing_file || null; // Pertahankan file lama jika ada
    
    console.log("Update request:", req.body);
    console.log("Uploaded file:", req.file);

    // Jika ada file baru diupload
    if (req.file) {
      // Hapus file lama jika ada
      if (filePath && filePath.startsWith('/uploads/')) {
        const oldFilePath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("Deleted old file:", oldFilePath);
        }
      }
      filePath = '/uploads/' + req.file.filename;
    }

    await db.execute(
      `UPDATE documents SET 
        name = ?, number = ?, start_date = ?, validity = ?, description = ?, status = ?, file_path = ? 
       WHERE id = ?`,
      [name, number, start_date, validity, description, status, filePath, req.params.id]
    );

    res.json({ success: true, message: 'Dokumen berhasil diupdate', file: filePath });
  } catch (error) {
    console.error("Error updateDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE Dokumen + Hapus File
exports.deleteDocument = async (req, res) => {
  try {
    // Ambil info file sebelum hapus
    const [rows] = await db.execute('SELECT file_path FROM documents WHERE id = ?', [req.params.id]);
    
    await db.execute('DELETE FROM documents WHERE id = ?', [req.params.id]);
    
    // Hapus file fisik jika ada
    if (rows[0]?.file_path && rows[0].file_path.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', rows[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    res.json({ success: true, message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error("Error deleteDocument:", error);
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD File
exports.downloadFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};