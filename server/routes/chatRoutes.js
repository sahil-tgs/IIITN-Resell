// server/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const { body, validationResult } = require("express-validator");

// Start a new conversation
router.post(
    "/conversations",
    authMiddleware,
    [
        body("participantId").notEmpty().withMessage("Participant ID is required"),
        body("productId").optional(),
        body("initialMessage").notEmpty().withMessage("Initial message is required"),
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { participantId, productId, initialMessage } = req.body;
            const userId = req.user.userId;

            // Check if conversation already exists with this participant (regardless of product)
            let conversation = await Conversation.findOne({
                participants: { $all: [userId, participantId] }
            });

            if (!conversation) {
                // Create new conversation
                conversation = new Conversation({
                    participants: [userId, participantId],
                    product: productId, // Still store the initial product for reference
                    isRead: {
                        [userId]: true,
                        [participantId]: false
                    }
                });
                await conversation.save();
            }

            // Create the initial message (with product reference if provided)
            const message = new Message({
                conversation: conversation._id,
                sender: userId,
                content: initialMessage,
                productRef: productId // Store product reference in the message
            });

            await message.save();

            // Update conversation with last message
            conversation.lastMessage = message._id;
            await conversation.save();

            // Return the populated conversation
            const populatedConversation = await Conversation.findById(conversation._id)
                .populate("participants", "username profilePicture")
                .populate("product", "title imageUrl price")
                .populate("lastMessage");

            res.status(201).json(populatedConversation);
        } catch (error) {
            console.error("Error creating conversation:", error);
            next(error);
        }
    }
);

// Get all conversations for a user
router.get("/conversations", authMiddleware, async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const conversations = await Conversation.find({
            participants: userId
        })
            .populate("participants", "username profilePicture")
            .populate("product", "title imageUrl price")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (error) {
        next(error);
    }
});

// Get messages for a conversation
router.get(
    "/conversations/:conversationId/messages",
    authMiddleware,
    async (req, res, next) => {
        try {
            const { conversationId } = req.params;
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            // Verify user is part of the conversation
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: userId
            });

            if (!conversation) {
                return res.status(403).json({ message: "Access denied to this conversation" });
            }

            // Get messages with pagination (newest first)
            const messages = await Message.find({ conversation: conversationId })
                .populate("sender", "username profilePicture")
                .populate("productRef", "title")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Get total messages count
            const totalMessages = await Message.countDocuments({
                conversation: conversationId
            });

            // Mark messages as read
            await Message.updateMany(
                {
                    conversation: conversationId,
                    sender: { $ne: userId },
                    isRead: false
                },
                { isRead: true }
            );

            // Update conversation read status
            conversation.isRead.set(userId.toString(), true);
            await conversation.save();

            res.json({
                messages: messages.reverse(), // Reverse to get chronological order
                totalPages: Math.ceil(totalMessages / limit),
                currentPage: page,
                totalMessages
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;