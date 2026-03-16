
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['clothing', 'footwear', 'accessories', 'camping', 'electronics']
    },
    imageId: {
        type: Number,
        default: 100
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        default: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    onSale: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 4.5
    },
    reviews: {
        type: Number,
        default: 0
    },
    colors: [{
        name: String,
        code: String
    }],
    sizes: [String],
    delivery: {
        type: String,
        default: 'Free shipping'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
