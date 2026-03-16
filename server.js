const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const seedRoutes = require('./routes/seed');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contact');
const { errorHandler } = require('./utils/errorResponse');

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'https://happy-mart.store', 'http://happy-mart.store'],
    credentials: true
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin-panel')));

// MongoDB connection - FIXED VERSION
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4
})
.then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
    // Check products count after connection
    setTimeout(async () => {
        try {
            const Product = require('./models/Product');
            const count = await Product.countDocuments();
            console.log(`📦 Products in database: ${count}`);
            
            if (count === 0) {
                console.log('🌱 No products found. Run: curl -X POST http://localhost:5000/api/seed/products');
            } else {
                console.log('✅ Products are ready to display!');
            }
        } catch (err) {
            console.log('⚠️ Could not check products count');
        }
    }, 1000);
})
.catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'OK', 
        timestamp: new Date(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Test route to verify products
app.get('/api/test', async (req, res) => {
    try {
        const Product = require('./models/Product');
        const count = await Product.countDocuments();
        const products = await Product.find().limit(3);
        
        res.json({
            success: true,
            message: 'Test route working',
            productsInDatabase: count,
            sampleProducts: products
        });
    } catch (error) {
        res.json({ 
            success: false,
            error: error.message 
        });
    }
});

// Error handling middleware
app.use(errorHandler);
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Route not found' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`🌱 Seed API: http://localhost:${PORT}/api/seed/products`);
    console.log(`📊 Seed status: http://localhost:${PORT}/api/seed/status`);
    console.log(`🧪 Test route: http://localhost:${PORT}/api/test`);
});