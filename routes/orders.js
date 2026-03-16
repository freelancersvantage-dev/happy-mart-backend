const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');

// Import all controller functions
const {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    getAllOrders
} = require('../controllers/orderController');

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);

// Admin routes
router.get('/', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);

module.exports = router;