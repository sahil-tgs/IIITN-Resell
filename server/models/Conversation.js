// server/models/Conversation.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }],
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: false // Optional, for product-specific conversations
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        isRead: {
            type: Map,
            of: Boolean,
            default: {} // Will store userId: boolean pairs
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
