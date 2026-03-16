const express = require('express');
const router = express.Router();
const {
    submitContact,
    getMessages,
    getMessage,
    updateMessageStatus,
    deleteMessage,
    replyToMessage
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

// Public route
router.post('/', submitContact);

// Admin routes
router.get('/', protect, admin, getMessages);
router.get('/:id', protect, admin, getMessage);
router.put('/:id', protect, admin, updateMessageStatus);
router.delete('/:id', protect, admin, deleteMessage);
router.post('/:id/reply', protect, admin, replyToMessage);

module.exports = router;
