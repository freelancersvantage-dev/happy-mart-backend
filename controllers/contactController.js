
const Contact = require('../models/Contact');
const { ErrorResponse } = require('../utils/errorResponse');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return next(new ErrorResponse('Please provide name, email and message', 400));
        }

        const contact = await Contact.create({
            name,
            email,
            subject: subject || 'Contact Form Message',
            message
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            contact
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getMessages = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        let query = {};
        if (status) query.status = status;

        const messages = await Contact.find(query)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Contact.countDocuments(query);

        res.json({
            success: true,
            count: messages.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            messages
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getMessage = async (req, res, next) => {
    try {
        const message = await Contact.findById(req.params.id);

        if (!message) {
            return next(new ErrorResponse('Message not found', 404));
        }

        // Mark as read
        if (message.status === 'new') {
            message.status = 'read';
            await message.save();
        }

        res.json({
            success: true,
            message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
exports.updateMessageStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!message) {
            return next(new ErrorResponse('Message not found', 404));
        }

        res.json({
            success: true,
            message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteMessage = async (req, res, next) => {
    try {
        const message = await Contact.findById(req.params.id);

        if (!message) {
            return next(new ErrorResponse('Message not found', 404));
        }

        await message.deleteOne();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reply to message
// @route   POST /api/contact/:id/reply
// @access  Private/Admin
exports.replyToMessage = async (req, res, next) => {
    try {
        const { reply } = req.body;
        
        if (!reply) {
            return next(new ErrorResponse('Please provide a reply', 400));
        }

        const message = await Contact.findById(req.params.id);

        if (!message) {
            return next(new ErrorResponse('Message not found', 404));
        }

        // Add reply
        if (!message.replies) {
            message.replies = [];
        }

        message.replies.push({
            user: req.user.id,
            message: reply
        });

        message.status = 'replied';
        await message.save();

        res.json({
            success: true,
            message: 'Reply sent successfully',
            contact: message
        });
    } catch (error) {
        next(error);
    }
};
