const validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    return password && password.length >= 6;
};

const validateProductData = (data) => {
    const errors = [];
    
    if (!data.name) errors.push('Product name is required');
    if (!data.price || data.price <= 0) errors.push('Valid price is required');
    if (!data.description) errors.push('Description is required');
    if (!data.category) errors.push('Category is required');
    if (data.stock === undefined || data.stock < 0) errors.push('Valid stock is required');
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateOrderData = (data) => {
    const errors = [];
    
    if (!data.items || data.items.length === 0) errors.push('Order must have items');
    if (!data.shippingAddress) errors.push('Shipping address is required');
    if (!data.paymentMethod) errors.push('Payment method is required');
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validateProductData,
    validateOrderData
};
