
const User = require('../models/User');
const Order = require('../models/Order');
const { ErrorResponse } = require('../utils/errorResponse');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Get user's orders
        const orders = await Order.find({ user: user._id });

        res.json({
            success: true,
            user: {
                ...user.toObject(),
                orders
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Don't allow deleting yourself
        if (user._id.toString() === req.user.id) {
            return next(new ErrorResponse('Cannot delete your own account', 400));
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dashboard stats
// @route   GET /api/users/stats/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await require('../models/Product').countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Get recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(5);
        
        // Calculate total revenue (from paid orders)
        const paidOrders = await Order.find({ paymentStatus: 'paid' });
        const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue
            },
            recentOrders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add to wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        // Check if product already in wishlist
        if (user.wishlist && user.wishlist.includes(req.params.productId)) {
            return next(new ErrorResponse('Product already in wishlist', 400));
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        user.wishlist.push(req.params.productId);
        await user.save();

        res.json({
            success: true,
            message: 'Added to wishlist',
            wishlist: user.wishlist
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return next(new ErrorResponse('User not found', 404));
        }

        if (user.wishlist) {
            user.wishlist = user.wishlist.filter(
                id => id.toString() !== req.params.productId
            );
            await user.save();
        }

        res.json({
            success: true,
            message: 'Removed from wishlist',
            wishlist: user.wishlist || []
        });
    } catch (error) {
        next(error);
    }
};
