const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        console.log('📦 Creating order with data:', req.body);
        
        const {
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingCost,
            tax,
            total
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in order'
            });
        }

        // Process items and find products
        const processedItems = [];
        for (const item of items) {
            let product;
            
            // Try to find by imageId if it's a number
            if (typeof item.productId === 'string' && /^\d+$/.test(item.productId)) {
                product = await Product.findOne({ imageId: parseInt(item.productId) });
            } else {
                try {
                    product = await Product.findById(item.productId);
                } catch (err) {
                    // Ignore cast errors
                }
            }

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found with ID: ${item.productId}`
                });
            }

            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                price: item.price
            });
        }

        // Create order
        const order = await Order.create({
            user: req.user.id,
            items: processedItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            shippingCost,
            tax,
            total,
            status: 'pending',
            paymentStatus: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order
        });

    } catch (error) {
        console.error('❌ Order creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'name price imageId')
            .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name price imageId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price')
            .sort('-createdAt');

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all functions
module.exports = {
    createOrder,
    getMyOrders,
    getOrder,
    updateOrderStatus,
    getAllOrders
};