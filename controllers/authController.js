const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validateEmail, validatePassword } = require('../utils/validation');
const { ErrorResponse } = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return next(new ErrorResponse('Please provide all required fields', 400));
        }

        if (!validateEmail(email)) {
            return next(new ErrorResponse('Please provide a valid email', 400));
        }

        if (!validatePassword(password)) {
            return next(new ErrorResponse('Password must be at least 6 characters', 400));
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return next(new ErrorResponse('User already exists', 400));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return next(new ErrorResponse('Please provide email and password', 400));
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        
        if (!isMatch) {
            return next(new ErrorResponse('Invalid credentials', 401));
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};