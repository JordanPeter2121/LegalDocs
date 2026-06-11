const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Semua route admin harus login dan role admin
router.use(verifyToken);
router.use(checkRole(['admin']));

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/documents', adminController.getAllDocuments);
router.delete('/documents/:id', adminController.deleteDocument);

module.exports = router;