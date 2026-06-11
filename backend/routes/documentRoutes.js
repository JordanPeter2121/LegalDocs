const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Konfigurasi Multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file dokumen yang diperbolehkan (PDF, DOC, XLS, PPT, TXT)'));
    }
  }
});

// Middleware untuk handle error upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'File terlalu besar (max 10MB)' });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

router.use(verifyToken);

// Routes
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);

// CREATE - Staff & Admin bisa upload
router.post('/', 
  upload.single('file'), 
  handleUploadError,
  checkRole(['staff', 'admin']), 
  documentController.createDocument
);

// UPDATE - Staff & Admin bisa update (staff hanya milik sendiri)
router.put('/:id', 
  upload.single('file'), 
  handleUploadError,
  checkRole(['staff', 'admin']), 
  documentController.updateDocument
);

// DELETE - Staff & Admin bisa hapus
router.delete('/:id', 
  checkRole(['staff', 'admin']), 
  documentController.deleteDocument
);

// DOWNLOAD - Semua yang login bisa download
router.get('/download/:filename', documentController.downloadFile);

module.exports = router;