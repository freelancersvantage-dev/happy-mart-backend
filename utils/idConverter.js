/**
 * ID Converter Utility
 * Handles conversion between numeric IDs and MongoDB ObjectIds
 */

const mongoose = require('mongoose');

// Store mapping between numeric IDs and ObjectIds
// This will be populated when products are loaded
const idMapping = new Map();

// Reverse mapping for lookup by ObjectId
const reverseMapping = new Map();

/**
 * Initialize the ID mapping from database
 * Call this once when server starts
 */
async function initializeIdMapping() {
    try {
        const Product = require('../models/Product');
        const products = await Product.find({}, '_id imageId');
        
        idMapping.clear();
        reverseMapping.clear();
        
        products.forEach(product => {
            if (product.imageId) {
                // Map numeric ID to ObjectId string
                idMapping.set(product.imageId.toString(), product._id.toString());
                // Map ObjectId to numeric ID (for reference)
                reverseMapping.set(product._id.toString(), product.imageId.toString());
            }
        });
        
        console.log(`✅ ID Mapping initialized: ${idMapping.size} products mapped`);
        console.log('Sample mapping:', Array.from(idMapping.entries()).slice(0, 3));
        
        return { success: true, count: idMapping.size };
    } catch (error) {
        console.error('❌ Failed to initialize ID mapping:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Convert numeric ID to MongoDB ObjectId
 * @param {string|number} numericId - The numeric ID (e.g., "1", 2)
 * @returns {mongoose.Types.ObjectId|null} - MongoDB ObjectId or null if not found
 */
function toObjectId(numericId) {
    const idStr = numericId.toString();
    
    // If it's already a valid ObjectId, return it
    if (mongoose.Types.ObjectId.isValid(idStr) && idStr.length === 24) {
        return new mongoose.Types.ObjectId(idStr);
    }
    
    // Look up in mapping
    const objectIdStr = idMapping.get(idStr);
    if (objectIdStr) {
        return new mongoose.Types.ObjectId(objectIdStr);
    }
    
    console.warn(`⚠️ No ObjectId mapping found for numeric ID: ${idStr}`);
    return null;
}

/**
 * Convert MongoDB ObjectId to numeric ID
 * @param {string|mongoose.Types.ObjectId} objectId - MongoDB ObjectId
 * @returns {string|null} - Numeric ID or null if not found
 */
function toNumericId(objectId) {
    const idStr = objectId.toString();
    return reverseMapping.get(idStr) || null;
}

/**
 * Middleware to automatically convert IDs in requests
 * Use this in your routes to handle both numeric and ObjectId formats
 */
function idConversionMiddleware(req, res, next) {
    // Convert common ID fields
    const idFields = ['productId', 'userId', 'orderId', 'id'];
    
    // Check body
    if (req.body) {
        idFields.forEach(field => {
            if (req.body[field]) {
                const converted = toObjectId(req.body[field]);
                if (converted) {
                    req.body[field] = converted;
                }
            }
        });
        
        // Handle items array (for orders)
        if (req.body.items && Array.isArray(req.body.items)) {
            req.body.items = req.body.items.map(item => {
                if (item.productId) {
                    const converted = toObjectId(item.productId);
                    if (converted) {
                        return { ...item, productId: converted };
                    }
                }
                return item;
            });
        }
    }
    
    // Check params
    if (req.params) {
        idFields.forEach(field => {
            if (req.params[field]) {
                const converted = toObjectId(req.params[field]);
                if (converted) {
                    req.params[field] = converted;
                }
            }
        });
    }
    
    next();
}

/**
 * Refresh the ID mapping (call after adding new products)
 */
async function refreshMapping() {
    return await initializeIdMapping();
}

module.exports = {
    initializeIdMapping,
    toObjectId,
    toNumericId,
    idConversionMiddleware,
    refreshMapping,
    idMapping,
    reverseMapping
};