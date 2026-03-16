const Product = require('../models/Product');
const { validateProductData } = require('../utils/validation');
const { ErrorResponse } = require('../utils/errorResponse');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        console.log('📦 Fetching all products...');
        
        const { category, featured, onSale, limit = 50, page = 1 } = req.query;
        
        // Build filter
        let filter = {};
        if (category) filter.category = category;
        if (featured === 'true') filter.featured = true;
        if (onSale === 'true') filter.onSale = true;
        
        // Pagination
        const skip = (page - 1) * limit;
        
        // Get products
        const products = await Product.find(filter)
            .sort({ featured: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        
        const total = await Product.countDocuments(filter);
        
        console.log(`✅ Found ${products.length} products`);
        
        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            products
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return next(new ErrorResponse('Product not found', 404));
        }
        
        res.status(200).json({
            success: true,
            product
        });
        
    } catch (error) {
        next(error);
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        // Validate product data
        const validation = validateProductData(req.body);
        if (!validation.isValid) {
            return next(new ErrorResponse(validation.errors.join(', '), 400));
        }
        
        const product = await Product.create(req.body);
        
        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return next(new ErrorResponse('Product not found', 404));
        }
        
        res.json({
            success: true,
            product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return next(new ErrorResponse('Product not found', 404));
        }
        
        await product.deleteOne();
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ featured: true }).limit(8);
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const products = await Product.find({ category: req.params.category });
        
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        next(error);
    }
};
