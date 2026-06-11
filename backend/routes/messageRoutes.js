const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', messageController.getAllMessages);

router.get('/conversations', messageController.getConversations);

router.get('/chat/:userId', messageController.getChatWithUser);

router.post('/', messageController.sendMessage);

router.put('/read/:messageId', messageController.markAsRead);

module.exports = router;