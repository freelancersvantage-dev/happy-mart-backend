
const crypto = require('crypto');

/**
 * Generate a random string
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
exports.generateRandomString = (length = 10) => {
    return crypto.randomBytes(length).toString('hex').substring(0, length);
};

/**
 * Generate order number
 * @returns {string} Unique order number
 */
exports.generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

/**
 * Format price to currency
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted price
 */
exports.formatPrice = (price, currency = '$') => {
    return `${currency}${parseFloat(price).toFixed(2)}`;
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage
 */
exports.calculateDiscount = (originalPrice, salePrice) => {
    if (originalPrice <= 0 || salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Paginate results
 * @param {Array} data - Array of data
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result
 */
exports.paginateResults = (data, page = 1, limit = 10) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const results = {};
    
    if (endIndex < data.length) {
        results.next = {
            page: page + 1,
            limit: limit
        };
    }
    
    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }
    
    results.total = data.length;
    results.page = page;
    results.limit = limit;
    results.totalPages = Math.ceil(data.length / limit);
    results.data = data.slice(startIndex, endIndex);
    
    return results;
};

/**
 * Sanitize user object (remove sensitive data)
 * @param {Object} user - User object
 * @returns {Object} Sanitized user
 */
exports.sanitizeUser = (user) => {
    if (!user) return null;
    
    const sanitized = user.toObject ? user.toObject() : { ...user };
    delete sanitized.password;
    delete sanitized.__v;
    delete sanitized.resetPasswordToken;
    delete sanitized.resetPasswordExpire;
    
    return sanitized;
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Is valid ObjectId
 */
exports.isValidObjectId = (id) => {
    return id && id.match(/^[0-9a-fA-F]{24}$/);
};

/**
 * Extract pagination from request query
 * @param {Object} query - Request query object
 * @returns {Object} Pagination parameters
 */
exports.getPaginationParams = (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const sort = query.sort || '-createdAt';
    
    return { page, limit, sort };
};

/**
 * Build search query from filters
 * @param {Object} filters - Filter object
 * @returns {Object} MongoDB query
 */
exports.buildSearchQuery = (filters) => {
    const query = {};
    
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } }
        ];
    }
    
    if (filters.category) {
        query.category = filters.category;
    }
    
    if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }
    
    if (filters.inStock === 'true') {
        query.stock = { $gt: 0 };
    }
    
    if (filters.featured === 'true') {
        query.featured = true;
    }
    
    if (filters.onSale === 'true') {
        query.onSale = true;
    }
    
    return query;
};

/**
 * Calculate average rating from reviews
 * @param {Array} reviews - Array of reviews
 * @returns {number} Average rating
 */
exports.calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return sum / reviews.length;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
exports.formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Generate slug from string
 * @param {string} text - Text to convert to slug
 * @returns {string} Slug
 */
exports.generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
exports.groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
exports.deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Sleep promise
 */
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
exports.capitalizeFirstLetter = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
exports.truncateText = (text, length = 100) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} Is empty
 */
exports.isEmptyObject = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Remove empty fields from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
exports.removeEmptyFields = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v != null && v !== '')
    );
};

/**
 * Parse comma-separated string to array
 * @param {string} str - Comma-separated string
 * @returns {Array} Array of values
 */
exports.parseCommaSeparated = (str) => {
    if (!str) return [];
    return str.split(',').map(item => item.trim());
};

/**
 * Create date range for queries
 * @param {string} period - Period (today, week, month, year)
 * @returns {Object} Date range object
 */
exports.getDateRange = (period = 'month') => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            start.setMonth(now.getMonth() - 1);
    }
    
    return { start, end: now };
};

/**
 * Mask email address for privacy
 * @param {string} email - Email to mask
 * @returns {string} Masked email
 */
exports.maskEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    return `${maskedName}@${domain}`;
};

/**
 * Generate SKU for product
 * @param {string} category - Product category
 * @param {string} name - Product name
 * @returns {string} SKU
 */
exports.generateSKU = (category, name) => {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
    const unique = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${categoryCode}-${nameCode}-${unique}`;
};

module.exports = exports;
