
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getDashboardStats,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.post('/wishlist/:productId', addToWishlist);
router.delete('/wishlist/:productId', removeFromWishlist);

// Admin routes
router.get('/stats/dashboard', admin, getDashboardStats);
router.get('/', admin, getUsers);
router.get('/:id', admin, getUser);
router.put('/:id', admin, updateUser);
router.delete('/:id', admin, deleteUser);

module.exports = router;
