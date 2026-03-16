const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Seed database with sample products
// @route   POST /api/seed/products
// @access  Public (for development)
router.post('/products', async (req, res) => {
    try {
        console.log('🌱 Seeding products...');
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️ Cleared existing products');
        
        // Sample products data
        const sampleProducts = [
            {
                name: "Mountain Shell Jacket",
                price: 189.99,
                imageId: 1015,
                onSale: true,
                category: "clothing",
                description: "Waterproof, breathable mountain shell jacket with taped seams. Perfect for alpine adventures. Features adjustable hood, pit zips, and multiple pockets.",
                stock: 15,
                featured: true,
                rating: 4.8,
                reviews: 124,
                colors: [
                    { name: "Navy", code: "#2b3a4a" },
                    { name: "Terracotta", code: "#c44536" },
                    { name: "Forest", code: "#2e5e4e" }
                ],
                sizes: ["S", "M", "L", "XL"],
                delivery: "Free shipping · 3-5 days"
            },
            {
                name: "Trail Runner GTX",
                price: 145.00,
                imageId: 1018,
                onSale: false,
                category: "footwear",
                description: "Gore-Tex trail running shoes with aggressive grip and responsive cushioning. Built for technical terrain. Waterproof and breathable.",
                stock: 8,
                featured: true,
                rating: 4.9,
                reviews: 89,
                colors: [
                    { name: "Slate", code: "#3e4c5f" },
                    { name: "Brown", code: "#6a4e3b" },
                    { name: "Black", code: "#2d2d2d" }
                ],
                sizes: ["7", "8", "9", "10", "11", "12"],
                delivery: "Express 2-3 days · $9.90"
            },
            {
                name: "Rolltop Backpack 22L",
                price: 89.50,
                imageId: 1043,
                onSale: true,
                category: "accessories",
                description: "Waterproof rolltop backpack with laptop sleeve and padded straps. Ideal for commuting and light hiking. Made from recycled materials.",
                stock: 23,
                featured: true,
                rating: 4.7,
                reviews: 256,
                colors: [
                    { name: "Charcoal", code: "#4a4a4a" },
                    { name: "Tan", code: "#8b6b4d" },
                    { name: "Sage", code: "#435560" }
                ],
                sizes: ["One size"],
                delivery: "Free shipping · 4-6 days"
            },
            {
                name: "Alpine Tent 2P",
                price: 279.99,
                imageId: 100,
                onSale: false,
                category: "camping",
                description: "Lightweight 4-season tent for alpine camping. Sets up quickly and withstands harsh weather. Includes footprint and repair kit.",
                stock: 5,
                featured: true,
                rating: 4.9,
                reviews: 67,
                colors: [
                    { name: "Green", code: "#4e6259" },
                    { name: "Brown", code: "#b3864a" }
                ],
                sizes: ["2P"],
                delivery: "Heavy item · 5-7 days · $15"
            },
            {
                name: "Titanium Camp Stove",
                price: 64.90,
                imageId: 101,
                onSale: false,
                category: "camping",
                description: "Ultralight titanium stove with piezoelectric igniter. Boils water in under 3 minutes. Includes stuff sack and windscreen.",
                stock: 42,
                featured: true,
                rating: 4.8,
                reviews: 412,
                colors: [
                    { name: "Silver", code: "#a5a5a5" },
                    { name: "Copper", code: "#b87333" }
                ],
                sizes: ["One size"],
                delivery: "Free shipping"
            },
            {
                name: "Cold Zone Sleeping Bag",
                price: 159.99,
                imageId: 102,
                onSale: true,
                category: "camping",
                description: "Down-filled sleeping bag rated to 20°F. Compresses small and packs light. Water-resistant shell.",
                stock: 12,
                featured: false,
                rating: 4.8,
                reviews: 178,
                colors: [
                    { name: "Blue", code: "#385e6b" },
                    { name: "Brown", code: "#754c24" }
                ],
                sizes: ["Regular", "Long"],
                delivery: "Free · 3-5 days"
            },
            {
                name: "Rechargeable Headlamp",
                price: 39.90,
                imageId: 103,
                onSale: false,
                category: "accessories",
                description: "500 lumen rechargeable headlamp with red light mode and motion sensor. USB-C charging, waterproof.",
                stock: 67,
                featured: true,
                rating: 4.9,
                reviews: 523,
                colors: [
                    { name: "Black", code: "#2b2b2b" },
                    { name: "Red", code: "#c74b3c" }
                ],
                sizes: ["Adjustable"],
                delivery: "Free shipping"
            },
            {
                name: "Insulated Bottle 1L",
                price: 28.50,
                imageId: 104,
                onSale: false,
                category: "accessories",
                description: "Double-wall vacuum insulated bottle keeps drinks cold for 24h or hot for 12h. Stainless steel, leak-proof cap.",
                stock: 103,
                featured: true,
                rating: 4.9,
                reviews: 892,
                colors: [
                    { name: "Teal", code: "#3b7a8c" },
                    { name: "Red", code: "#a8432d" },
                    { name: "Green", code: "#4a6b5c" }
                ],
                sizes: ["1L"],
                delivery: "Free shipping"
            }
        ];

        // Insert new products
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Seeded ${products.length} products`);

        res.status(201).json({
            success: true,
            message: 'Products seeded successfully',
            count: products.length,
            products
        });

    } catch (error) {
        console.error('❌ Seeding error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed products',
            error: error.message
        });
    }
});

// @desc    Seed admin user
// @route   POST /api/seed/admin
// @access  Public (for development)
router.post('/admin', async (req, res) => {
    try {
        console.log('👑 Creating admin user...');
        
        // Check if admin already exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        
        if (adminExists) {
            console.log('👤 Admin user already exists');
            return res.json({
                success: true,
                message: 'Admin user already exists',
                user: {
                    email: adminExists.email,
                    role: adminExists.role
                }
            });
        }

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully');
        
        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('❌ Admin creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create admin user',
            error: error.message
        });
    }
});

// @desc    Get seed status
// @route   GET /api/seed/status
// @access  Public
router.get('/status', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        const userCount = await User.countDocuments();
        const adminUser = await User.findOne({ role: 'admin' });
        
        res.json({
            success: true,
            database: mongoose.connection.name,
            productsInDatabase: productCount,
            usersInDatabase: userCount,
            adminExists: adminUser ? true : false,
            adminEmail: adminUser ? adminUser.email : null,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get status',
            error: error.message
        });
    }
});

// @desc    Clear all products
// @route   DELETE /api/seed/clear
// @access  Public (for development)
router.delete('/clear', async (req, res) => {
    try {
        await Product.deleteMany({});
        console.log('🗑️ All products cleared');
        
        res.json({
            success: true,
            message: 'All products cleared successfully'
        });

    } catch (error) {
        console.error('❌ Clear error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear products',
            error: error.message
        });
    }
});

// @desc    Reset database (clear all data)
// @route   POST /api/seed/reset
// @access  Public (for development)
router.post('/reset', async (req, res) => {
    try {
        console.log('🔄 Resetting database...');
        
        await Product.deleteMany({});
        await User.deleteMany({});
        
        console.log('✅ Database reset complete');
        
        res.json({
            success: true,
            message: 'Database reset successfully'
        });

    } catch (error) {
        console.error('❌ Reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset database',
            error: error.message
        });
    }
});

// @desc    Seed all data (products + admin)
// @route   POST /api/seed/all
// @access  Public (for development)
router.post('/all', async (req, res) => {
    try {
        console.log('🌱 Seeding all data...');
        
        // Clear existing data
        await Product.deleteMany({});
        console.log('🗑️ Cleared products');
        
        // Seed products
        const sampleProducts = [
            {
                name: "Mountain Shell Jacket",
                price: 189.99,
                imageId: 1015,
                onSale: true,
                category: "clothing",
                description: "Waterproof mountain jacket",
                stock: 15,
                featured: true,
                rating: 4.8,
                reviews: 124,
                delivery: "Free shipping"
            },
            {
                name: "Trail Runner GTX",
                price: 145.00,
                imageId: 1018,
                category: "footwear",
                description: "Trail running shoes",
                stock: 8,
                featured: true,
                rating: 4.9,
                reviews: 89,
                delivery: "Express shipping"
            }
        ];
        
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Seeded ${products.length} products`);
        
        // Seed admin if not exists
        const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
        
        if (!adminExists) {
            await User.create({
                name: 'Admin User',
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log('✅ Admin user created');
        }

        res.status(201).json({
            success: true,
            message: 'All data seeded successfully',
            productsSeeded: products.length,
            adminExists: adminExists ? true : false
        });

    } catch (error) {
        console.error('❌ Seeding error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed data',
            error: error.message
        });
    }
});

module.exports = router;
